const BaseMessageListener = require('./baseMessageListener.js');
const oneLine = require('common-tags').oneLine;
const MemeManager = require('../actions/memes.js');
const utils = require('../utils.js');

const MEME_REGEX = /(\s|^)m:\S*(\b|\s|$)/gim;

class MemeListener extends BaseMessageListener {
  constructor(Memes) {
    super({
      name: 'meme',
      description: oneLine`Allows posting of memes within normal text posts.
        For example, if you had a meme named "wegothim", then writing
        "m:wegothim" in chat would trigger the meme being posted.`,
      messageRegex: MEME_REGEX,
      allowedInPM: false,
    });
    this.memeManager = new MemeManager(Memes);
  }

  async onMessage(message) {
    // Trim whitespace and remove 'm:' prefix
    const matches = message.content.match(MEME_REGEX);

    for (let match of matches) {
      const query = match.trim().substring(2);
      const meme = await this.memeManager.queryMeme(message.guild.id, query);
      if (meme != null) {
        const memeMessage = await utils.formatImageLinkAsMessage(meme.link);
        await message.channel.send(memeMessage);
      }
    }
  }
}

module.exports = MemeListener;
