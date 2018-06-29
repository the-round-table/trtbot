const commando = require('discord.js-commando');

module.exports = class ListTopicsCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'list-topics',
      group: 'topics',
      memberName: 'list-topics',
      description: 'List known topics',
      examples: ['user-info @Crawl#3208', 'user-info Crawl'],
      guildOnly: false
    });

    this.dbRef = client.dbRef;
  }

  async run(msg, args) {
    return this.dbRef
      .collection('topics')
      .get()
      .then(snap => {
        snap.forEach(doc => {
          msg.reply(JSON.stringify(doc.data()));
        });
      });
  }
};
