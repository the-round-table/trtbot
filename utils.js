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

  return null;
}

function getChannel(guild, channelName) {
  const channel = guild.channels.find('name', channelName);
  if (channel) {
    return channel;
  }
  throw new Error(
    `Couldn't find channel ${channelName} in guild ${guild.name}`
  );
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

function getMessageLink(message) {
  return buildMessageLink(message.guild.id, message.channel.id, message.id);
}

function buildMessageLink(guildId, channelId, messageId) {
  return `https://discordapp.com/channels/${guildId}/${channelId}/${messageId}`;
}

module.exports = {
  buildMessageLink,
  getEmbedUrl,
  getMessageLink,
  getPostedUrl,
  postEmbedToChannel,
  postTextToChannel,
};
