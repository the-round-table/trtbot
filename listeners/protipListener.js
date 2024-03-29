const BaseMessageListener = require('./baseMessageListener.js');
const config = require('../config.js');
const discord = require('discord.js');
const oneLine = require('common-tags').oneLine;

const proTipRegex = /^(pro-?tip\b)/i;

class ProTipListener extends BaseMessageListener {
  constructor(ProTips) {
    super({
      name: 'protips',
      description: oneLine`Records protips to a protip channel for messages
        with the prefix "protip"`,
      ignoreBotMessages: true,
      messageRegex: proTipRegex,
      allowedInPM: false,
    });
    this.ProTips = ProTips;
  }

  async onMessage(message) {
    const msg = message.content;
    const guild = message.guild;
    const poster = message.author;

    const proTip = await this.ProTips.create({
      submitter: poster.username,
      submitterId: poster.id,
      messageText: msg,
      channelId: message.channel.id,
      guildId: message.guild.id,
    });

    const proTipId = proTip.get({ plain: true }).id;

    if (!config.PROTIP_CHANNEL_ID) {
      return;
    }
    const channel = guild.channels.get(config.PROTIP_CHANNEL_ID);
    if (!channel) {
      console.error('Could not find channel: ' + config.PROTIP_CHANNEL_ID);
      return;
    }
    const embed = new discord.RichEmbed()
      .setTitle(`Protip #${proTipId}`)
      .setDescription(msg)
      .addField('Submitter', poster);
    await channel.send(embed);
    await message.reply("I've recorded that as a new protip!");
  }
}

module.exports = ProTipListener;
