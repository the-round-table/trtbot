const YAML = require ('yaml');
const discord = require('discord.js');
const moment = require('moment');
const truncate = require('truncate');
const fs = require("fs")
const request = require('request');
const Result = require('result-js');
Result.registerGlobals();
let Parser = require('rss-parser');

class MorningPaperGenerator {
  constructor(feedsList) {
    this.feedsListFile = feedsList;
    this.parser = new Parser();
    let file = fs.readFileSync(feedsList, 'utf8');
    this.feeds = YAML.parse(file);
    fs.watch(feedsList, _ => {
      file = fs.readFileSync(feedsList, 'utf8');
      this.feeds = YAML.parse(file);
    });
  }

  async addFeed(feed, feedUrl) {
    try {
      let resp = await this.parser.parseURL(feedUrl);
      this.feeds.push({source: feed, url: feedUrl});
      const feedsStr = YAML.stringify(this.feeds);
      fs.writeFileSync(this.feedsListFile, feedsStr, 'utf8');
      return Ok("Successfully added");
    } catch (error) {
      return Err(error);
    }
  }

  removeFeed(sourceName) {
    if (this.feeds.find(feed => feed.source == sourceName)) {
      this.feeds = this.feeds.filter(feed => feed.source !== sourceName);
      const feedsStr = YAML.stringify(this.feeds);
      fs.writeFileSync(this.feedsListFile, feedsStr, 'utf8'); 
      return Ok("Successfully removed feed");
    } else {
      return Err("This feed is not in the feed list");
    }
  }

  listFeeds() {
    return this.feeds;
  }

  async generate() {
    let articlesForToday = {};
    let yesterday = moment().add(-1, 'days');
    for (let feed of this.feeds) {
      let feedContent = await this.parser.parseURL(feed.url);
      let newArticles = [];
      for (let article of feedContent.items) {
        if (moment(article.pubDate) >= yesterday) {
          newArticles.push(article)
        }
      }
      if (newArticles.length > 0) {
        articlesForToday[feed.source] = newArticles;
      }
    }

    const embed = new discord.RichEmbed().setTitle(
      `🗞  Morning Paper for ${moment().format('MMMM D, YYYY')}`
    );
  
    if (articlesForToday.length === 0) {
      embed.setDescription('Literally no news today. 😭');
      return embed;
    } else {
      embed.setDescription("Here's what you __**need**__ to know today...");
    }
    for (let source in articlesForToday) {
      let articles = articlesForToday[source];
      let fieldChars = 0;
      embed.addField(source, articles.map(sub => {
        const line = `- [${truncate(sub.title, 75)}](${sub.link})`;
        fieldChars += line.length + 1;
        return fieldChars <= 1024 ? line : '';
      })
      .join('\n'));
    }
    return embed;
  }
}

module.exports = MorningPaperGenerator;