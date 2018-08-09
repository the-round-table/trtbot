const commando = require('discord.js-commando');
const DeadChannelCop = require('../../actions/deadChannelCop.js');

module.exports = class DeadChannelCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'deadchannels',
      memberName: 'deadchannels',
      group: 'submissions',
      description: `Lists the channels that haven't been used in the last week`,
      examples: ['deadchannels'],
      guildOnly: true
    });

    this.deadChannelCop = new DeadChannelCop(client.Messages);
  }

  async run(msg) {
    msg.reply({
      embed: await this.deadChannelCop.generateDeadChannelReport(msg.guild)
    });
  }
};
