class BaseMessageListener {
  constructor(opts) {
    opts = opts || {};

    if (opts.name == null || opts.name === '') {
      throw new Error('No name set on listener!');
    }
    this.name = opts.name;
    this.description = opts.description || 'No description set';
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
