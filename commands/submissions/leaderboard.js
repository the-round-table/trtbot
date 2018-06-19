const commando = require('discord.js-commando');

module.exports = class ListTopicsCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'leaderboard',
            memberName: 'leaderboard',
            group: 'submissions',
            description: 'List top submitters',
            examples: ['leaderboard'],
            guildOnly: false,
        });

        this.dbRef = client.dbRef;
    }

    async run(msg, args) {
        return this.dbRef.collection('submissions').orderBy('submissions', 'desc').get().then(snap => {
            var response = 'Top Submitters:\n'; 
            snap.forEach(doc => {
                response += `\t${doc.data().name}: ${doc.data().submissions}\n`
            });
            msg.reply(response);
        });
    }
};