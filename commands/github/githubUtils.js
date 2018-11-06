const utils = require('../../utils.js');
const { oneLine, stripIndents } = require('common-tags');

const INVALID_COMMAND_FORMAT = oneLine`Sorry I was unable to understand your feature request or you did not include a title or
        a detailed description of your feature which the developers need to address your request, 
        please make the request in the format \`[NAME or SHORT DESCRIPTION] - [DETAIL]\`
        e.g. **Reading List - Aggregate a list of all the links posted today**`;

function generateIssueContext(message) {
  const messageLink = utils.getMessageLink(message);

  let messageLinkText = '';
  if (messageLink) {
    messageLinkText = oneLine`
      **[Context](${messageLink})**
      (Will only be viewable if you are a member of this guild)
    `;
  }
  let guildText = '';
  if (message.guild) {
    guildText = stripIndents`
      Guild: ${message.guild.name} (${message.guild.id})
    `;
  }

  let submitterText = oneLine`
    Submitter (Discord Username):
    ${message.author.username}
    (${message.author.id})
  `;

  let channelText = '';
  if (message.channel.type === 'text') {
    channelText = `Channel: #${message.channel.name} (${message.channel.id})`;
  } else if (message.channel.type === 'dm') {
    channelText = 'Reported in a PM to the bot';
  } else {
    channelText = `Reported in a ${message.channel.type} channel`;
  }

  return stripIndents`
    - - -
    ${messageLinkText}
    ${submitterText}
    ${channelText}
    ${guildText}
  `;
}

module.exports = {
  INVALID_COMMAND_FORMAT,
  generateIssueContext,
};
