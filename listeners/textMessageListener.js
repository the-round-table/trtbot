const BaseMessageListener = require('./baseMessageListener.js');

class TextMessageListener extends BaseMessageListener {
  constructor(Messages) {
    super({ name: 'messages' });
    this.Messages = Messages;
  }

  async onMessage(message) {
    if (!message.guild) {
      return;
    }

    this.Messages.findOrCreate({
      where: {
        id: message.id,
      },
      defaults: {
        channel: message.channel.name,
        guildId: message.guild.id,
        submitter: message.author.username,
      },
    });
  }
}

module.exports = TextMessageListener;
