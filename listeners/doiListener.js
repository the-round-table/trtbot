const discord = require('discord.js');
const Cite = require('citation-js');
const moment = require('moment');
const oneLine = require('common-tags').oneLine;
const BaseMessageListener = require('./baseMessageListener.js');

const DOI_REGEX = /(((https?:\/\/)?(www\.)?)?(doi.org)\/|((doi|DOI):)).+(-|.)[a-z0-9]+/;
const DOI_SPLIT_REGEX = /((https?:\/\/)?(www\.)?)?(doi.org)\/|((doi|DOI):)/;

class DoiListener extends BaseMessageListener {
  constructor() {
    super({
      name: 'scihub',
      description: oneLine`Responds to DOIs with a SciHub link to get around non open-access journals.`,
      messageRegex: DOI_REGEX,
    });
  }

  async onMessage(message) {
    const doi = message.content.match(DOI_REGEX)[0];
    const doiCode = doi.replace(DOI_SPLIT_REGEX, "").trim();
    let citation = await Cite.async(doiCode);
    let info = citation.data[0];  

    let title = info.title.split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');

    
    const embed = new discord.RichEmbed()
      .setTitle(`📄 [SciHub] "${title}"`)
      .addField(
          'Authors', info.author.map(author => `${author.given} ${author.family}`).join(', ')
      )
      .addField('Subject', info.subject.join(', '))
      .addField('Published In', info['container-title'])
      .addField('Date Published',  moment(info.deposited['date-time']).format('LL'))          
      .addField(
        'Read Here:',
        `https://sci-hub.tw/${doiCode}}`
      );
      message.reply({ embed });
  }
}

module.exports = DoiListener;
