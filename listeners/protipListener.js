const BaseMessageListener = require('./baseMessageListener.js');
const config = require('../config.js');
const discord = require('discord.js');

const proTipRegex = /^(pro-?tip\b)|(#?til\b)/gi;

class ProTipListener extends BaseMessageListener {
  constructor(ProTips) {
    super();
    this.ProTips = ProTips;
  }

  async onMessage(message) {
    if (
      !message.guild ||
      message.author.bot ||
      !message.content.match(proTipRegex) ||
      !config.PROTIP_CHANNEL_ID
    ) {
      return;
    }

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
