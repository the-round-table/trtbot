const commando = require('discord.js-commando');
const StatsGenerator = require('../../actions/statsGenerator.js');

module.exports = class ChannelStatsCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'channel-stats',
      memberName: 'channel-stats',
      group: 'stats',
      description: 'Displays channel usage stats from the past week',
      examples: ['channel-stats'],
      guildOnly: true,
    });
    this.statsGenerator = new StatsGenerator(client.Messages);
  }

  async run(msg) {
    const messageStats = await this.statsGenerator.generateChannelMessageStats(
      msg.guild
    );
    msg.reply(messageStats);
  }
};
