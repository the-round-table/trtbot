const Hashids = require('hashids');
const mathjax = require('mathjax-node-svg2png');
const fs = require('fs');
const BaseMessageListener = require('./baseMessageListener.js');

mathjax.config({
  MathJax: {},
});
mathjax.start();

const TEX_REGEX = /\$\$(.*?)\$\$/gs;
const TEX_TAG = /\$\$/gs;

async function renderMath(m) {
  var hashid = new Hashids();
  var hash = hashid.encode(Date.now());
  var data = await mathjax.typeset({
    math: m,
    format: 'TeX',
    png: true,
  });
  var base64Data = data.png.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(`/tmp/${hash}.png`, base64Data, 'base64');
  return hash;
}

async function sendImage(srcChannel, hash) {
  srcChannel
    .send({
      files: [
        {
          attachment: `/tmp/${hash}.png`,
          name: `/tmp/${hash}.png`,
        },
      ],
    })
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
      const hash = await renderMath(m);
      sendImage(srcChannel, hash);
    });
  }
}

module.exports = TexListener;
