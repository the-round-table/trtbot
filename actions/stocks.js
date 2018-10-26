'use strict';

const Stocks = require('stocks.js');
const request = require('request');
const _ = require('lodash');
const ChartjsNode = require('chartjs-node');
const moment = require('moment');
const discord = require('discord.js');

if (global.CanvasGradient === undefined) {
  global.CanvasGradient = function() {};
}

const API_KEY = 'SYTCQBUIU44BX2G4'; // Default API key
const stocks = new Stocks(API_KEY);

const CRYPTO_SYMBOLS = ['BTC', 'LTC', 'ETH'];

const RED = 'rgb(200, 0, 0, 0.5)';
const GREEN = 'rgb(0, 200, 0, 0.5)';

class StocksClient {
  async generateStockResponse(symbol, interval) {
    symbol = symbol.toUpperCase();

    let symbolData = await this._getSymbol(symbol, interval);
    if (symbolData == null) {
      return `Unable to get stock information on ${symbol}`;
    }

    const percentChange =
      ((symbolData.close - symbolData.open) / symbolData.open) * 100;
    const changeSymbol = percentChange > 0 ? '+' : '-';
    const absChange = Math.abs(symbolData.close - symbolData.open);

    let response = new discord.RichEmbed();

    let responseText = '';
    responseText += symbolData.link
      ? `[${symbol}](${symbolData.link}): `
      : `${symbol}: `;
    responseText += `($${symbolData.close.toFixed(2)}; `;
    responseText += `${changeSymbol}${Math.abs(percentChange).toFixed(2)}%; `;
    responseText += `${changeSymbol} $${absChange.toFixed(2)})`;

    const attachments = symbolData.chart
      ? [new discord.Attachment(symbolData.chart, 'chart.png')]
      : [];
    return {
      embed: response.setDescription(responseText),
      files: attachments,
    };
  }

  async _getSymbol(symbol, interval) {
    if (CRYPTO_SYMBOLS.indexOf(symbol) !== -1) {
      return await this._getCryptoSymbol(symbol);
    }

    // Traditional stocks
    let symbolData;
    try {
      symbolData = await stocks.timeSeries({
        symbol: symbol,
        ...this._getAPICallOptionsForInterval(interval),
      });
    } catch (err) {
      console.error(`Unable to get stock information on ${symbol}`);
      console.error(err);
      return null;
    }

    let chart;
    try {
      if (symbolData) {
        chart = await this._getStockChart(symbol, symbolData);
      }
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

  async _getCryptoSymbol(symbol) {
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
    const chartData = symbolData.map((day, index) => {
      return {
        x: symbolData.length - index - 1,
        y: day.close,
        time: moment(day.date),
      };
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
              type: 'linear',
              ticks: {
                min: 0,
                max: chartData.length - 1,
                callback: value => {
                  const dataPoint = _.find(chartData, { x: value });
                  if (dataPoint) {
                    return dataPoint.time.format('M/D/YY hhA');
                  }
                  return '';
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

  _getAPICallOptionsForInterval(interval) {
    switch (interval) {
      case 'day':
        return {
          interval: '5min',
          amount: 8 * 12,
        };
      case 'week':
        return {
          interval: '60min',
          amount: 8 * 24,
        };
      case 'month':
        return {
          interval: 'daily',
          amount: 30,
        };
      case 'year':
        return {
          interval: 'daily',
          amount: 365,
        };
      case 'max':
        return {
          interval: 'daily',
        };
    }
  }
}

module.exports = StocksClient;
