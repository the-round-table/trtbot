const Hashids = require('hashids');
const mathjax = require('mathjax-node-svg2png');
const discord = require('discord.js');
const BaseMessageListener = require('./baseMessageListener.js');

mathjax.config({
  MathJax: {},
});
mathjax.start();

const TEX_REGEX = /\$\$(.*?)\$\$/gs;
const TEX_TAG = /\$\$/gs;

async function renderMath(m) {
  var data = await mathjax.typeset({
    math: m,
    format: 'TeX',
    png: true,
  });
  return data.png.replace(/^data:image\/png;base64,/, '');
}

async function sendImage(srcChannel, base64Data) {
  srcChannel
    .send(new discord.Attachment(Buffer.from(base64Data, 'base64'), 'tex.png'))
    .catch(err => {
      console.log(err);
    });
}

class TexListener extends BaseMessageListener {
  async onMessage(message) {
    const msg = message.content;
    const srcChannel = message.channel;

    if (!msg.match(TEX_REGEX)) {
      return;
    }

    await message.react('🔢');

    const tex_str = msg.match(TEX_REGEX);
    const tex_math = tex_str.map(s => s.replace(TEX_TAG, ''));
    tex_math.map(async m => {
      const base64Data = await renderMath(m);
      sendImage(srcChannel, base64Data);
    });
  }
}

module.exports = TexListener;
