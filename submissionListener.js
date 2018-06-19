const config = require('./config.js')
const utils = require('./utils');

module.exports = (dbRef) => (message) => {
    const link = utils.getPostedUrl(message);

    if (!link) {
        console.log("Not recording embed: no link");
        return;
    }

    dbRef.runTransaction(transaction => {
        const submissions = dbRef.collection('submissions');
        const docRef = submissions.doc(message.author.id);
        const linkKey = link.replace(/\//g, "-");
        const submissionRef = docRef.collection('links').doc(linkKey);

        return transaction.get(submissionRef).then(submissionSnap => {
            // Duplicate submission
            if (submissionSnap.exists) {
                console.log('Duplicate submission!');
                return;
            }

            return transaction.get(docRef).then(docSnap => {
                const payload = { name: message.author.username };

                if (!docSnap.exists) {
                    payload.submissions = 1;
                } else {
                    payload.submissions = docSnap.data().submissions + 1;
                }

                transaction.set(submissionRef, { submitted: true });
                transaction.set(docRef, payload);
            });
        });
    }).then(() => console.log(`Submission registered: (${message.author.username}) ${link}`))
        .catch(console.error);
}