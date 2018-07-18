const commando = require('discord.js-commando');

module.exports = class RearrangeCommand extends commando.Command {
  constructor(client, channelRearranger) {
    super(client, {
      name: 'rearrange',
      memberName: 'rearrange',
      group: 'moderation',
      description: 'Rearranges channels by the activity of the last week',
      examples: ['rearrange'],
      guildOnly: true,
      userPermissions: ['MANAGE_CHANNELS'],
      clientPermissions: ['MANAGE_CHANNELS']
    });

    this.channelRearranger = client.channelRearranger;
  }

  async run(msg, args) {
    const guild = msg.guild;
    await this.channelRearranger.rearrangeByActivity(guild);

    msg.reply('Rearranged!');
  }
};
