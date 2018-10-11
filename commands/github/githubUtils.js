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

  return stripIndents`
    - - -
    ${messageLinkText}
    ${submitterText}
    Channel: #${message.channel.name} (${message.channel.id})
    ${guildText}
  `;
}

module.exports = {
  INVALID_COMMAND_FORMAT,
  generateIssueContext,
};
