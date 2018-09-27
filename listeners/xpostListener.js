const xpostRegex = /(x(-)?post)/;
const channelRegex = /#([a-zA-Z]+)/igm;

module.exports = async message => {
  if (!message.content.match(xpostRegex)) {
    return;
  }
  const msg = message.content;
  const guild = message.guild;
  const srcChannel = message.channel;
  const poster = message.submitter;  

  destChannelNames = message.content.match(channelRegex);
  //Name has # preprended
  destChannels = destChannelNames.map(d => guild.channels.find(d));
  
  for (destChannel of destChannels) {
     destChannel.send(
       `x-posted from ${srcChannel}:by ${poster}:\n>"${msg}"`
     );
  }
}
