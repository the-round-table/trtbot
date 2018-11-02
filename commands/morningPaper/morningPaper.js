const config = require('../../config.js');
const discord = require('discord.js');
const commando = require('discord.js-commando');
const truncate = require('truncate');
const Result = require('result-js');

const MorningPaperGenerator = require('../../actions/morningPaperGenerator.js')

module.exports = class MorningPaperCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'paper',
      memberName: 'paper',
      group: 'feeds',
      description: 'Gets the latest stuff to read',
      examples: ['paper',
                 'paper add Quanta Magazine - https://api.quantamagazine.com/feed',
                 'paper remove Quanta Magazine'],
      guildOnly: true,
    });

    this.generator = new MorningPaperGenerator(config.RSS_FEEDS_LIST);
  }

  async run(msg) {
    const channel = msg.channel;

    let message = msg.content.replace('trt paper', '');
    message = message.trim();
    if (!message.replace(/\s/g, '').length) {
      const embeds = await this.generator.generate();
      for (let embed of embeds) {
        channel.send({embed});
      }
    } else if (message.startsWith('pages')) {
      message = message.replace('pages', '');
      let numPages = parseInt(message, 10);
      const embeds = await this.generator.generate(numPages);
      for (let embed of embeds) {
        channel.send({embed});
      }
    } else if (message.startsWith('add'))  {
      message = message.replace('add', '');
      message = message.trim();
      await this.addFeed(channel, message);
    } else if (message.startsWith('remove')) {
      message = message.replace('remove', '');
      message = message.trim();
      this.removeFeed(channel, message);
    } else if (message.startsWith('sources') || message.startsWith('list')) {
      this.listFeeds(channel);
    } else { 
      channel.send("Unparsible RSS command :frowning:");
    }
  }

  async addFeed(channel, subcommand) {
    let [feedTitle, ...feedUrl] = subcommand.split('-');
    let result = await this.generator.addFeed(feedTitle.trim(), feedUrl[0].trim());
    result.andThen(_ => channel.send(`Successfully added ${feedTitle} to the source list`))
          .orElse(err => channel.send(`Failed to add ${feedTitle} to the source list (err: ${err.message})`));  
  } 

  removeFeed(channel, subcommand) {
    this.generator.removeFeed(subcommand)
      .andThen(_ => channel.send(`Successfully removed ${subcommand} to the source list`))
      .orElse(err => channel.send(`Failed to remove ${subcommand} to the source list (err: ${err.message})`));  
  }

  listFeeds(channel) {
    let feeds = this.generator.listFeeds();
    console.log(feeds);
    let fieldChars = 0;
    const embed = new discord.RichEmbed()
      .setTitle(
        `📰  Morning Paper Sources`
      ).addField("Sources:", feeds.map(feed => {
        const line = `- [${truncate(feed.source, 75)}](${feed.url})`;
        fieldChars += line.length + 1;
        return fieldChars <= 1024 ? line : '';
      })
      .join('\n'));

    channel.send({embed});
  }
};
