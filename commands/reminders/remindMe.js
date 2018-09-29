const commando = require('discord.js-commando');
const chrono = require('chrono-node');
const moment = require('moment');
const oneLine = require('common-tags').oneLine;

module.exports = class RemindMeCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'remindme',
      memberName: 'remindme',
      group: 'reminders',
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

  getReminderText(query, dateText) {
    const withoutDateText = query.replace(dateText, '').trim();
    if (withoutDateText.length === 0) {
      return query.trim();
    }
    return withoutDateText;
  }

  async run(msg, { query }) {
    const parsedResults = chrono.parse(query);

    if (parsedResults.length == 0) {
      return msg.reply(
        oneLine`Sorry, I couldn't parse a date from your input.
          Make sure that your message has a date expression like "_in_ 1 week"
          or "_on_ Friday".`
      );
    }

    const dueDate = parsedResults[0].start.date();
    const dateText = parsedResults[0].text;
    await this.Reminders.create({
      submitterId: msg.author.id,
      channelId: msg.channel.id,
      guildId: msg.guild ? msg.guild.id : null,
      originalMessageId: msg.id,
      messageText: this.getReminderText(query, dateText),
      dueDate,
    });
    return msg.reply(
      `⏰ Alright, I'll remind you ${moment(dueDate).fromNow()}.`
    );
  }
};
