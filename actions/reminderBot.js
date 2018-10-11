const Sequelize = require('sequelize');
const discord = require('discord.js');
const moment = require('moment');
const truncate = require('truncate');
const utils = require('../utils.js');

const Op = Sequelize.Op;

class ReminderBot {
  constructor(client, Reminders) {
    this.client = client;
    this.Reminders = Reminders;
  }

  async pollReminders() {
    const alertingReminders = await this.Reminders.findAll({
      where: {
        dueDate: {
          [Op.lt]: moment(),
        },
      },
    });

    for (let reminder of alertingReminders) {
      this.alertOnReminder(reminder);
      reminder.destroy();
    }
  }

  alertOnReminder(reminderInstance) {
    const reminder = reminderInstance.get({
      plain: true,
    });
    const channel = this.client.channels.get(reminder.channelId);
    if (!channel) {
      console.error("Can't find channel: " + reminder.channelId);
      return;
    }

    let details = `**Created at:** ${moment(reminder.createdAt).calendar()}`;
    if (reminder.guildId) {
      const messageLink = utils.buildMessageLink(
        reminder.guildId,
        reminder.channelId,
        reminder.originalMessageId
      );
      details += `\n**Context:** [Original Message](${messageLink})`;
    }

    const embed = new discord.RichEmbed()
      .setTitle('⏰ Reminder')
      .addField('Reminder:', truncate(reminder.messageText, 1000))
      .addField('Details:', details);

    channel.send('You asked me to remind you about something:', {
      embed,
      reply: reminder.submitterId,
    });
  }
}

module.exports = ReminderBot;
