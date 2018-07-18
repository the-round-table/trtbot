const getUrls = require('get-urls');

function getEmbedUrl(message) {
  var link = undefined;
  message.embeds.forEach(embed => {
    if (embed.url) {
      link = embed.url;
    }
  });
  return link;
}

function getPostedUrl(message) {
  const embedUrl = getEmbedUrl(message);
  if (embedUrl) {
    return embedUrl;
  }

  const urlSet = getUrls(message.content);
  if (urlSet.size > 0) {
    return urlSet.values().next().value;
  }
}

function getChannel(guild, channelName) {
  guild.channels.forEach(async channel => {
    if (channel.name === channelName) {
      return channel;
    }
  });
  console.error(`Couldn't find channel ${channelName} in guild ${guild.name}`);
}

function postEmbedToChannel(guild, embed, channelName) {
  const channel = getChannel(guild, channelName);
  if (channel) {
    channel.send({ embed });
  }
}

function postTextToChannel(guild, text, channelName) {
  const channel = getChannel(guild, channelName);
  if (channel) {
    channel.send(text);
  }
}

module.exports = {
  getEmbedUrl,
  getPostedUrl,
  postEmbedToChannel,
  postTextToChannel
};
