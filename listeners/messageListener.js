const utils = require('../utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = Messages => message => {
  if (!message.guild) {
    return;
  }

  Messages.findOrCreate({
    where: {
      id: message.id,
    },
    defaults: {
      channel: message.channel.name,
      guildId: message.guild.id,
      submitter: message.author.username,
    },
  });
};
