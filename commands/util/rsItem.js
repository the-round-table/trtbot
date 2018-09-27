const commando = require('discord.js-commando');
const discord = require('discord.js');
const fuzzysearch = require('fuzzysearch');

const ITEM_2_ID = require('./rsItem/rsItemIdMap.js');

module.exports = class GifCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'rs-item',
      memberName: 'rs-item',
      group: 'util',
      description: 'Provides information about a 2007scape item',
      examples: ['rs-item Abyssal whip'],
      guildOnly: false,
      args: [
        {
          key: 'query',
          prompt: 'What item are you looking for?',
          type: 'string',
          default: '',
        }
      ]
    });
  }

  async run(msg, { query }) {
    let id = ITEM_2_ID[query];
    if ( !id ) {
      const results = Object.keys(ITEM_2_ID)
        .filter(name => fuzzysearch(query, name))
        .splice(0, 5);

      if ( results.length === 0 ) {
        msg.reply('Fuzzy search for ' + query + ' failed :-(')
        return
      }

      msg.reply(
        'No such item. Did you mean one of these?\n' +
        results.join('\n')
      );
      return
    }
    try {
      let res = await fetch(
        'http://services.runescape.com/' +
        'm=itemdb_oldschool/api/catalogue/detail.json?item=' + id
      )
      .then(res => res.json())

      const item = res['item'];
      const embed = new discord.RichEmbed()
        .setTitle(`📖 ${query}`)
        .setURL(
          'http://oldschoolrunescape.wikia.com/wiki/' +
          query.replace(' ', '_')
        )
        .setImage(item['icon_large'])
        .setDescription(item['description'])
        .addField(
          'Members Only?',
          item['members'] === 'true' ? 'yes' : 'no',
          true
        )
        .addField('Price', item['current']['price'], true)
        .addField('Current Trend', item['current']['trend'], true)
        .addField(
          'Today\'s Trend',
          item['today']['trend'] + ' (' + item['today']['price'] + ')',
          true
        )
        .addField(
          '1-Month Trend',
          item['day30']['trend'] + ' (' + item['day30']['change'] + ')',
          true
        )
        .addField(
          '3-Month Trend',
          item['day90']['trend'] + ' (' + item['day90']['change'] + ')',
          true
        )
        .addField(
          '6-Month Trend',
          item['day180']['trend'] + ' (' + item['day180']['change'] + ')',
          true
        )
        msg.reply({ embed })
    } catch (e) {
      console.log(e);
    }

  }
};
