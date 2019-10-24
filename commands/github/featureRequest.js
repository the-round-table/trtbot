const commando = require('discord.js-commando');
const config = require('../../config.js');
const utils = require('../../utils.js');
const octokit = require('@octokit/rest')();
const oneLine = require('common-tags').oneLine;
const {
  INVALID_COMMAND_FORMAT,
  generateIssueContext,
} = require('./githubUtils.js');

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
    let [title, ...body] = utils.argparse(feature);
    if (title === '') {
      msg.reply(INVALID_COMMAND_FORMAT);
      return;
    }
    if (!body || body.length === 0) {
      body = 'No detailed description specified.';
    } else if (body.length > 0) {
      body = body.join('-');
    }

    title = title.trim();
    body = body.trim();

    var [owner, repo] = config.GITHUB_REPO.split('/');
    const result = await octokit.issues.create({
      owner: owner,
      repo: repo,
      title: title,
      labels: ['Feature Request'],
      body: body + '\n\n' + generateIssueContext(msg),
    });
    if (result.status != 201) {
      msg.reply(oneLine`Sorry I was unable to put in your feature request.
        You can try again but, there might be something wrong with me.
        If you see continued failures, notify your server admin`);
    }
    msg.reply(oneLine`I succesfully added your request for **${title}** to the
      development backlog. A maintainer will triage the task and address it as
      soon as they can. Here is the created issue: ${result.data.html_url}`);
  }
};
