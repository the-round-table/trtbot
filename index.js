const Discord = require('discord.js');
const config = require('./config.js');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const Sequelize = require('sequelize');
const Commando = require('discord.js-commando');
var CronJob = require('cron').CronJob;

const youtubeListener = require('./listeners/youtubeListener.js');
const submissionListener = require('./listeners/submissionListener.js');
const longReadsListener = require('./listeners/longReadsListener.js');
const messageListener = require('./listeners/messageListener.js');

const presenceGenerator = require('./actions/presenceGenerator.js');
const ReadingListGenerator = require('./actions/readingListGenerator.js');

const sequelize = new Sequelize('sqlite:db.sqlite', { logging: false });
const Submissions = sequelize.import(__dirname + '/models/submission.js');
const Messages = sequelize.import(__dirname + '/models/message.js');

// Create database tables
Submissions.sync();
Messages.sync();

// Create an instance of a Discord client
const client = new Commando.Client({
  commandPrefix: 'trt'
});

client.Submissions = Submissions;

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
  })
  .on('disconnect', () => {
    console.warn('Disconnected!');
  })
  .on('reconnecting', () => {
    console.warn('Reconnecting...');
  })
  .on('commandError', (cmd, err) => {
    if (err instanceof Commando.FriendlyError) return;
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

// client.registry
//   .registerDefaultTypes()
//   .registerGroup('util', 'Utilities')
//   .registerGroup('topics', 'Topics')
//   .registerGroup('submissions', 'Submissions')
//   .registerDefaultCommands({
//     commandState: false
//   })
//   .registerCommandsIn(path.join(__dirname, 'commands'));
//

const commandHelpers = {
  help: (channel, args) => {
    channel.send('Unimplemented help');
  },
  add: (channel, args) => {
    const topic = args.join(' ');
    database
      .collection('topics')
      .add({
        topic,
        createdAt: new Date()
      })
      .then(() => {
        channel.send('Topic saved!');
      });
  },
  list: (channel, args) => {
    var message = 'Topics:\n';
    database
      .collection('topics')
      .get()
      .then(snap => {
        snap.docs.forEach(doc => {
          const docData = doc.data();
          message += `\t• ${docData.topic}\n`;
        });
        channel.send(message);
      });
  }
};

const MESSAGE_LISTENERS = [
  youtubeListener,
  submissionListener(sequelize, Submissions),
  longReadsListener,
  messageListener(Messages)
];

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client
  .on('ready', () => {
    client.user.setUsername('The Round Bot');
    client.user.setPresence({
      game: { name: presenceGenerator() },
      status: 'online'
    });
  })
  .on('message', message => {
    MESSAGE_LISTENERS.forEach(listener => listener(message));
  });

// Log our bot in
client.login(config.DISCORD_TOKEN);

// Periodically refresh the bot's presence
new CronJob('0 * * * * *', () => {
  client.user.setPresence({
    game: { name: presenceGenerator() },
    status: 'online'
  });
});

// Send a reading list every day at 7pm
const readingListGenerator = new ReadingListGenerator(Submissions);
new CronJob('0 0 19 * * *', () => {
  client.guilds.forEach(guild => {
    guild.channels.forEach(async channel => {
      if (channel.name === 'another-channel') {
        const message = await readingListGenerator.generate({
          guildId: guild.id
        });
        channel.send(message);
      }
    });
  });
}, null, true, 'America/Los_Angeles');