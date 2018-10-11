class BaseMessageListener {
  constructor(opts) {
    opts = opts || {};
    this.name = opts.name;
    this.description = opts.description;
  }

  async handleMessage(message) {
    // TODO: Check if the listener is enabled
    if (true) {
      return await this.onMessage(message);
    }
  }

  async onMessage(message) {
    throw new Error('onMessage not implemented!');
  }
}

module.exports = BaseMessageListener;
