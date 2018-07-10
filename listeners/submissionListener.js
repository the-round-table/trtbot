const utils = require('../utils');
const config = require('../config.js');
const Sequelize = require('sequelize');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const BitlyClient = require('bitly').BitlyClient;
const Op = Sequelize.Op;

const bitly = new BitlyClient(config.BITLY_TOKEN, {});

function getTitle(link) {
  return new Promise((resolve, reject) => {
    fetch(link)
      .then(res => res.buffer())
      .then(buf => cheerio.load(buf))
      .then($ => {
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const title = ogTitle || $('title').text();
        if(!title) {
          reject("Unable to get title");
        }
        resolve(title);
      })
      .catch(reject);
  });
}

module.exports = (sequelize, Submissions) =>
  async function(message) {
    const link = utils.getPostedUrl(message);

    if (!link || !message.guild) {
      return;
    }

    var title;
    try {
      title = await getTitle(link);
    } catch(e) {
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

      Submissions.count({
        where: {
          link: link,
          guildId: guildId,
          // Created in last day
          createdAt: {
            [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
          }
        }
      }).then(existing => {
        // Don't create duplicate submissions
        if (existing) {
          console.log('Duplicate submission!');
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
