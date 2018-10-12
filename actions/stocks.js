'use strict';

const Stocks = require('stocks.js');
var request = require('request');

const API_KEY = 'SYTCQBUIU44BX2G4'; // Default API key
const stocks = new Stocks(API_KEY);

const CRYPTO_SYMBOLS = ['BTC', 'LTC', 'ETH'];

class StocksClient {
  async getSymbol(symbol) {
    if (CRYPTO_SYMBOLS.indexOf(symbol.toUpperCase()) !== -1) {
      return await this.getCryptoSymbol(symbol);
    }

    // Traditional stocks
    const symbolData = await stocks.timeSeries({
      symbol: symbol,
      interval: 'daily',
      amount: 1,
    });

    const dayData = symbolData[0];
    return {
      open: dayData['open'],
      close: dayData['close'],
      link: this.getInfoLink(symbol),
    };
  }

  async getCryptoSymbol(symbol) {
    return new Promise((resolve, reject) =>
      request(
        {
          url: 'https://www.alphavantage.co/query',
          method: 'GET',
          qs: {
            function: 'DIGITAL_CURRENCY_DAILY',
            symbol,
            market: 'USD',
            apikey: API_KEY,
          },
        },
        (err, _, body) => {
          if (err) {
            return reject(err);
          }
          body = JSON.parse(body);
          if (!body) {
            reject(body);
          }
          const data = body['Time Series (Digital Currency Daily)'];
          const dayData = Object.values(data)[0];
          resolve({
            open: parseFloat(dayData['1a. open (USD)']),
            close: parseFloat(dayData['4b. close (USD)']),
          });
        }
      )
    );
  }

  getInfoLink(symbol) {
    return `https://finance.yahoo.com/quote/${symbol}`;
  }
}

module.exports = StocksClient;
