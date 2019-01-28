const BaseMessageListener = require('./baseMessageListener.js');
const oneLine = require('common-tags').oneLine;
const discord = require('discord.js');
const fetch = require('node-fetch');
const utils = require('../utils.js');

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
    if (message.author.bot) {
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

    const bufferedMessageLink = utils.getMessageLink(bufferedMessage);
    const crosspostEmbed = new discord.RichEmbed()
      .setAuthor(
        bufferedMessage.author.username,
        bufferedMessage.author.displayAvatarURL
      )
      .setTitle(`Crossposted from #${srcChannel.name} by @${poster.username}`)
      .setDescription(bufferedMessage.content)
      .addField(
        'Crosspost Context',
        `[Original Message](${bufferedMessageLink})`
      );
    for (let destChannel of destChannelIds) {
      if (destChannel != srcChannel) {
        const channel = guild.channels.get(
          destChannel.substring(2, destChannel.length - 1)
        );
        await channel.send({ embed: crosspostEmbed, files: attachments });
        if (bufferedMessage.embeds && bufferedMessage.embeds.length > 0) {
          await channel.send({
            embed: bufferedMessage.embeds
              ? bufferedMessage.embeds[0]
              : undefined,
          });
        }
      }
    }
  }
}

module.exports = XPostListener;
