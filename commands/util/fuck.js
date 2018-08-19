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
      examples: ['fuck ++>+++[<+>-]++++++++[<++++++>-]<.'],
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
      if (c == ">") {
        ptr++;
      } else if (c == "<") {
        ptr--;
      } else if (c == "+") {
        arr[ptr]++;
      } else if (c == "-") {
        arr[ptr]--;
      } else if (c == ".") {
        out += String.fromCharCode(arr[ptr]);
      } else if (c == ",") {
        // don't know how to support user input yet
        continue;
      } else if (c == "[" && arr[ptr] == 0) {
        var loop = 0;
        i++;
        while (loop > 0 || code[i] != "]") {
          if (code[i] == "[") {
            loop++;
          }
          if (code[i] == "]") {
            loop--;
          }
          i++;
        }
      } else if (c == "]" && arr[ptr] != 0) {
        var loop = 0;
        i--;
        while (loop > 0 || code[i] != "[") {
          if (code[i] == "]") {
            loop++;
          }
          if (code[i] == "[") {
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
