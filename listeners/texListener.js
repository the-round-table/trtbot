const mathjax = require('mathjax-node-svg2png');
const discord = require('discord.js');
const BaseMessageListener = require('./baseMessageListener.js');
const oneLine = require('common-tags').oneLine;

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
  constructor() {
    super({
      name: 'tex',
      description: oneLine`Renders inline Latex markdown. Anything inside
        double $'s will be rendered. (i.e. $$y = x^2$$)`,
      messageRegex: TEX_REGEX,
    });
  }

  async onMessage(message) {
    const msg = message.content;
    const srcChannel = message.channel;

    await message.react('🔢');

    const tex_str = msg.match(TEX_REGEX);
    const tex_math = tex_str.map(s => s.replace(TEX_TAG, ''));
    tex_math.map(async m => {
      if (m.trim().length === 0) {
        return;
      }
      let base64Data;
      try {
        base64Data = await renderMath(m);
      } catch (error) {
        await message.author.send(
          `Error rendering latex: "${error}"\nOriginal message: "$${m}$"`
        );
        await message.react('❌');
        return;
      }
      await sendImage(srcChannel, base64Data);
    });
  }
}

module.exports = TexListener;
