const arxiv = require('arxiv');
const utils = require('../utils.js');
const discord = require('discord.js');
const truncate = require('truncate');
const moment = require('moment');

const ARXIV_REGEX = /(https?:\/\/)arxiv\.org\/(pdf|abs)\/(\d{4}\.\d{5})/;

module.exports = async message => {
  const link = utils.getPostedUrl(message);
  if (link) {
    console.log(link, ARXIV_REGEX, link.match(ARXIV_REGEX));
  }
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
    console.log(article);
    const embed = new discord.RichEmbed()
      .setTitle(`📄 [Arxiv] "${article.title}"`)
      .setDescription(truncate(article.summary, 1500))
      .addField(
        'Authors',
        article.authors.map(author => author.name).join(', ')
      )
      .addField('Published At', moment(article.published).format('LL'))
      .addField('Last Updated', moment(article.updated).format('LL'))
      .addField('Read Here:', `https://www.arxiv-vanity.com/papers/${identifier}`);
    message.reply({ embed });
  });
};
