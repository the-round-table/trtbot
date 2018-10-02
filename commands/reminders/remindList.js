const commando = require('discord.js-commando');
const discord = require('discord.js');
const moment = require('moment');

module.exports = class RemindMeCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'remindlist',
      memberName: 'remindlist',
      group: 'reminders',
      description: 'Lists your active reminders',
      guildOnly: false,
    });
    this.Reminders = client.Reminders;
  }

  async run(msg) {
    const activeReminders = (await this.Reminders.findAll({
      where: {
        submitterId: msg.author.id,
      },
    })).map(record => record.get({ plain: true }));

    if (activeReminders.length > 0) {
      const embed = new discord.RichEmbed().addField(
        'Reminders',
        activeReminders.map(this.formatReminderItem).join('\n')
      );
      await msg.author.send(embed);
    } else {
      await msg.author.send('You have no active reminders right now!');
    }

    if (msg.guild) {
      await msg.reply("I've messaged you your active reminders.");
    }

    return null;
  }

  formatReminderItem(reminder) {
    const formattedDueDate = moment(reminder.dueDate).calendar();
    return `- ${reminder.messageText} (${formattedDueDate})`;
  }
};
