const BaseMessageListener = require('./baseMessageListener.js');
const fetch = require('node-fetch');

const SUBREDDIT_REGEX = /(\s|^)\/r\/\w*\b/;

class SubredditListener extends BaseMessageListener {
  constructor() {
    super({
      name: 'subreddit',
      description: 'Links subreddits mentioned in messages (like /r/foo)',
      allowedInPM: false,
      ignoreBotMessages: true,
      messageRegex: SUBREDDIT_REGEX,
    });
  }

  async onMessage(message) {
    // A string of the form "/r/foo"
    const subreddit = message.content.match(SUBREDDIT_REGEX)[0].trim();
    const fullURL = `https://reddit.com${subreddit}`;

    // Check to make sure subreddit is valid
    const response = await fetch(fullURL);
    if (response.ok) {
      await message.react('👽');
      await message.reply(fullURL);
    }
  }
}

module.exports = SubredditListener;
