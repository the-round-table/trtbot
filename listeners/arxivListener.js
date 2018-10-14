const arxiv = require('arxiv');
const utils = require('../utils.js');
const discord = require('discord.js');
const truncate = require('truncate');
const moment = require('moment');
const oneLine = require('common-tags').oneLine;
const BaseMessageListener = require('./baseMessageListener.js');

const ARXIV_REGEX = /(https?:\/\/)arxiv\.org\/(pdf|abs)\/(\d{4}\.\d{5})/;

class ArxivListener extends BaseMessageListener {
  constructor() {
    super({
      name: 'arxiv',
      description: oneLine`Responds to Arxiv links with metadata about the
        paper, the paper's abstract, and an Arxiv-Vanity link.`,
    });
  }

  async onMessage(message) {
    const link = utils.getPostedUrl(message);
    if (!link || !link.match(ARXIV_REGEX)) {
      return;
    }

    const match = link.match(ARXIV_REGEX);
    const identifier = match[3];

    arxiv.search({ id: identifier }, (err, results) => {
      if (err) {
        console.error(err);
        return;
      } else if (results.items.length == 0) {
        return;
      }

      const article = results.items[0];
      const embed = new discord.RichEmbed()
        .setTitle(`📄 [Arxiv] "${article.title}"`)
        .setDescription(truncate(article.summary, 1500))
        .addField(
          'Authors',
          article.authors.map(author => author.name).join(', ')
        )
        .addField('Published At', moment(article.published).format('LL'))
        .addField('Last Updated', moment(article.updated).format('LL'))
        .addField(
          'Read Here:',
          `https://www.arxiv-vanity.com/papers/${identifier}`
        );
      message.reply({ embed });
    });
  }
}

module.exports = ArxivListener;
