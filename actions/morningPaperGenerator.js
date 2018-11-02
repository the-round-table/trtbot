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
    if (feedsList === '') {
      this.active = false;
      return;
    }
    this.active = true;
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
    if (!this.active) {
      return Err("RSS Feed system is not active");
    }
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
    if (!this.active) {
      return Err("RSS Feed system is not active");
    }
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
    if (!this.active) {
      return Err("RSS Feed system is not active");
    }
    return this.feeds;
  }

  async generate(numPages=0) {
    if (!this.active) {
      return Err("RSS Feed system is not active");
    }
    let articlesForToday = [];
    let numSources = 0
    let yesterday = moment().add(-1, 'days');
    for (let feed of this.feeds) {
      console.log(`Attempting to get latest articles from ${feed.source}`);
      let feedContent = await this.parser.parseURL(feed.url);
      let newArticles = [];
      for (let article of feedContent.items) {
        if (moment(article.pubDate) >= yesterday) {
          newArticles.push({title: article.title, link: article.link});
        }
      }
      if (newArticles.length > 0) {
        articlesForToday.push({source: feed.source, articles: newArticles});
        numSources++;
      }
    }

    if (!numPages) {
      numPages = Math.ceil(JSON.stringify(articlesForToday).length / 5000) + 1; // 6000 is max embed size
    } 
    let pages = this.paginateArticles(articlesForToday, numPages, numSources);

    if (articlesForToday.length === 0) {
      return [discord.RichEmbed()
        .setTitle(`🗞  Morning Paper for ${moment().format('MMMM D, YYYY')}`)
        .setDescription('Literally no news today. 😭')];
    } 
    
    let embeds = [];
    let pageNum = 1;
    for (let page of pages) {
      let embed = new discord.RichEmbed()
        .setTitle(`🗞  Morning Paper for ${moment().format('MMMM D, YYYY')}`)
        .setDescription(`Here's what you __**need**__ to know today... (Page: ${pageNum}/${numPages})`);
      for (let feeds of page) {
        let source = feeds.source;
        let articles = feeds.articles;
        let fieldChars = 0;
        embed.addField(source, articles.map(sub => {
          const line = `- [${truncate(sub.title, 75)}](${sub.link})`;
            fieldChars += line.length + 1;
            return fieldChars <= 1024 ? line : '';
          })
        .join('\n'));
      }
      embeds.push(embed);
      pageNum++;
    }
    return embeds;
  }

  //Lots of encoded assumptions here
  paginateArticles(articles, numPages, numSources) {
    let numSourcesPerPage = numSources / numPages;
    let paginatedArticles = [];
    for (let i = 0; i < articles.length; i+=numSourcesPerPage) {
      paginatedArticles.push(articles.slice(i, i + numSourcesPerPage));
    }
    return paginatedArticles;
  }
}

module.exports = MorningPaperGenerator;