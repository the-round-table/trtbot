const commando = require('discord.js-commando');
const chrono = require('chrono-node');
const moment = require('moment');

module.exports = class RemindMeCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'remindme',
      memberName: 'remindme',
      group: 'util',
      description: 'Sets up a reminder',
      guildOnly: false,
      args: [
        {
          key: 'query',
          prompt: 'What about and when should I remind you?',
          type: 'string',
        },
      ],
    });
    this.Reminders = client.Reminders;
  }

  async run(msg, { query }) {
    const parsedResults = chrono.parse(query);

    if (parsedResults.length == 0) {
      return msg.reply("Sorry, I couldn't parse a date from your input.");
    }

    const dueDate = parsedResults[0].start.date();
    await this.Reminders.create({
      submitter: msg.author.username,
      channelId: msg.channel.id,
      guildId: msg.guild.id,
      originalMessageId: msg.id,
      messageText: query,
      dueDate,
    });
    msg.reply(`⏰ Alright, I'll remind you ${moment(dueDate).fromNow()}`);
  }
};
