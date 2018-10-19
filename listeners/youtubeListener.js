const Youtube = require('simple-youtube-api');
const config = require('../config.js');
const BaseMessageListener = require('./baseMessageListener.js');
const oneLine = require('common-tags').oneLine;

const DURATION_REPORT_THRESHOLD = 300; // 5 minutes

class YoutubeListener extends BaseMessageListener {
  constructor() {
    super({
      name: 'youtube',
      description: oneLine`Responds to Youtube links with the video's duration
        for videos over 5 minutes in length`,
      linkValidator: () => true, // Accept only posts that have links
    });
    this.youtubeClient = new Youtube(config.YOUTUBE_API_KEY);
  }

  async onMessage(message) {
    message.embeds.forEach(embed => {
      if (embed.provider && embed.provider.name === 'YouTube') {
        this.youtubeClient
          .getVideo(embed.url)
          .then(video => {
            if (video.durationSeconds < DURATION_REPORT_THRESHOLD) {
              return;
            }
            var resp = `🎬 Video Duration: `;
            if (video.duration.hours > 0) {
              resp += `${video.duration.hours}h `;
            }
            if (video.duration.minutes > 0) {
              resp += `${video.duration.minutes}m `;
            }
            if (video.duration.seconds > 0) {
              resp += `${video.duration.seconds}s `;
            }
            message.reply(resp);
          })
          .catch(console.error);
      }
    });
  }
}

module.exports = YoutubeListener;
