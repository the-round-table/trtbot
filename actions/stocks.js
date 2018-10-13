'use strict';

const Stocks = require('stocks.js');
const request = require('request');
const _ = require('lodash');
const ChartjsNode = require('chartjs-node');
const moment = require('moment');

if (global.CanvasGradient === undefined) {
  global.CanvasGradient = function() {};
}

const API_KEY = 'SYTCQBUIU44BX2G4'; // Default API key
const stocks = new Stocks(API_KEY);

const CRYPTO_SYMBOLS = ['BTC', 'LTC', 'ETH'];

const RED = 'rgb(200, 0, 0, 0.5)';
const GREEN = 'rgb(0, 200, 0, 0.5)';

class StocksClient {
  async getSymbol(symbol) {
    if (CRYPTO_SYMBOLS.indexOf(symbol.toUpperCase()) !== -1) {
      return await this.getCryptoSymbol(symbol);
    }

    // Traditional stocks
    let symbolData = await stocks.timeSeries({
      symbol: symbol,
      interval: '5min',
      amount: 8 * 12,
    });

    symbolData = symbolData.filter(data =>
      moment(data.date).isAfter(moment().startOf('day'))
    );

    let chart;
    try {
      chart = await this._getStockChart(symbol, symbolData);
    } catch (err) {
      console.error(err);
    }

    return {
      open: _.last(symbolData).open,
      close: _.first(symbolData).close,
      link: this._getInfoLink(symbol),
      chart,
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

  _getInfoLink(symbol) {
    return `https://finance.yahoo.com/quote/${symbol}`;
  }

  async _getStockChart(symbol, symbolData) {
    const chartData = symbolData.map(day => {
      return { t: moment.utc(day.date), y: day.close };
    });

    const color = _.first(chartData).y < _.last(chartData).y ? RED : GREEN;

    var chartConfig = {
      type: 'line',
      data: {
        datasets: [
          {
            backgroundColor: color,
            label: `${symbol}`,
            data: chartData,
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        scales: {
          yAxes: [
            {
              ticks: {
                callback: value => '$' + value,
              },
            },
          ],
          xAxes: [
            {
              type: 'time',
              time: {
                displayFormats: {
                  quarter: 'MMM YYYY',
                },
              },
            },
          ],
        },
        tooltips: {
          mode: 'label',
        },
      },
      plugins: {
        beforeDraw: function(chart) {
          var ctx = chart.chart.ctx;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, chart.chart.width, chart.chart.height);
        },
      },
    };

    const chartNode = new ChartjsNode(800, 400);
    await chartNode.drawChart(chartConfig);
    const buffer = await chartNode.getImageBuffer('image/png');
    chartNode.destroy();
    return buffer;
  }
}

module.exports = StocksClient;
