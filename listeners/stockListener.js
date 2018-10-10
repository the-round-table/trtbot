const _ = require('lodash');
const symbolRegex = /((^)|(\s+))(\$[A-Z]{1,5})($|\W)/gi;
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
      let symbolData;
      try {
        symbolData = await client.getSymbol(symbol);
      } catch (error) {
        continue;
      }

      if (!reacted) {
        message.react('📊');
        reacted = true;
      }

      const percentChange =
        ((symbolData.close - symbolData.open) / symbolData.open) * 100;
      const changeSymbol = percentChange > 0 ? '+' : '-';
      const absChange = Math.abs(symbolData.close - symbolData.open);

      let response = `${symbol}: `;
      response += `($${symbolData.close.toFixed(2)}; `;
      response += `${changeSymbol}${Math.abs(percentChange).toFixed(2)}%; `;
      response += `${changeSymbol} $${absChange.toFixed(2)})`;
      message.reply(response);
    }
  }
}

module.exports = StockListener;
