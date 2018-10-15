const fetch = require('node-fetch');
const cheerio = require('cheerio');
const readingTime = require('reading-time');
const URL = require('url').URL;
const _ = require('lodash');
const BaseMessageListener = require('./baseMessageListener.js');

const READING_TIME_THRESHOLD = 10;

const BUCKETS = [
  [0, 'short'],
  [20, 'medium'],
  [25, 'long-ish'],
  [50, 'long'],
  [75, 'very long'],
];

const BLACKLISTED_SITES = [
  'amazon.com',
  'facebook.com',
  'giphy.com',
  'instagram.com',
  'instagram.com',
  'itunes.apple.com',
  'twitter.com',
  'wikipedia.org',
  'youtube.com',
  'arxiv.org',
  'oldschoolrunescape.wikia.com',
];

const IMAGE_LINK_REGEX = '.(?:jpg|gif|png)$';

function determineLabelForRead(minutes) {
  for (var i = BUCKETS.length - 1; i >= 0; i--) {
    if (minutes >= BUCKETS[i][0]) {
      return BUCKETS[i][1];
    }
  }
  // Unreachable
  return 'insanely long';
}

function isBlacklisted(url) {
  const urlObj = new URL(url);
  return _.some(BLACKLISTED_SITES, blacklist =>
    _.endsWith(urlObj.host, blacklist)
  );
}

class LongReadsListener extends BaseMessageListener {
  constructor() {
    super({
      name: 'long_reads',
      description: 'Responds to articles with an estimated reading time',
      linkValidator: link =>
        !isBlacklisted(link) && !link.match(IMAGE_LINK_REGEX),
    });
  }

  async onMessage(message, { link }) {
    fetch(link)
      .then(res => res.buffer())
      .then(buf => cheerio.load(buf))
      .then($ => {
        const content = $('body').text();
        const readingTimeAnalysis = readingTime(content);
        const minutes = readingTimeAnalysis.minutes;
        if (minutes >= READING_TIME_THRESHOLD) {
          message.reply(
            `I estimate that's a **${determineLabelForRead(minutes)}** read.`
          );
        }
      })
      .catch(console.error);
  }
}

module.exports = LongReadsListener;
