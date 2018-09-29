const xpostRegex = /(x(-)?post)/i;
const channelRegex = /<#[^>]*>/gim;

var buffer = {};

module.exports = async message => {
  if (message.author.bot) {
    return;
  }

  const msg = message.content;
  const guild = message.guild;
  const srcChannel = message.channel;
  const poster = message.author;

  if (
    !message.content.match(xpostRegex) ||
    !message.content.match(channelRegex)
  ) {
    buffer[srcChannel] = msg;
    return;
  }

  const destChannelIds = new Set(message.content.match(channelRegex));
  for (let destChannel of destChannelIds) {
    if (destChannel != srcChannel) {
      guild.channels
        .get(destChannel.substring(2, destChannel.length - 1))
        .send(
          `Crossposted from ${srcChannel} by ${poster}:\n> ${
            buffer[srcChannel]
          }`
        );
    }
  }
};
