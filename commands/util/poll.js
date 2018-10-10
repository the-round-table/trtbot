const commando = require('discord.js-commando');
const _ = require('lodash');

const NO_OPTS = 'no_opts';
const POLL_EMOTES = [
  `1⃣`,
  `2⃣`,
  `3⃣`,
  `4⃣`,
  `5⃣`,
  `6⃣`,
  `7⃣`,
  `8⃣`,
  `9⃣`,
  `🔟`,
];

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
          key: 'question',
          prompt: 'What question should the poll ask?',
          type: 'string',
        },
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

  async run(msg, { question, opts }) {
    let poll_data;
    if (opts === NO_OPTS) {
      poll_data = `No options provided`;
    } else if (opts.length > POLL_EMOTES.length) {
      poll_data = `Too many options provided`;
    } else {
      poll_data = `**"${question}"**\n_React with one of the following emotes:_\n`;
      for (let emoji_ind = 0; emoji_ind < opts.length; emoji_ind++) {
        poll_data += `${POLL_EMOTES[emoji_ind]} ${opts[emoji_ind]}\n`;
      }
    }

    if (!poll_data) {
      msg.reply("Couldn't create poll.");
    } else {
      let resp_msg = await msg.channel.send(poll_data);
      for (let emoji_ind = 0; emoji_ind < opts.length; emoji_ind++) {
        await resp_msg.react(`${POLL_EMOTES[emoji_ind]}`);
      }
    }
  }
};
