const moment = require('moment');
const octokit = require('@octokit/rest')();
const stripIndents = require('common-tags').stripIndents;
const BaseMessageListener = require('./baseMessageListener.js');
const oneLine = require('common-tags').oneLine;

const GITHUB_REGEX = /(https?:\/\/)?github\.com\/(.*)\/(.*)/;

class GithubListener extends BaseMessageListener {
  constructor() {
    super({
      name: 'github',
      description: oneLine`Responds to Github links with repository info (stars
        language, and last updated time)`,
      linkRegex: GITHUB_REGEX,
    });
  }

  async onMessage(message, { link }) {
    const match = link.match(GITHUB_REGEX);
    const owner = match[2];
    const repo = match[3];

    try {
      const repo_data = await octokit.repos.get({ owner, repo });
      message.reply(
        stripIndents`\n${owner}/${repo}:
      ⭐ Stars: ${repo_data.data.stargazers_count.toLocaleString()}
      🗣 Language: ${repo_data.data.language || 'Unknown'}
      ⏰ Last Updated: ${moment(repo_data.data.updated_at).fromNow()}
      📄 Description: ${repo_data.data.description}`
      );
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = GithubListener;
