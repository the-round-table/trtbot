const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require('lodash');
const discord = require('discord.js');
const moment = require('moment');
const truncate = require('truncate');
const URL = require('url').URL;

const BLACKLISTED_SITES = [
  'giphy.com',
  'twitter.com',
  'facebook.com',
  'instagram.com',
  'itunes.apple.com',
  'amazon.com',
  'instagram.com'
];

function isBlacklisted(url) {
  const urlObj = new URL(url);
  return _.some(BLACKLISTED_SITES, blacklist =>
    _.endsWith(urlObj.host, blacklist)
  );
}

class ReadingListGenerator {
  constructor(Submissions) {
    this.Submissions = Submissions;
  }

  async generate(options = {}) {
    const query = {
      createdAt: {
        [Op.gt]: moment()
          .subtract(1, 'days')
          .toDate()
      }
    };

    if (options.guildId) {
      query.guildId = options.guildId;
    }

    const records = (await this.Submissions.findAll({
      where: query,
      order: ['createdAt']
    })).map(record => record.get({ plain: true }));

    const embed = new discord.RichEmbed().setTitle(
      `📚 Reading List for ${moment().format('MMMM D, YYYY')}`
    );

    if (records.length === 0) {
      embed.setDescription('Nothing posted today. 😭');
      return embed;
    } else {
      embed.setDescription("Here's what was posted to the Discord today:");
    }

    _.chain(records)
      .filter(record => !isBlacklisted(record.link))
      .groupBy('channel')
      .toPairs()
      .sortBy(pair => pair[1].length)
      .reverse()
      .value()
      .forEach(pair => {
        embed.addField(
          '#' + pair[0],
          pair[1]
            .map(sub => `- ${truncate(sub.title, 75)} (${sub.shortLink})`)
            .join('\n')
        );
      });

    return embed;
  }
}

module.exports = ReadingListGenerator;
