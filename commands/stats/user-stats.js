const commando = require('discord.js-commando');
const StatsGenerator = require('../../actions/statsGenerator.js');

module.exports = class UserStatsCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'user-stats',
      memberName: 'user-stats',
      group: 'stats',
      description: 'Displays user stats from the past week',
      examples: ['user-stats'],
      guildOnly: true,
    });
    this.statsGenerator = new StatsGenerator(client.Messages);
  }

  async run(msg) {
    const messageStats = await this.statsGenerator.generateUserMessageStats(
      msg.guild
    );
    msg.reply(messageStats);
  }
};
