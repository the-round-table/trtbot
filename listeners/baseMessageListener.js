const utils = require('../utils.js');

class BaseMessageListener {
  constructor(opts) {
    opts = opts || {};

    if (opts.name == null || opts.name === '') {
      throw new Error('No name set on listener!');
    }
    this.name = opts.name;
    this.description = opts.description || 'No description set';
    this.ignoreBotMessages =
      opts.ignoreBotMessages != null ? opts.ignoreBotMessages : true;
    this.messageRegex = opts.messageRegex || null;
    this.linkRegex = opts.linkRegex || null;
    this.linkValidator = opts.linkValidator || null;
    this.validator = opts.validator || null;
  }

  async handleMessage(message) {
    // TODO: Check if the listener is enabled
    if (
      (this.ignoreBotMessages && message.author.bot) ||
      (this.messageRegex && !message.content.match(this.messageRegex)) ||
      (this.validator && !this.validator(message.content))
    ) {
      return;
    }

    let link = utils.getPostedUrl(message);
    if ((this.linkRegex || this.linkValidator) && !link) {
      return;
    }
    if (
      (this.linkRegex && !link.match(this.linkRegex)) ||
      (this.linkValidator && !this.linkValidator(link))
    ) {
      return;
    }

    await this.onMessage(message, { link });
  }

  async onMessage(message) {
    throw new Error('onMessage not implemented!');
  }
}

module.exports = BaseMessageListener;
