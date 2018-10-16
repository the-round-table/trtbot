const _ = require('lodash');
const symbolRegex = /(^|\s)(\$[A-Z]{1,5})\b/i;
const StocksClient = require('../actions/stocks.js');
const BaseMessageListener = require('./baseMessageListener.js');

class StockListener extends BaseMessageListener {
  async onMessage(message) {
    const symbols = _.chain(message.content.match(symbolRegex))
      .map(_.trim)
      .map(_.toUpper)
      .map(symbol => symbol.substr(1))
      .value();

    const client = new StocksClient();

    let reacted = false;
    for (let symbol of symbols) {
      if (!reacted) {
        message.react('📊');
        reacted = true;
      }
      const stockResponse = await client.generateStockResponse(symbol, 'day');
      await message.reply(stockResponse);
    }
  }
}

module.exports = StockListener;
