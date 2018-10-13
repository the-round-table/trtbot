const StocksClient = require('../../actions/stocks.js');
const commando = require('discord.js-commando');

module.exports = class StockCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'stock',
      memberName: 'stock',
      group: 'util',
      description: 'Provides information about a stock symbol',
      examples: ['stock $AAPL'],
      aliases: ['stocks', 'stocksymbol'],
      guildOnly: false,
      args: [
        {
          key: 'symbol',
          prompt: 'What stock symbol are you looking for?',
          type: 'string',
        },
        {
          key: 'interval',
          prompt: 'What interval do you want intformation for the stock over?',
          type: 'string',
          oneOf: ['day', 'month', 'year', 'max'],
          default: 'day',
        },
      ],
    });

    this.stocksClient = new StocksClient();
  }

  async run(msg, { symbol, interval }) {
    const stocksResponse = await this.stocksClient.generateStockResponse(
      symbol,
      interval
    );
    return await msg.reply(stocksResponse);
  }
};
