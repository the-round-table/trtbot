const commando = require('discord.js-commando');
const discord = require('discord.js');
const _ = require('lodash');
const wiki = require('wikijs').default;
const truncate = require('truncate');

module.exports = class WikiCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'wiki',
      memberName: 'wiki',
      group: 'util',
      description: 'Finds the summary of a Wikipedia page for you',
      examples: ['wiki philosophy', 'wiki cats'],
      guildOnly: false,
      args: [
        {
          key: 'query',
          prompt: 'What page are you searching for?',
          type: 'string',
        },
      ],
    });
  }

  async run(msg, { query }) {
    let page;
    try {
      page = await wiki().find(query);
    } catch (e) {
      console.error(e);
      msg.reply(`Couldn't get a page for "${query}". 😞`);
      return;
    }

    let summary;
    try {
      summary = await page.summary();
    } catch (e) {
      console.error(e);
      msg.reply(`Couldn't get a summary for "${query}". 😞`);
      return;
    }

    let mainImage;
    try {
      mainImage = await page.mainImage();
    } catch (e) {
      console.error(e);
    }

    const embed = new discord.RichEmbed()
      .setTitle(`📖 ${page.raw.title}`)
      .setURL(page.raw.fullurl)
      .addField('Summary', truncate(summary, 1000));
    if (mainImage) {
      embed.setImage(mainImage);
    }
    msg.reply({ embed });
  }
};
