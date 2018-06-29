const commando = require('discord.js-commando');

module.exports = class RecordTopicCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'record-topic',
      group: 'topics',
      memberName: 'record-topic',
      description: 'Record the current topic',
      examples: ['record-topic "Ethics of AI"'],
      guildOnly: true,

      args: [
        {
          key: 'topic',
          label: 'topic',
          prompt: 'What topic do you want to record?',
          type: 'string'
        }
      ]
    });

    this.dbRef = client.dbRef;
  }

  async run(msg, args) {
    const topic = args.topic;

    return this.dbRef
      .collection('topics')
      .add({
        topic,
        author: msg.author.id,
        channel: msg.channel.id,
        msgId: msg.id
      })
      .then(() => msg.reply(`Topic Saved!`));
  }
};
