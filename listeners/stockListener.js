const _ = require('lodash');
const oneLine = require('common-tags').oneLine;
const symbolRegex = /((^)|(\s+))(\$[A-Z]{1,4})($|\W)/gi;
const StocksClient = require('../actions/stocks.js');

module.exports = async message => {
  const symbols = _.chain(message.content.match(symbolRegex))
    .map(_.trim)
    .map(_.toUpper)
    .map(symbol => symbol.substr(1))
    .value();

  const client = new StocksClient();
  for (let symbol of symbols) {
    const symbolData = await client.getSymbol(symbol);
    const percentChange =
      ((symbolData.close - symbolData.open) / symbolData.open) * 100;
    const changeSymbol = percentChange > 0 ? '+' : '-';
    message.reply(oneLine`${symbol}:
      ${symbolData.close}
      (
        ${changeSymbol}${Math.abs(percentChange).toFixed(2)}%;
        ${changeSymbol}$${Math.abs(symbolData.close - symbolData.open).toFixed(
      2
    )}
      )`);
  }
};
