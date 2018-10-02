const commando = require('discord.js-commando');

module.exports = class FuckCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'fuck',
      memberName: 'fuck',
      group: 'util',
      description: 'Interprets a line of brainfuck code.',
      examples: ['fuck ++>+++[<+>-]++++++++[<++++++>-]<.'],
      guildOnly: false,
      argsPromptLimit: 0,
      args: [
        {
          key: 'code',
          prompt: 'The brainfuck code you want to execute',
          type: 'string',
        },
      ],
    });
  }

  run(msg, { code }) {
    let arr = new Array(50000).fill(0);
    let ptr = 0;
    let out = 'brainfuck> ';
    let count = 0;
    let loop = 0;

    for (let i = 0; i < code.length && count++ < 5000000; i++) {
      let c = code[i];
      if (c == '>') {
        ptr++;
      } else if (c == '<') {
        ptr--;
      } else if (c == '+') {
        arr[ptr]++;
      } else if (c == '-') {
        arr[ptr]--;
      } else if (c == '.') {
        out += String.fromCharCode(arr[ptr]);
      } else if (c == ',') {
        // don't know how to support user input yet
        continue;
      } else if (c == '[' && arr[ptr] == 0) {
        loop = 0;
        i++;
        while (loop > 0 || code[i] != ']') {
          if (code[i] == '[') {
            loop++;
          }
          if (code[i] == ']') {
            loop--;
          }
          i++;
        }
      } else if (c == ']' && arr[ptr] != 0) {
        loop = 0;
        i--;
        while (loop > 0 || code[i] != '[') {
          if (code[i] == ']') {
            loop++;
          }
          if (code[i] == '[') {
            loop--;
          }
          i--;
        }
        i--;
      }
    }

    msg.reply(out);
  }
};
