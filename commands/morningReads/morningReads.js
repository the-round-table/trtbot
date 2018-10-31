const config = require('../../config.js');
const commando = require('discord.js-commando');
const MorningReadsGenerator = require('../../actions/morningReadsGenerator.js')

module.exports = class MorningReadsCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'reads',
      memberName: 'reads',
      group: 'feeds',
      description: 'Gets the latest stuff to read',
      examples: ['reads',
                 'reads add Quanta Magazine - https://api.quantamagazine.com/feed',
                 'reads remove Quanta Magazine'],
      guildOnly: true,
    });

    this.generator = new MorningReadsGenerator(config.RSS_FEEDS_LIST);
  }

  async run(msg) {
    const channel = msg.channel;

    let message = msg.content.replace('trt reads', '');
    message = message.trim();
    if (!message.replace(/\s/g, '').length) {
      const embed = await this.generator.generate();
      channel.send({embed});
 
    } else if (message.startsWith('add'))  {
      message = message.replace('add', '');
      message = message.trim();
      this.addFeed(message);
    } else if (message.startsWith('remove')) {
      message = message.replace('remove', '');
      message = message.trim();
      this.removeFeed(message);
    } else { 
      channel.send("Unparsible RSS command :frowning:");
    }
  }

  addFeed(subcommand) {
    let [feedTitle, ...feedUrl] = subcommand.split('-');
    this.generator.addFeed(feedTitle.trim(), feedUrl[0].trim());
  } 

  removeFeed(subcommand) {
    this.generator.removeFeed(subcommand);
  }
};
