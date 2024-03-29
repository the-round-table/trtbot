const config = require('../../config.js');
const utils = require('../../utils.js');
const discord = require('discord.js');
const commando = require('discord.js-commando');
const truncate = require('truncate');

const MorningPaperGenerator = require('../../actions/morningPaperGenerator.js');

module.exports = class MorningPaperCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'paper',
      memberName: 'paper',
      group: 'feeds',
      description: 'Gets the latest stuff to read',
      examples: [
        'paper',
        'paper add Quanta Magazine - https://api.quantamagazine.com/feed',
        'paper remove Quanta Magazine',
        'paper source',
        'paper list',
        'paper pages 5',
        'paper rename Quanta Magazine - Quanta',
      ],
      guildOnly: true,
    });

    this.generator = new MorningPaperGenerator(config.RSS_FEEDS_LIST);
  }

  async run(msg) {
    const channel = msg.channel;

    let message = msg.content.trim().replace(/.*? paper\s*/, '');
    if (!message.toLowerCase().replace(/\s/g, '').length) {
      await msg.react('🗞');
      const paper = await this.generator.generate();
      paper
        .andThen(embeds => {
          for (let embed of embeds) {
            channel.send({ embed });
          }
        })
        .orElse(_ => {
          channel.send('Failed to generate paper');
        });
    } else if (message.toLowerCase().startsWith('pages')) {
      const numPagesStr = message.replace('pages', '');
      if (isNaN(numPagesStr)) {
        channel.send(
          'Unparsible RSS command :frowning: (Pages arg needs to be number)'
        );
      } else {
        let numPages = parseInt(message, 10);
        await this.generator.generate(numPages).match(
          embeds => {
            for (let embed of embeds) {
              channel.send({ embed });
            }
          },
          err => {
            channel.send(err);
          }
        );
      }
    } else if (message.toLowerCase().startsWith('add')) {
      message = message.replace('add', '');
      message = message.trim();
      await this.addFeed(channel, message);
    } else if (message.toLowerCase().startsWith('remove')) {
      message = message.replace('remove', '');
      message = message.trim();
      this.removeFeed(channel, message);
    } else if (message.toLowerCase().startsWith('rename')) {
      await msg.react('🗞');
      await this.renameFeed(channel, message.replace('rename', ''));
    } else if (
      message.toLowerCase().startsWith('sources') ||
      message.toLowerCase().startsWith('list')
    ) {
      await msg.react('🗞');
      this.listFeeds(channel);
    } else {
      channel.send(
        'Unparsible RSS command :frowning: (valid commands: add, remove, list, sources, pages)'
      );
    }
  }

  async addFeed(channel, subcommand) {
    let [feedTitle, ...feedUrl] = utils.argparse(subcommand);
    let result = await this.generator.addFeed(
      feedTitle.trim(),
      feedUrl[0].trim()
    );
    result
      .andThen(_ =>
        channel.send(`Successfully added ${feedTitle} to the source list`)
      )
      .orElse(err =>
        channel.send(
          `Failed to add ${feedTitle} to the source list (err: ${err.message})`
        )
      );
  }

  async renameFeed(channel, subcommand) {
    let [oldName, ...newName] = subcommand.split('-');
    oldName = oldName.trim();
    newName = newName[0].trim();
    let result = await this.generator.renameFeed(oldName, newName);
    result
      .andThen(_ =>
        channel.send(`Successfully renamed ${oldName} to ${newName}`)
      )
      .orElse(err => channel.send(`Failed to rename ${oldName} (err: ${err})`));
  }

  removeFeed(channel, subcommand) {
    this.generator
      .removeFeed(subcommand)
      .andThen(_ =>
        channel.send(`Successfully removed ${subcommand} to the source list`)
      )
      .orElse(err =>
        channel.send(
          `Failed to remove ${subcommand} to the source list (err: ${
            err.message
          })`
        )
      );
  }

  listFeeds(channel) {
    this.generator.listFeeds().match(
      feeds => {
        let paginatedSources = this.paginateList(feeds);
        let pageNum = 1;
        for (let page of paginatedSources) {
          let fieldChars = 0;
          const embed = new discord.RichEmbed()
            .setTitle(
              `📰  Morning Paper Sources (Page ${pageNum}/${[
                paginatedSources.length,
              ]})`
            )
            .addField(
              'Sources:',
              page
                .map(feed => {
                  const line = `- [${truncate(feed.source, 75)}](${feed.url})`;
                  fieldChars += line.length + 1;
                  return fieldChars <= 1024 ? line : '';
                })
                .join('\n')
            );
          channel.send({ embed });
          pageNum++;
        }
      },
      err => {
        channel.send('RSS system is not active');
      }
    );
  }

  paginateList(sources) {
    let numPages = Math.ceil(JSON.stringify(sources).length / 2048) + 1; // Working around 1024 limit with a tuned number
    let numSourcesPerPage = sources.length / numPages;
    let paginatedSources = [];
    for (let i = 0; i < sources.length; i += numSourcesPerPage) {
      paginatedSources.push(sources.slice(i, i + numSourcesPerPage));
    }
    return paginatedSources;
  }
};
