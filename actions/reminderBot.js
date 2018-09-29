const Sequelize = require('sequelize');
const discord = require('discord.js');
const moment = require('moment');
const truncate = require('truncate');

const Op = Sequelize.Op;

class ReminderBot {
  constructor(client, Reminders) {
    this.cleint = client;
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

  alertOnReminder(reminder) {
    const channel = this.client.channels.find(reminder.channelId);
    const message = new discord.RichEmbed()
      .setTitle('⏰ Reminder')
      .setDescription('You asked me to remind you about something:')
      .addField('Original Message', truncate(reminder.messageText, 1000));
    channel.send(message);
  }
}

module.exports = ReminderBot;
