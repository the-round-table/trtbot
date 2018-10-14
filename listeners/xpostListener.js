const BaseMessageListener = require('./baseMessageListener.js');
const oneLine = require('common-tags').oneLine;

const xpostRegex = /(x(-)?post)/i;
const channelRegex = /<#[^>]*>/gim;

class XPostListener extends BaseMessageListener {
  constructor() {
    super({
      name: 'cross_post',
      description: oneLine`Listens for "xpost #channelname", and crossposts
        the previous message in the listed channel(s)`,
    });
    this.buffer = {};
  }

  async onMessage(message) {
    if (message.author.bot) {
      return;
    }

    const msg = message.content;
    const guild = message.guild;
    const srcChannel = message.channel;
    const poster = message.author;

    if (
      !message.content.match(xpostRegex) ||
      !message.content.match(channelRegex)
    ) {
      this.buffer[srcChannel] = msg;
      return;
    }

    const destChannelIds = new Set(message.content.match(channelRegex));
    for (let destChannel of destChannelIds) {
      if (destChannel != srcChannel) {
        guild.channels
          .get(destChannel.substring(2, destChannel.length - 1))
          .send(
            `Crossposted from ${srcChannel} by ${poster}:\n> ${
              this.buffer[srcChannel]
            }`
          );
      }
    }
  }
}

module.exports = XPostListener;
