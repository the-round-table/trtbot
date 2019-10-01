const fetch = require('node-fetch');
const cheerio = require('cheerio');
const BaseMessageListener = require('./baseMessageListener.js');

const APPLE_NEWS_REGEX = /(https?:\/\/)?apple\.news/;

class AppleNewsListener extends BaseMessageListener {
  constructor() {
    super({
      name: 'apple_news',
      description: 'Unfurls Apple News links and displays the actual URL',
      linkRegex: APPLE_NEWS_REGEX,
    });
  }

  async onMessage(message, { link }) {
    return fetch(link)
      .then(res => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res;
      })
      .then(res => res.buffer())
      .then(buf => cheerio.load(buf))
      .then($ => {
        const realURL = $('a')[0].attribs['href'];
        message.reply(`Here's the real URL for that story: ${realURL}`);
      })
      .catch(() => {
        message.reply('Unable to unfurl Apple News link 😞');
      });
  }
}

module.exports = AppleNewsListener;
