const commando = require('discord.js-commando');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require('lodash');
const discord = require('discord.js');
const moment = require('moment');
const truncate = require('truncate');

module.exports = class ReadingListCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'readinglist',
      memberName: 'readinglist',
      group: 'submissions',
      description: 'List the stories that have been posted today',
      examples: ['readinglist'],
      guildOnly: false
    });

    this.Submissions = client.Submissions;
  }

  async run(msg, args) {
    this.Submissions.findAll({
      where: {
        createdAt: {
          [Op.gt]: moment()
            .startOf('day')
            .toDate()
        }
      },
      order: ['createdAt']
    })
      .map(record => record.get({ plain: true }))
      .then(records => {
        if(records.length === 0) {
          return message.reply('Nothing posted today. 😭');
        }

        const embed = new discord.RichEmbed()
          .setTitle(`📚 Reading List for ${moment().format('MMMM D, YYYY')}`)
          .setDescription("Here's what was posted to the Discord today:");

        _.chain(records)
          .groupBy('channel')
          .toPairs()
          .sortBy(pair => pair[1].length)
          .reverse()
          .value()
          .forEach(pair => {
            embed.addField(
              '#' + pair[0],
              pair[1].map(sub => `- ${truncate(sub.title, 75)} (${sub.shortLink})`).join('\n')
            );
          });
        msg.reply({ embed });
      });
  }
};
