const moment = require('moment');
const _ = require('lodash');
const discord = require('discord.js');
const Sequelize = require('sequelize');
const pluralize = require('pluralize');
const Op = Sequelize.Op;

const AWARDS = ['🥇', '🥈', '🥉'];

function getAwardEmoji(index) {
  if (index < AWARDS.length) {
    return AWARDS[index];
  } else {
    return '';
  }
}

class StatsGenerator {
  constructor(Messages) {
    this.Messages = Messages;
  }

  startOfWeek() {
    return moment().subtract(1, 'weeks');
  }

  async messageCountByChannel(guild, since) {
    const guildId = guild.id;
    return (await this.Messages.findAll({
      where: {
        createdAt: {
          [Op.gt]: since,
        },
        guildId: guildId,
      },
      group: ['channel', 'guildId'],
      attributes: [
        'channel',
        'guildId',
        [Sequelize.fn('COUNT', '*'), 'channelCount'],
      ],
    })).map(record => record.get({ plain: true }));
  }

  async generateChannelMessageStats(guild) {
    const messageCounts = await this.messageCountByChannel(
      guild,
      this.startOfWeek().toDate()
    );

    const message = _.chain(messageCounts)
      .sortBy(record => record.channelCount)
      .reverse()
      .map(
        (record, index, collection) =>
          `- ${getAwardEmoji(index)} #${record.channel} (${
            record.channelCount
          } ${pluralize('message', record.channelCount)})`
      )
      .value()
      .join('\n');

    return new discord.RichEmbed()
      .setTitle(
        `🏆 Channel Stats for the week of ${this.startOfWeek().format(
          'MMMM D, YYYY'
        )}`
      )
      .setDescription(message);
  }

  async generateUserMessageStats(guild) {
    const guildId = guild.id;
    const messageCounts = (await this.Messages.findAll({
      where: {
        createdAt: {
          [Op.gt]: this.startOfWeek().toDate(),
        },
        guildId: guildId,
      },
      group: ['submitter', 'guildId'],
      attributes: [
        'submitter',
        'guildId',
        [Sequelize.fn('COUNT', '*'), 'submitterCount'],
      ],
    })).map(record => record.get({ plain: true }));

    const message = _.chain(messageCounts)
      .sortBy(record => record.submitterCount)
      .reverse()
      .map(
        (record, index, collection) =>
          `- ${getAwardEmoji(index)} ${record.submitter} (${
            record.submitterCount
          } ${pluralize('message', record.submitterCount)})`
      )
      .value()
      .join('\n');

    return new discord.RichEmbed()
      .setTitle(
        `🏆 User Stats for the week of ${this.startOfWeek().format(
          'MMMM D, YYYY'
        )}`
      )
      .setDescription(message);
  }
}

module.exports = StatsGenerator;
