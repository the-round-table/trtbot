const YAML = require ('yaml');
const discord = require('discord.js');
const moment = require('moment');
const truncate = require('truncate');
const fs = require("fs")
let Parser = require('rss-parser');
let parser = new Parser();

class MorningReadsGenerator {
  constructor(feedsList) {
    this.feedsListFile = feedsList;
    let file = fs.readFileSync(feedsList, 'utf8');
    this.feeds = YAML.parse(file);
    fs.watch(feedsList, _ => {
      file = fs.readFileSync(feedsList, 'utf8');
      this.feeds = YAML.parse(file);
    });
  }

  addFeed(feed, feedUrl) {
    this.feeds[feed] = feedUrl;
    const feedsStr = YAML.stringify(this.feeds);
    fs.writeFileSync(this.feedsListFile, feedsStr, 'utf8');
  }

  removeFeed(feed) {
    delete this.feeds[feed];
    const feedsStr = YAML.stringify(this.feeds);
    fs.writeFileSync(this.feedsListFile, feedsStr, 'utf8');
  }

  async generate() {
    let articlesForToday = {};
    let yesterday = (d => d.setDate(d.getDate() - 1)) (new Date());  
    for (let feed in this.feeds) {
      let feedContent = await parser.parseURL(this.feeds[feed]);
      let newArticles = [];
      for (let article of feedContent.items) {
        if (new Date(article.pubDate) >= yesterday) {
          newArticles.push(article)
        }
      }
      if (newArticles.length > 0) {
        articlesForToday[feed] = newArticles;
      }
    }
    
    const embed = new discord.RichEmbed().setTitle(
      `🗞  Morning Reads for ${moment().format('MMMM D, YYYY')}`
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

module.exports = MorningReadsGenerator;