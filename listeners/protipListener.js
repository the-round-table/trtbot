const BaseMessageListener = require('./baseMessageListener.js');
const fs = require('fs');

const proTipRegex = /^Pro-?Tip/gi;

class ProTipListener extends BaseMessageListener {
  async onMessage(message) {
    if (message.author.bot || !message.content.match(proTipRegex)) {
      return;
    }

    const msg = message.content;
    const guild = message.guild;
    const poster = message.author;

    var number = 1;
    if (fs.existsSync('.protip')) {
      try {
        number = parseInt(fs.readFileSync('.protip', 'utf8'));
      } catch (error) {
        console.log('cannot read protip number, resetting count');
      }
    }

    guild.channels
      .get('494715921181442074')
      .send(`ProTip #${number} from ${poster} > ${msg}`);
    await fs.writeFile('.protip', number + 1, 'utf8');
  }
}

module.exports = ProTipListener;
