const commando = require('discord.js-commando');
const config = require('../../config.js');
const octokit = require('@octokit/rest')();
octokit.authenticate({
  type: 'oauth',
  token: config.GITHUB_TOKEN,
})

module.exports = class BugReportCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: "bug",
      memberName: "bug_report",
      group: "util",
      description: "Adds a Github Issue to the bot repo for a bug to be investigated",
      examples: ['Reading list misses links - Links in overflow channels are not tracked in the reading list', 
                 'Polling runs ouf of options - We need support for more than 10 options in polls'],
      guildOnly: false,
      args: [
        {
          key: "bug",
          prompt: "Name or short description of the bug and Futher information or \
detail on the bug seperated by a **-**",
          type: "string",
        }
      ]
    });
  }

  async run(msg, {bug}) {
    var [title, body] = bug.split('-');
    if (!body || title === '' || body === '') {
      msg.reply(`Sorry I was unable to understand your bug or you did not include a title or \
a detailed description of your issue which the developers need to address your request, \
please make the request in the format \`[NAME or SHORT DESCRIPTION] - [DETAIL]\`
    e.g. **Reading list misses links - Links in overflow channels are not tracked in the reading list**`);
      return; 
    }
    var [owner, repo] = config.GITHUB_REPO.split('/');
    const result = await octokit.issues.create({
      owner: owner, 
      repo: repo, 
      title: title,
      labels: ["Bug - Unverifed"], 
      body: body,
    });
    if (result.status != 201) { 
      msg.reply(`Sorry I was unable to put in your bug report, you can try again \
but, there might be something wrong with me, if you see continued failures, notify your server admin`);
    }
    msg.reply(`I succesfully added your bug report for **${title}**, \
a maintainer will triage the bug and address it as soon as they can`);
  }
};