const discord = require('discord.js');
const truncate = require('truncate');
const fetch = require('node-fetch');
const oneLine = require('common-tags').oneLine;
const BaseMessageListener = require('./baseMessageListener.js');

const OPEN_REVIEW_REGEX = /(https?:\/\/)openreview\.net\/(pdf)\?id=(\w+)/;

class OpenReviewListener extends BaseMessageListener {
  constructor() {
    super({
      name: 'open-review',
      description: oneLine`Responds to OpenRevie links with metadata about the
        paper and the paper's abstract.`,
      linkRegex: OPEN_REVIEW_REGEX,
    });
  }

  async onMessage(message, { link }) {
    const match = link.match(OPEN_REVIEW_REGEX);
    const identifier = match[3];

    const res = await fetch(`https://openreview.net/notes/?id=${identifier}`);
    if (!res.ok) {
      console.error(
        "Couldn't get OpenReview metadata for paper: " + identifier
      );
      return;
    }

    const openReviewData = await res.json();
    const notes = openReviewData.notes;
    if (!notes) {
      return;
    }
    const article = notes[0];
    if (!article) {
      return;
    }

    const embed = new discord.RichEmbed()
      .setTitle(`📄 [OpenReview] "${article.content.title}"`)
      .setDescription(
        truncate(article.content.abstract.replace(/\n|\r/g, ' '), 1500) ||
          'No abstract'
      )
      .addField(
        'Authors',
        article.content.authors.join(', ') || 'No listed authors'
      );
    if (article.content['TL;DR']) {
      embed.addField('TL;DR', article.content['TL;DR']);
    }
    await message.reply({ embed });
  }
}

module.exports = OpenReviewListener;
