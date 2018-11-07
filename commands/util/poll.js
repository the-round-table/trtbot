const commando = require('discord.js-commando');
const discord = require('discord.js');

const USAGE = 'Usage: [QUESTION]? [OPTION1], [OPTION2], [OPTION3]...';
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
      examples: ['poll', 'poll Do you like cake or pie? cake, pie'],
      guildOnly: false,
      argsType: 'single',
    });
  }

  async run(msg, args) {
    let [question, ...opts] = args.split('?');
    question = question.trim();
    opts = opts
      .join(' ')
      .split(',')
      .map(opt => opt.trim());

    if (!question || !opts || opts.length === 0) {
      return await msg.reply('Incorrect Usage. ' + USAGE);
    } else if (opts.length > POLL_EMOTES.length) {
      return await msg.reply(
        `Too many options provided. (Maximum is ${POLL_EMOTES.length})`
      );
    }

    let poll_options = `\n_React with one of the following emotes:_\n`;
    for (let emoji_ind = 0; emoji_ind < opts.length; emoji_ind++) {
      poll_options += `${POLL_EMOTES[emoji_ind]} ${opts[emoji_ind]}\n`;
    }

    const embed = new discord.RichEmbed()
      .setTitle(`Poll: ${question}?`)
      .setDescription(poll_options);
    const poll_msg = await msg.channel.send(embed);

    for (let emoji_ind = 0; emoji_ind < opts.length; emoji_ind++) {
      await poll_msg.react(`${POLL_EMOTES[emoji_ind]}`);
    }
    return poll_msg;
  }
};
