const _ = require('lodash');
const BitlyClient = require('bitly').BitlyClient;
const cheerio = require('cheerio');
const config = require('../config.js');
const fetch = require('node-fetch');
const moment = require('moment');
const oneLine = require('common-tags').oneLine;
const Sequelize = require('sequelize');
const URL = require('url').URL;
const utils = require('../utils');

const bitly = new BitlyClient(config.BITLY_TOKEN, {});
const Op = Sequelize.Op;

const BLACKLISTED_SITES = [
  'oldschoolrunescape.wikia.com'
];

function isBlacklisted(url) {
  const urlObj = new URL(url);
  return _.some(BLACKLISTED_SITES, blacklist =>
    _.endsWith(urlObj.host, blacklist)
  );
}

function getTitle(link) {
  return new Promise((resolve, reject) => {
    fetch(link)
      .then(res => res.buffer())
      .then(buf => cheerio.load(buf))
      .then($ => {
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const title = ogTitle || $('title').text();
        if (!title) {
          reject('Unable to get title');
        }
        resolve(title);
      })
      .catch(reject);
  });
}

module.exports = (sequelize, Submissions) =>
  async function (message) {
    const link = utils.getPostedUrl(message);

    if (!link || isBlacklisted(link) || !message.guild) {
      return;
    }

    var title;
    try {
      title = await getTitle(link);
    } catch (e) {
      console.error(`Skipping submission for ${link}. (No title)`);
      return;
    }

    var shortLink;
    try {
      shortLink = (await bitly.shorten(link)).url;
    } catch (e) {
      shortLink = link;
    }

    return sequelize.transaction(t => {
      const username = message.author.username;
      const channel = message.channel.name;
      const guildId = message.guild.id;

      Submissions.find({
        where: {
          link: link,
          guildId: guildId,
          // Created in last day
          createdAt: {
            [Op.gt]: moment()
              .subtract(3, 'days')
              .toDate()
          }
        },
        limit: 1
      }).then(existing => {
        // Don't create duplicate submissions
        if (existing) {
          console.log('Duplicate submission!');
          message.reply(oneLine`Heads up, that link was already posted by
            **@${existing.submitter}** in **#${existing.channel}**
            about ${moment(existing.createdAt).fromNow()}`);
          return;
        }

        Submissions.create({
          submitter: username,
          link,
          guildId,
          channel,
          title,
          shortLink
        }).then(() => {
          console.log(`Submission registered: (${username}) ${link}`);
        });
      });
    });
  };
