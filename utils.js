const getUrls = require('get-urls');
const discord = require('discord.js');
const isImageUrl = require('is-image-url');

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
  if (message instanceof discord.Message) {
    const embedUrl = getEmbedUrl(message);
    if (embedUrl) {
      return embedUrl;
    }
  }

  const text = message instanceof discord.Message ? message.content : message;
  const urlSet = getUrls(text);
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
  if (!message || !message.guild || !message.channel) {
    return null;
  }
  return buildMessageLink(message.guild.id, message.channel.id, message.id);
}

function buildMessageLink(guildId, channelId, messageId) {
  return `https://discordapp.com/channels/${guildId}/${channelId}/${messageId}`;
}

async function formatImageLinkAsMessage(link) {
  // Link is bare image link
  if (isImageUrl(link, false)) {
    return new discord.RichEmbed().setImage(link);
  }

  // Link is "disguised" image link
  if (isImageUrl(link, true)) {
    const res = await fetch(link);
    if (res.ok) {
      const buffer = await res.buffer();
      return {
        files: [new discord.Attachment(Buffer.from(buffer), 'attachment')],
      };
    }
    return link;
  }

  // Fallback to just posting message link
  return link;
}

// Takes in a string with arguments seperated by '-' and returns an array of arguments
// Allows the delimiter to be escaped with \
function argparse(str) {
  return str.replace(/\\?\-/g, (t) => t == '-' ? '\u000B' : '-').split('\u000B');
}

module.exports = {
  buildMessageLink,
  formatImageLinkAsMessage,
  getEmbedUrl,
  getMessageLink,
  getPostedUrl,
  postEmbedToChannel,
  postTextToChannel,
  argparse,  
};
