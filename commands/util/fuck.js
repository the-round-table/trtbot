const commando = require('discord.js-commando');
const util = require('../../config.js');

module.exports = class FuckCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'fuck',
      memberName: 'fuck',
      group: 'util',
      description:
        'Interprets a line of brainfuck code.',
      examples: ['fuck ++>+++[->+<]++++++++[<++++++>-]<.'],
      guildOnly: true,
      argsPromptLimit: 0,
      args: [
        {
          key: 'code',
          prompt: 'The brainfuck code you want to execute',
          type: 'string'
        }
      ]
    });
  }

  async run(msg, { code }) {
    var arr = new Array(50000).fill(0);;
    var ptr = 0;
    var out = "brainfuck> ";
    for (var i = 0; i < code.length; i++) {
      var c = code[i];
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
      } else if (c == '[') {
        var loop = 1;
        if (arr[ptr] == 0) {
          while (loop != 0) {
            i++;
            if (code[i] == '[') {
              loop++;
            } else if (code[i] == ']') {
              loop--;
            }
          }
        }
      } else if (c == ']' && arr[ptr] == 0) {
        var loop = 1;
        while (loop != 0) {
          i--;
          if (code[i] == '[') {
            loop--;
          } else if (code[i] == ']') {
            loop++;
          }
        }
      }
    }
    msg.reply(output);
  }
};
