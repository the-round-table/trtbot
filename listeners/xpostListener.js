const xpostRegex = /(x(-)?post)/;
const channelRegex = /#([a-zA-Z]+)/igm;

module.exports = async message => {
  if (!message.content.match(xpostRegex)) {
    return;
  }
  const msg = message.content;
  const srcChannel = message.channel;
  const poster = message.submitter;  

  destChannels = message.content.match(channelRegex);
    
  for (destChannel of destChannels) {
     destChannel.send(
       `x-posted from ${srcChannel}:by ${poster}:\n>"${msg}"`
     );
  }
}
