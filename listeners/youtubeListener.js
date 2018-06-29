const Youtube = require('simple-youtube-api');
const config = require('../config.js')

const youtubeClient = new Youtube(config.YOUTUBE_API_KEY);
const DURATION_REPORT_THRESHOLD = 300; // 5 minutes

module.exports = (message) => {
    message.embeds.forEach(embed => {
        if (embed.provider && embed.provider.name === 'YouTube') {
            youtubeClient.getVideo(embed.url).then(video => {
                if (video.durationSeconds < DURATION_REPORT_THRESHOLD) {
                    return;
                }
                var resp = `🎬 Video Duration: `;
                if (video.duration.hours > 0) {
                    resp += `${video.duration.hours}h `
                }
                if (video.duration.minutes > 0) {
                    resp += `${video.duration.minutes}m `
                }
                if (video.duration.seconds > 0) {
                    resp += `${video.duration.seconds}s `
                }
                message.reply(resp);
            }).catch(console.error);
        }
    });
}