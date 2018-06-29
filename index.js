const Discord = require('discord.js');
const config = require('./config.js');
const serviceAccount = require('./serviceAccount.json');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const youtubeListener = require('./youtubeListener.js');
const submissionListener = require('./submissionListener.js');
const longReadsListener = require('./longReadsListener.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('sqlite:db.sqlite');

const Commando = require('discord.js-commando');

// Create an instance of a Discord client
const client = new Commando.Client({
  commandPrefix: 'trt'
});

client.sequelize= sequelize;

client
  .on('error', console.error)
  .on('warn', console.warn)
  .on('debug', console.log)
  .on('ready', () => {
    console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
  })
  .on('disconnect', () => { console.warn('Disconnected!'); })
  .on('reconnecting', () => { console.warn('Reconnecting...'); })
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

client.registry
  .registerGroup('math', 'Math')
  .registerDefaultTypes()
  .registerGroup('util', 'Utilities')
  .registerGroup('topics', 'Topics')
  .registerGroup('submissions', 'Submissions')
  .registerDefaultCommands({
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

const commandHelpers = {
  help: (channel, args) => {
    channel.send('Unimplemented help')
  },
  add: (channel, args) => {
    const topic = args.join(' ');
    database.collection('topics').add({
      topic,
      createdAt: new Date(),
    }).then(() => {
      channel.send('Topic saved!');
    });
  },
  list: (channel, args) => {
    var message = 'Topics:\n';
    database.collection('topics').get().then(snap => {
      snap.docs.forEach(doc => {
        const docData = doc.data();
        message += `\t• ${docData.topic}\n`;
      });
      channel.send(message);
    });
  }
}

const MESSAGE_LISTENERS = [
  youtubeListener,
  submissionListener(sequelize),
  longReadsListener,
];

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
  client.user.setUsername("The Round Bot");
  client.user.setPresence({ game: { name: 'The Cloud' }, status: 'online' })
}).on('message', (message) => {
  MESSAGE_LISTENERS.forEach(listener => listener(message));
});

// Log our bot in
client.login(config.DISCORD_TOKEN);
