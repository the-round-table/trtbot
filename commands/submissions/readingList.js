const commando = require('discord.js-commando');
const ReadingListGenerator = require('../../actions/readingListGenerator.js');

module.exports = class ReadingListCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'readinglist',
      memberName: 'readinglist',
      group: 'submissions',
      description: 'List the stories that have been posted today',
      examples: ['readinglist'],
      guildOnly: false
    });

    this.readingListGenerator = new ReadingListGenerator(client.Submissions);
  }

  async run(msg, args) {
    const guildId = msg.guild ? msg.guild.id : undefined;

    msg.reply({
      embed: await this.readingListGenerator.generate({guildId})
    });

  }
};
