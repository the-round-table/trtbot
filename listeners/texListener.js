const Hashids = require('hashids');
const {MessageAttachment} = require('discord.js');
const mathjax = require('mathjax-node-svg2png');
const fs = require("fs");

mathjax.config({
  MathJax: {
  },
});
mathjax.start();

const TEX_REGEX = /\$\$(.*?)\$\$/sg;
const TEX_TAG = /\$\$/sg;

async function renderMath(m) {
  var hashid = new Hashids();
  var hash = hashid.encode(Date.now());
  var data = await mathjax.typeset({
    math: m,
    format: 'TeX',
    png:true
  });
  var base64Data = data.png.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(`/tmp/${hash}.png`,  base64Data, 'base64');
  return hash;
}

async function sendImage(srcChannel, hash) {
  srcChannel.send({files: [{ 
    attachment: `/tmp/${hash}.png`, 
    name: `/tmp/${hash}.png` }]}).catch(err => {console.log(err);});
}

module.exports = async message => {
  const msg = message.content;
  const guild = message.guild;
  const srcChannel = message.channel;
  const poster = message.author;

  if (!msg.match(TEX_REGEX)) {
    return;
  }

  var tex_str = msg.match(TEX_REGEX);
  var tex_math = tex_str.map(s => s.replace(TEX_TAG, ''));
  tex_math.map(async (m) => {
    const hash = await renderMath(m);
    sendImage(srcChannel, hash);
 });
};
