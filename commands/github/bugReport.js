const commando = require('discord.js-commando');
const config = require('../../config.js');
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

module.exports = class BugReportCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'bug',
      memberName: 'bug_report',
      group: 'github',
      aliases: ['bugreport', 'fileanissue', 'bug-report'],
      description:
        'Adds a Github Issue to the bot repo for a bug to be investigated',
      examples: [
        'bug Reading list misses links - Links in overflow channels are not tracked in the reading list',
        'bug Polling runs out of options - We need support for more than 10 options in polls',
      ],
      guildOnly: false,
      args: [
        {
          key: 'bug',
          prompt: oneLine`Name or short description of the bug and Futher information or 
            detail on the bug seperated by a **-**`,
          type: 'string',
        },
      ],
    });
  }

  async run(msg, { bug }) {
    let [title, body] = bug.split('-');
    if (!body || title === '' || body === '') {
      msg.reply(INVALID_COMMAND_FORMAT);
      return;
    }

    title = title.trim();
    body = body.trim();

    var [owner, repo] = config.GITHUB_REPO.split('/');
    const result = await octokit.issues.create({
      owner: owner,
      repo: repo,
      title: title,
      labels: ['Bug - Unverifed'],
      body: body + '\n' + generateIssueContext(msg),
    });
    if (result.status != 201) {
      msg.reply(oneLine`Sorry I was unable to put in your bug report, you can try again 
        but, there might be something wrong with me, if you see continued failures, notify your server admin`);
    }
    msg.reply(oneLine`I succesfully added your bug report for **${title}**, 
      a maintainer will triage the bug and address it as soon as they can.
      Here is the created issue: ${result.data.html_url}`);
  }
};
