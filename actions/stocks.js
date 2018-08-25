const Stocks = require('stocks.js');
const stocks = new Stocks('SYTCQBUIU44BX2G4'); // Default API key

class StocksClient {
  async getSymbol(symbol) {
    const symbolData = await stocks.timeSeries({
      symbol: symbol,
      interval: 'daily',
      amount: 1
    });

    const dayData = symbolData[0];
    return {
      'open': dayData['open'],
      'close': dayData['close']
    };
  }
}

module.exports = StocksClient;