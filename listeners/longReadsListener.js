const fetch = require('node-fetch');
const cheerio = require('cheerio');
const readingTime = require('reading-time');
const utils = require('../utils.js');
const URL = require('url').URL;
const _ = require('lodash');

const READING_TIME_THRESHOLD = 10;

const BUCKETS = [
  [0, 'short'],
  [20, 'medium'],
  [25, 'long-ish'],
  [50, 'long'],
  [75, 'very long']
];

const BLACKLISTED_SITES = [
  'youtube.com',
  'twitter.com',
  'facebook.com',
  'instagram.com',
  'itunes.apple.com',
  'amazon.com',
  'instagram.com',
  'wikipedia.org'
];

function determineLabelForRead(minutes) {
  for (var i = BUCKETS.length - 1; i >= 0; i--) {
    if (minutes >= BUCKETS[i][0]) {
      return BUCKETS[i][1];
    }
  }
}

function isBlacklisted(url) {
  const urlObj = new URL(url);
  return _.some(BLACKLISTED_SITES, blacklist =>
    _.endsWith(urlObj.host, blacklist)
  );
}

module.exports = message => {
  const link = utils.getPostedUrl(message);

  if (!link || isBlacklisted(link)) {
    return;
  }

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
};
