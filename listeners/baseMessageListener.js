class BaseMessageListener {
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
