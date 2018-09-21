const commando = require('discord.js-commando');
const _ = require('lodash');

const NO_OPTS = 'no_opts';

module.exports = class PollCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'poll',
      memberName: 'poll',
      group: 'util',
      description: 'Creates polls',
      examples: ['poll', 'poll opt0 opt1'],
      guildOnly: false,
      args: [
        {
          key: 'opts',
          prompt: 'What poll options do you want?',
          type: 'string',
          default: NO_OPTS
        }
      ]
    });
  }

  async run(msg, { opts }) {
    let poll;
    if (opts == NO_OPTS) {
      poll_data = "No options provided";
    } else {
      poll_data = "React with one of the following emotes\n";
      var opt_data = opts.split(" ");
      for each (var option in opt_data) {
        poll_data = poll_data + "emote: " + option + "\n";
      }
    }

    if (!poll) {
      msg.reply("Couldn't create poll.");
    } else {
      msg.reply(poll_data);
    }
  }
};
