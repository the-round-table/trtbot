const commando = require('discord.js-commando');
const config = require('../../config.js');
const octokit = require('@octokit/rest')();
const oneLine = require('common-tags').oneLine;

if (config.GITHUB_TOKEN) {
  octokit.authenticate({
    type: 'oauth',
    token: config.GITHUB_TOKEN,
  });
}

module.exports = class FeatureRequestCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'feature',
      memberName: 'feature_request',
      group: 'github',
      aliases: ['featurerequest', 'feature-request'],
      description:
        'Adds a Github Issue to the bot repo for a feature to be added to the bot',
      examples: [
        'feature Make a polling command - make a command that makes a poll',
        'feature Make a protip listener - make something that listens for protips',
      ],
      guildOnly: false,
      args: [
        {
          key: 'feature',
          prompt: oneLine`Name or short description of the feature and Futher information or
            detail on the feature request seperated by a **-**`,
          type: 'string',
        },
      ],
    });
  }

  async run(msg, { feature }) {
    var [title, body] = feature.split('-');
    if (!body || title === '' || body === '') {
      msg.reply(oneLine`Sorry I was unable to understand your feature request or you did not include a title or
        a detailed description of your feature which the developers need to address your request, 
        please make the request in the format \`[NAME or SHORT DESCRIPTION] - [DETAIL]\`
        e.g. **Reading List - Aggregate a list of all the links posted today**`);
      return;
    }
    var [owner, repo] = config.GITHUB_REPO.split('/');
    const result = await octokit.issues.create({
      owner: owner,
      repo: repo,
      title: title,
      labels: ['Feature Request'],
      body: body,
    });
    if (result.status != 201) {
      msg.reply(oneLine`Sorry I was unable to put in your feature request, you can try again
        but, there might be something wrong with me, if you see continued failures, notify your server admin`);
    }
    msg.reply(oneLine`I succesfully added your request for **${title}** to the development backlog,
      a maintainer will triage the task and address it as soon as they can`);
  }
};