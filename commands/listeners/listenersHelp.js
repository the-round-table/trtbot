const commando = require('discord.js-commando');
const stripIndents = require('common-tags').stripIndents;

module.exports = class ListenerHelpCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'listener-help',
      memberName: 'listener-help',
      aliases: ['lhelp', 'listeners-help'],
      group: 'listeners',
      description: 'Lists enabled listeners',
      guildOnly: false,
    });
  }

  async run(msg) {
    const listeners = this.client.listenerRegistry.getListeners();
    if (msg.guild) {
      await msg.reply('I just sent you a PM with more info');
    }

    const listenersInfo = listeners
      .map(listener => `**${listener.name}**: ${listener.description}`)
      .sort()
      .join('\n');

    const response = stripIndents`
      Listeners allow certain actions to be run by the bot without needing a command prefix.
      An example of a listener is one that replies with the length of a Youtube video for Youtube links.
      
      __Enabled Listeners__:
      ${listenersInfo}`;

    await msg.author.send(response);
  }
};
