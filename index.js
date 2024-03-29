const config = require('./config.js');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const Sequelize = require('sequelize');
const Commando = require('discord.js-commando');
const utils = require('./utils.js');
var schedule = require('node-schedule');

const ArxivListener = require('./listeners/arxivListener.js');
const AppleNewsListener = require('./listeners/appleNewsListener.js');
const DoiListener = require('./listeners/doiListener.js');
const GithubListener = require('./listeners/githubListener.js');
const LongReadsListener = require('./listeners/longReadsListener.js');
const MemeListener = require('./listeners/memeListener.js');
const OpenReviewListener = require('./listeners/openReviewListener.js');
const ProTipListener = require('./listeners/protipListener.js');
const StockListener = require('./listeners/stockListener.js');
const SubmissionListener = require('./listeners/submissionListener.js');
const SubredditListener = require('./listeners/subredditListener.js');
const TexListener = require('./listeners/texListener.js');
const TextMessageListener = require('./listeners/textMessageListener.js');
const XpostListener = require('./listeners/xpostListener.js');
const YoutubeListener = require('./listeners/youtubeListener.js');

const ListenerRegistry = require('./listeners/listenerRegistry.js');

const ChannelRearranger = require('./actions/channelRearranger.js');
const DeadChannelCop = require('./actions/deadChannelCop.js');
const MorningPaperGenerator = require('./actions/morningPaperGenerator.js');
const presenceGenerator = require('./actions/presenceGenerator.js');
const ReadingListGenerator = require('./actions/readingListGenerator.js');
const ReminderBot = require('./actions/reminderBot.js');
const StatsGenerator = require('./actions/statsGenerator.js');

const sequelize = new Sequelize('sqlite:db.sqlite', { logging: false });
const Memes = sequelize.import(__dirname + '/models/meme.js');
const Messages = sequelize.import(__dirname + '/models/message.js');
const ProTips = sequelize.import(__dirname + '/models/protip.js');
const Reminders = sequelize.import(__dirname + '/models/reminder.js');
const Submissions = sequelize.import(__dirname + '/models/submission.js');

// Create database tables
Memes.sync();
Messages.sync();
ProTips.sync();
Reminders.sync();
Submissions.sync();

const deadChannelCop = new DeadChannelCop(Messages);
const readingListGenerator = new ReadingListGenerator(Submissions);
const morningPaperGenerator = new MorningPaperGenerator(config.RSS_FEEDS_LIST);
const statsGenerator = new StatsGenerator(Messages);
const channelRearranger = new ChannelRearranger(statsGenerator);

const listenerRegistry = new ListenerRegistry();

// Create an instance of a Discord client
const client = new Commando.Client({
  commandPrefix: 'trt',
});

const sqlite = require('sqlite');

client
  .setProvider(
    sqlite
      .open(path.join(__dirname, 'commando.sqlite'))
      .then(db => new Commando.SQLiteProvider(db))
  )
  .catch(console.error);

client.channelRearranger = channelRearranger;
client.Messages = Messages;
client.Reminders = Reminders;
client.Submissions = Submissions;
client.ProTips = ProTips;
client.Memes = Memes;

client.listenerRegistry = listenerRegistry;

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
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerGroup('util', 'Utilities')
  .registerGroup('submissions', 'Submissions')
  .registerGroup('moderation', 'Moderation')
  .registerGroup('reminders', 'Reminders')
  .registerGroup('github', 'Github')
  .registerGroup('listeners', 'Listeners')
  .registerGroup('feeds', 'Feeds')
  .registerGroup('stats', 'Stats')
  .registerGroup('memes', 'Memes')
  .registerCommandsIn(path.join(__dirname, 'commands'));

listenerRegistry.registerListeners(
  new YoutubeListener(),
  new GithubListener(),
  new ArxivListener(),
  new AppleNewsListener(),
  new DoiListener(),
  new LongReadsListener(),
  new StockListener(),
  new TexListener(),
  new XpostListener(),
  new SubmissionListener(sequelize, Submissions),
  new TextMessageListener(Messages),
  new ProTipListener(ProTips),
  new SubredditListener(),
  new OpenReviewListener(),
  new MemeListener(Memes)
);

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
    for (let listener of listenerRegistry.getListeners()) {
      try {
        listener.handleMessage(message);
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
  //Post the Morning Reads
  {
    schedule: '0 0 6 * * *', // Every day at 6am
    callback: () => {
      console.log('Fetching Morning Paper');
      client.guilds.forEach(async guild => {
        const morningPaper = await morningPaperGenerator.generate();
        morningPaper
          .andThen(morningPaperEmbeds => {
            for (let embed of morningPaperEmbeds) {
              utils.postEmbedToChannel(
                guild,
                embed,
                config.MORNING_READS_CHANNEL
              );
            }
          })
          .orElse(_ => {
            utils.postTextToChannel(
              guild,
              'Unable to generate todays Morning Paper',
              config.MORNING_READS_CHANNEL
            );
          });
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
  {
    schedule: '*/10 * * * * *', // Every 10 seconds
    callback: async () => {
      await reminderBot.pollReminders();
    },
  },
];

function setupSchedule() {
  // Cancel any outstanding jobs
  Object.values(schedule.scheduledJobs).forEach(job => job.cancel());
  SCHEDULE.forEach(scheduleItem =>
    schedule.scheduleJob(
      { rule: scheduleItem.schedule, tz: 'America/Los_Angeles' },
      scheduleItem.callback
    )
  );
}
