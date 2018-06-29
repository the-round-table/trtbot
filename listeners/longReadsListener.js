const fetch = require('node-fetch');
const cheerio = require('cheerio');
const readingTime = require('reading-time');
const utils = require('../utils.js')

const READING_TIME_THRESHOLD = 10;

module.exports = (message) => {
    const link = utils.getPostedUrl(message);

    if (!link) {
        return;
    }

    fetch(link).then(res => res.buffer())
        .then(buf => cheerio.load(buf))
        .then($ => {
            const content = $('body').text();
            const readingTimeAnalysis = readingTime(content);
            if (readingTimeAnalysis.minutes >= READING_TIME_THRESHOLD) {
                message.reply(`That's an estimated ${readingTimeAnalysis.text}`);
            }
        }).catch(console.error);
};