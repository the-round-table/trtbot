const commando = require('discord.js-commando');
const util = require('../../config.js');
const _ = require('lodash');
const chrono = require('chrono-node');
const oneLine = require('common-tags').oneLine;
const moment = require('moment');

module.exports = class RemindMeCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'remindme',
      memberName: 'remindme',
      group: 'reminder',
      description: 'Reminds you about something at a specified time',
      examples: ['remindMe "go travel the world" "on Monday"'],
      guildOnly: false,
      args: [
        {
          key: 'topic',
          prompt: 'What do you want to be reminded of?',
          type: 'string'
        },
        {
          key: 'date',
          prompt: 'When do you want to be reminded?',
          type: 'string',
          error: oneLine`Sorry, I couldn't parse the date you provided.
            Make sure the date is in the singular form (like "on Tuesday").`,
          validate: string => {
            const parsed = chrono.parseDate(string, moment());
            return parsed && moment(parsed).isAfter();
          }
        }
      ]
    });
  }

  async run(msg, { topic, date }) {
    const actualDate = moment(chrono.parseDate(date, moment()));
    msg.reply(`Sounds good. I'll remind you about "${topic}" in ${actualDate.fromNow()}`);
  }
};
