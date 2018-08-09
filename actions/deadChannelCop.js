const _ = require('lodash');
const discord = require('discord.js');
const moment = require('moment');
const config = require('../config.js');

const BLACKLIST = config.DEAD_CHANNEL_BLACKLIST || [];

const DEAD_CHANNEL_DAYS_THRESHOLD = 10;

class DeadChannelCop {
  constructor(Messages) {
    this.Messages = Messages;
  }

  async channelLastUsed(guildId, channel) {
    const records = (await this.Messages.findAll({
      where: {
        guildId,
        channel
      },
      order: [['createdAt', 'DESC']],
      limit: 1
    })).map(record => record.get({ plain: true }));

    if (!records || records.length === 0) {
      return null;
    }
    return moment(records[0].createdAt);
  }

  async generateDeadChannelReport(guild) {
    var warnings = [];

    for (let channelPair of guild.channels) {
      const channel = channelPair[1];
      if (BLACKLIST.includes(channel.name)) {
        continue;
      }
      const lastUsed = await this.channelLastUsed(guild.id, channel.name);
      if (
        lastUsed &&
        lastUsed.isBefore(
          moment().subtract(DEAD_CHANNEL_DAYS_THRESHOLD, 'days')
        )
      ) {
        warnings.push({
          channel: channel.name,
          lastUsed: lastUsed
        });
      }
    }

    const embed = new discord.RichEmbed().setTitle(
      `💀 Dead Channel Report for ${moment().format('MMMM D, YYYY')}`
    );
    if (warnings.length > 0) {
      const message = _(warnings)
        .sortBy(warning => warning.lastUsed)
        .map(
          warning =>
            `- #${
              warning.channel
            } was last used ${warning.lastUsed.fromNow()} (${warning.lastUsed.format(
              'MMMM D, YYYY'
            )})`
        )
        .value()
        .join('\n');
      embed.setDescription(message);
    } else {
      embed.setDescription('No dead channels this week! 👏');
    }
    return embed;
  }
}

module.exports = DeadChannelCop;
