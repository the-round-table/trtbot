const BaseMessageListener = require('./baseMessageListener.js');
const oneLine = require('common-tags').oneLine;
const discord = require('discord.js');
const fetch = require('node-fetch');

const xpostRegex = /(x(-)?post)/i;
const channelRegex = /<#[^>]*>/gim;

class XPostListener extends BaseMessageListener {
  constructor() {
    super({
      name: 'cross_post',
      description: oneLine`Listens for "xpost #channelname", and crossposts
        the previous message in the listed channel(s)`,
      silent: true,
      ignoreBotMessages: false,
    });
    this.buffer = {};
  }

  async onMessage(message) {
    // Buffer bot messages only if they contain embeds or attachments
    if (
      message.author.bot &&
      !(message.embeds.length > 0 || message.attachments.size > 0)
    ) {
      return;
    }

    const guild = message.guild;
    const srcChannel = message.channel;
    const poster = message.author;

    if (
      !message.content.match(xpostRegex) ||
      !message.content.match(channelRegex)
    ) {
      this.buffer[srcChannel] = message;
      return;
    }

    const destChannelIds = new Set(message.content.match(channelRegex));
    const bufferedMessage = this.buffer[srcChannel];
    if (!bufferedMessage) {
      console.log('No buffered message for this channel');
      return;
    }

    let attachments = await Promise.all(
      bufferedMessage.attachments.map(async attachment => {
        const res = await fetch(attachment.url);
        if (res.ok) {
          const buffer = await res.buffer();
          return new discord.Attachment(Buffer.from(buffer), 'attachment.png');
        }
        return null;
      })
    );
    attachments = attachments.filter(attachment => attachment != null);

    for (let destChannel of destChannelIds) {
      if (destChannel != srcChannel) {
        guild.channels
          .get(destChannel.substring(2, destChannel.length - 1))
          .send(
            `Crossposted from ${srcChannel} by ${poster}:\n> ${
              bufferedMessage.content
            }`,
            {
              embed: bufferedMessage.embeds
                ? bufferedMessage.embeds[0]
                : undefined,
              files: attachments,
            }
          );
      }
    }
  }
}

module.exports = XPostListener;
