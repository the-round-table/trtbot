const _ = require('lodash');
const discord = require('discord.js');
const moment = require('moment');

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
      return new discord.RichEmbed()
        .setTitle(
          `💀 Dead Channel Report for ${moment().format('MMMM D, YYYY')}`
        )
        .setDescription(message);
    } else {
      return null;
    }
  }
}

module.exports = DeadChannelCop;
