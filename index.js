const config = require('./config.js');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const Sequelize = require('sequelize');
const Commando = require('discord.js-commando');
const utils = require('./utils.js');
const fs = require('fs');
const glob = require('glob');
var CronJob = require('cron').CronJob;

const arxivListener = require('./listeners/arxivListener.js');
const githubListener = require('./listeners/githubListener.js');
const longReadsListener = require('./listeners/longReadsListener.js');
const messageListener = require('./listeners/messageListener.js');
const stockListener = require('./listeners/stockListener.js');
const submissionListener = require('./listeners/submissionListener.js');
const texListener = require('./listeners/texListener.js');
const xpostListener = require('./listeners/xpostListener.js');
const youtubeListener = require('./listeners/youtubeListener.js');

const ChannelRearranger = require('./actions/channelRearranger.js');
const DeadChannelCop = require('./actions/deadChannelCop.js');
const presenceGenerator = require('./actions/presenceGenerator.js');
const ReadingListGenerator = require('./actions/readingListGenerator.js');
const StatsGenerator = require('./actions/statsGenerator.js');
const ReminderBot = require('./actions/reminderBot.js');

const sequelize = new Sequelize('sqlite:db.sqlite', { logging: false });
const Messages = sequelize.import(__dirname + '/models/message.js');
const Reminders = sequelize.import(__dirname + '/models/reminder.js');
const Submissions = sequelize.import(__dirname + '/models/submission.js');

// Create database tables
Messages.sync();
Reminders.sync();
Submissions.sync();

const deadChannelCop = new DeadChannelCop(Messages);
const readingListGenerator = new ReadingListGenerator(Submissions);
const statsGenerator = new StatsGenerator(Messages);
const channelRearranger = new ChannelRearranger(statsGenerator);

// Create an instance of a Discord client
const client = new Commando.Client({
  commandPrefix: 'trt',
});

client.channelRearranger = channelRearranger;
client.Messages = Messages;
client.Reminders = Reminders;
client.Submissions = Submissions;

const reminderBot = new ReminderBot(client, Reminders);

client
  .on('error', console.error)
  .on('warn', console.warn)
  .on('debug', console.log)
  .on('ready', () => {
    console.log(
      `Client ready; logged in as ${client.user.username}#${
        client.user.discriminator
      } (${client.user.id})`
    );

    setupSchedule();
  })
  .on('disconnect', () => {
    console.warn('Disconnected!');
  })
  .on('reconnecting', () => {
    console.warn('Reconnecting...');
  })
  .on('commandError', (cmd, err) => {
    if (err instanceof Commando.FriendlyError) {
      return;
    }
    console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
  })
  .on('commandBlocked', (msg, reason) => {
    console.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
  })
  .on('commandPrefixChange', (guild, prefix) => {
    console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
  })
  .on('commandStatusChange', (guild, command, enabled) => {
    console.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
  })
  .on('groupStatusChange', (guild, group, enabled) => {
    console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
  });

client.registry
  .registerDefaultTypes()
  .registerGroup('util', 'Utilities')
  .registerGroup('submissions', 'Submissions')
  .registerGroup('moderation', 'Moderation')
  .registerGroup('reminders', 'Reminders')
  .registerDefaultCommands({
    commandState: false,
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

const MESSAGE_LISTENERS = [
  youtubeListener,
  githubListener,
  arxivListener,
  longReadsListener,
  stockListener,
  texListener,
  xpostListener,
  submissionListener(sequelize, Submissions),
  messageListener(Messages),
];

// The ready event is vital, it means that your bot will only start reacting to
// information from Discord _after_ ready is emitted
client
  .on('ready', () => {
    client.user.setUsername('The Round Bot');
    client.user.setPresence({
      game: { name: presenceGenerator() },
      status: 'online',
    });
  })
  .on('message', async message => {
    for (let listener of MESSAGE_LISTENERS) {
      try {
        await listener(message);
      } catch (e) {
        console.error(e);
      }
    }
  });

// Log our bot in
client.login(config.DISCORD_TOKEN);

const SCHEDULE = [
  // Periodically refresh the bot's presence
  {
    schedule: '0 30 * * * *', // Every hour
    callback: () => {
      client.user.setPresence({
        game: { name: presenceGenerator() },
        status: 'online',
      });
    },
  },
  // Post reading list
  {
    schedule: '0 0 6 * * *', // Every day at 6am
    callback: () => {
      console.log('Generating reading list');
      client.guilds.forEach(async guild => {
        const readingListMessage = await readingListGenerator.generate({
          guildId: guild.id,
        });
        utils.postEmbedToChannel(
          guild,
          readingListMessage,
          config.READING_LIST_CHANNEL
        );
      });
    },
  },
  // Post guild stats
  {
    schedule: '0 0 19 * * 0', // Every Sunday at 7pm
    callback: () => {
      console.log('Generating guild stats');
      client.guilds.forEach(async guild => {
        const channelStats = await statsGenerator.generateChannelMessageStats(
          guild
        );
        utils.postEmbedToChannel(
          guild,
          channelStats,
          config.ANNOUNCEMENTS_CHANNEL
        );

        const messageStats = await statsGenerator.generateUserMessageStats(
          guild
        );
        utils.postEmbedToChannel(
          guild,
          messageStats,
          config.ANNOUNCEMENTS_CHANNEL
        );
      });
    },
  },
  // Post dead channel report
  {
    schedule: '30 0 6 * * 1', // Every Monday at 6:00:30am
    callback: async () => {
      console.log('Generating dead channels report');
      client.guilds.forEach(async guild => {
        const deadChannelReport = await deadChannelCop.generateDeadChannelReport(
          guild
        );
        if (deadChannelReport) {
          utils.postEmbedToChannel(
            guild,
            deadChannelReport,
            config.ANNOUNCEMENTS_CHANNEL
          );
        }
      });
    },
  },
  // Rearrange channels based on activity
  {
    schedule: '0 30 19 * * 0', // Every Sunday at 7:30pm
    callback: async () => {
      console.log('Rearranging channels');
      client.guilds.forEach(async guild => {
        channelRearranger.rearrangeByActivity(guild);
        utils.postTextToChannel(
          guild,
          '🔄 Rearranged channels by activity',
          config.ANNOUNCEMENTS_CHANNEL
        );
      });
    },
  },
  // Delete old equations
  {
    schedule: '0 30 19 * * 0', // Every Sunday at 7:30pm
    callback: async () => {
      console.log('Deleting old equation images');
      var files = glob('/tmp/*.png', null, (err, files) => {
        if (!err) {
          for (let f in files) {
            fs.unlink(f).catch(er => {
              console.log(`Failed to delete file ${f}: ${er}`);
            });
          }
        } else {
          console.log(err);
        }
      });
    },
  },
  {
    schedule: '*/10 * * * * *', // Every 10 seconds
    callback: async () => {
      await reminderBot.pollReminders();
    },
  },
];

function setupSchedule() {
  SCHEDULE.forEach(
    scheduleItem =>
      new CronJob(
        scheduleItem.schedule,
        scheduleItem.callback,
        null,
        true,
        'America/Los_Angeles'
      )
  );
}
