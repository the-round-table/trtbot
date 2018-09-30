const Hashids = require('hashids');
const mathjax = require('mathjax-node-svg2png');
const fs = require("fs");

mathjax.config({
  MathJax: {
  }
});
mathjax.start();

const TEX_REGEX = /\$\$(.*?)\$\$/sg;
const TEX_TAG = /\$\$/sg;

async function renderMath(m) {
  hashid = new Hashids();
  hash = hashid.encode(Date.now());
  var data = await mathjax.typeset({
    math: m,
    format: "TeX",
    png:true
  });
  var base64Data = data.png.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync(`/tmp/${hash}.png`,  base64Data, 'base64');
  return hash;
}

async function sendImage(srcChannel, hash) {
  await hash;
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

  tex_str = msg.match(TEX_REGEX);
  tex_math = tex_str.map(s => s.replace(TEX_TAG, ''));
  tex_math.map(m => renderMath(m).then(h => sendImage(srcChannel, h)).catch(err => {console.log(err);}));
};
