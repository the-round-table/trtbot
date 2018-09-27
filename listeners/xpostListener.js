const xpostRegex = /(x(-)?post)/;
const channelRegex = /<#[^>]*>/igm;

var buffer = null;

module.exports = async message => {
  if (message.author.bot) {
    return;
  }
  if (!message.content.match(xpostRegex) || !message.content.match(channelRegex)) {
    buffer = message.content;
    return;
  }
  const msg = message.content;
  const guild = message.guild;
  const srcChannel = message.channel;
  const poster = message.author;  
    
  destChannelIds = message.content.match(channelRegex);
  for (destChannel of destChannelIds) {
    guild.channels.get(destChannel.substring(2,destChannel.length-1)).send(
      `Crossposted from ${srcChannel} by ${poster}:\n> ${buffer}`
    );
  }
}
