const commando = require('discord.js-commando');
const _ = require('lodash');

const NO_OPTS = 'no_opts';
const POLL_EMOTES = [`one`, `two`, `three`, `four`, `five`, `six`, `seven`, `eight`, `nine`, `ten`];

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
          infinite: true,
          default: NO_OPTS,
        },
      ],
    });
  }

  async run(msg, { opts }) {
    let poll_data;
    if (opts == NO_OPTS) {
      poll_data = `No options provided`;
    } else {
      poll_data = `React with one of the following emotes\n`;
      var opt_data = opts.split(" "); 
      for (let emoji_ind = 0; emoji_ind < opt_data.length; emoji_ind++) {
        poll_data += `:${POLL_EMOTES[emoji_ind]}: ${option}\n`;
      }
    }

    if (!poll_data) {
      msg.reply("Couldn't create poll.");
    } else {
      let resp_msg = msg.reply(poll_data);
      for (let emoji_ind = 0; emoji_ind < opt_data.length; emoji_ind++) {
        resp_msg.react(`:${POLL_EMOTES[emoji_ind]}:`);
      }
    }
  }
};
