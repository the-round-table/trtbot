const moment = require('moment');
const _ = require('lodash');

class ChannelRearranger {
  constructor(statsGenerator) {
    this.statsGenerator = statsGenerator;
  }

  async setChannelPosition(guild, channel, position) {
    guild.channels.forEach(channel => {
      if (channel.name == channelName) {
        console.log(`Setting position of ${channelName} to ${position}`);
        channel.setPosition(position);
        return;
      }
    });
    console.error('Unable to find channel: ' + channelName);
  }

  async rearrangeByActivity(guild) {
    console.log('Beginning to reorganize channels');
    const channelCounts = await this.statsGenerator.messageCountByChannel(
      guild,
      moment()
        .subtract(1, 'weeks')
        .toDate()
    );

    const sortedCounts = _.chain(channelCounts)
      .sortBy(record => record.channelCount)
      .reverse()
      .value();

    const channelPositions = {};
    sortedCounts.forEach((record, idx) => {
      channelPositions[record.channel] = idx;
    });

    const channelUpdates = [];
    await guild.channels.forEach(async channel => {
      if (channel.type != 'text') {
        return;
      }

      const channelIdx = channelPositions.hasOwnProperty(channel.name)
        ? channelPositions[channel.name]
        : sortedCounts.length + 1;
      channelUpdates.push({channel, channelIdx});
    });

    await _.chain(channelUpdates).sortBy('channelIdx').value().forEach(async channelObj => {
      const {channel, channelIdx} = channelObj;
      console.log(`Setting position of ${channel.name} to ${channelIdx}`);
      await channel.setPosition(channelIdx);
    })
  }
}

module.exports = ChannelRearranger;
