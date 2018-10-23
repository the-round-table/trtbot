const commando = require('discord.js-commando');
const giphy = require('giphy-api')();
const _ = require('lodash');

const NO_QUERY = 'no_query';

module.exports = class GifCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'gif',
      memberName: 'gif',
      group: 'util',
      description: 'Finds a gif for you',
      examples: ['gif', 'gif cats'],
      guildOnly: false,
      args: [
        {
          key: 'query',
          prompt: 'What type of gif would you like?',
          type: 'string',
          default: NO_QUERY,
        },
      ],
    });
  }

  async run(msg, { query }) {
    let gif;
    if (query == NO_QUERY) {
      gif = (await giphy.random({ rating: 'pg' })).data;
    } else {
      gif = _.sample((await giphy.search({ q: query, limit: 5 })).data);
    }

    if (!gif) {
      msg.reply("Couldn't find a gif. 😞");
    } else {
      msg.reply(gif.embed_url);
    }
  }
};
