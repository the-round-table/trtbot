const config = require('../../config.js');
const discord = require('discord.js');
const commando = require('discord.js-commando');
const truncate = require('truncate');

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
                 'paper remove Quanta Magazine',
                 'paper source',
                 'paper list',
                 'paper pages 5'],
      guildOnly: true,
    });

    this.generator = new MorningPaperGenerator(config.RSS_FEEDS_LIST);
  }

  async run(msg) {
    const channel = msg.channel;

    let message = msg.content.replace('trt paper', '');
    message = message.trim();
    if (!message.replace(/\s/g, '').length) {
      const paper = await this.generator.generate();
      paper.andThen(embeds => {
        for (let embed of embeds) {
          channel.send({embed});
        }
      }).orElse( _ => {
        channel.send("Failed to generate paper");
      });
    } else if (message.startsWith('pages')) {
      const numPagesStr = message.replace('pages', '');
      if (isNaN(numPagesStr)) {
        channel.send('Unparsible RSS command :frowning: (Pages arg needs to be number');
      } else {
        let numPages = parseInt(message, 10);
        await this.generator.generate(numPages).match(
          embeds => {
            for (let embed of embeds) {
              channel.send({embed});
            }
          }, err => {
            channel.send(err);
          }
        );
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
      channel.send('Unparsible RSS command :frowning: (valid commands: add, remove, list, source, pages');
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
    this.generator.listFeeds().match(list => {
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
      }, err => {
        channel.send('RSS system is not active');
      }); 
  }
};
