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
    const messageLink = utils.getMessageLink(
      reminder.guildId,
      reminder.channelId,
      reminder.originalMessageId
    );
    const embed = new discord.RichEmbed()
      .setTitle('⏰ Reminder')
      .addField('Reminder:', truncate(reminder.messageText, 1000));
    if (reminder.guildId) {
      embed.addField('Context:', `[Original Message](${messageLink})`);
    }

    channel.send('You asked me to remind you about something:', {
      embed,
      reply: reminder.submitterId,
    });
  }
}

module.exports = ReminderBot;
