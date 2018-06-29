const utils = require('../utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


module.exports = (sequelize) => async (message) => {
    const Submission = sequelize.import(__dirname + '/submission.js');

    const link = utils.getPostedUrl(message);

    if (!link || !message.guild) {
        return;
    }

    return sequelize.transaction(t => {
        const username = message.author.username;
        const channel = message.channel.name;
        const guildId = message.guild.id;

        Submission.count({
            where: {
                link: link,
                guildId: guildId,
                // Created in last day
                createdAt: {
                    [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
                }
            }
        }).then(existing => {
            // Don't create duplicate submissions
            if(existing) {
                console.log('Duplicate submission!');
                return;
            }

            Submission.create({
                link: link,
                submitter: username,
                guildId: guildId,
                channel: channel
            }).then(() => {
                console.log(`Submission registered: (${username}) ${link}`)
            });
        });
    });
}