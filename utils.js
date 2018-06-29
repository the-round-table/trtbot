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

module.exports = {
  getEmbedUrl,
  getPostedUrl
};
