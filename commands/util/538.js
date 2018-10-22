'use strict';
// credit to https://gist.github.com/malyw/b4e8284e42fdaeceab9a67a9b0263743

const StocksClient = require('../../actions/stocks.js');
const commando = require('discord.js-commando');
const puppeteer = require('puppeteer');
const discord = require('discord.js');

module.exports = class StockCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: '538',
      memberName: '538',
      description: '538',
      group: 'util',
      guildOnly: false,
      args: [
        {
          key: 'chart_type',
          type: 'string',
          oneOf: ['house', 'senate'],
          prompt: 'Which 538 chart do you want?',
          default: 'house',
        },
      ],
    });

    this.stocksClient = new StocksClient();
  }

  async run(msg, { chart_type }) {
    await msg.react('📈');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // Adjustments particular to this page to ensure we hit desktop breakpoint.
    page.setViewport({ width: 1000, height: 600, deviceScaleFactor: 1 });

    await page.goto(
      `https://projects.fivethirtyeight.com/2018-midterm-election-forecast/${chart_type}/#deluxe`
    );

    /**
     * Takes a screenshot of a DOM element on the page, with optional padding.
     *
     * @param {!{path:string, selector:string, padding:(number|undefined)}=} opts
     * @return {!Promise<!Buffer>}
     */
    async function screenshotDOMElement(opts = {}) {
      const padding = 'padding' in opts ? opts.padding : 0;
      const selector = opts.selector;

      if (!selector) {
        throw Error('Please provide a selector.');
      }

      const rect = await page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (!element) {
          return null;
        }
        const { x, y, width, height } = element.getBoundingClientRect();
        return { left: x, top: y, width, height, id: element.id };
      }, selector);

      if (!rect) {
        throw Error(
          `Could not find element that matches selector: ${selector}.`
        );
      }

      return await page.screenshot({
        encoding: 'binary',
        clip: {
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        },
      });
    }

    const buffer = await screenshotDOMElement({
      selector: '.win-prob-trend',
      padding: 20,
    });
    await msg.reply(`538 Predicitions for the ${chart_type} race`, {
      files: [new discord.Attachment(buffer, 'chart.png')],
    });
    await browser.close();
  }
};
