const moment = require('moment');
const octokit = require('@octokit/rest')();
const stripIndents = require('common-tags').stripIndents;
const utils = require('../utils.js');

const GITHUB_REGEX = '(https?://)?github.com/(.*)/(.*)';

module.exports = async message => {
  const link = utils.getPostedUrl(message);
  if (!link || !link.match(GITHUB_REGEX)) {
    return;
  }

  const match = link.match(GITHUB_REGEX);
  const owner = match[2];
  const repo = match[3];

  try {
    const repo_data = await octokit.repos.get({ owner, repo });
    message.reply(
      stripIndents`\n${owner}/${repo}:
      ⭐ Stars: ${repo_data.data.stargazers_count.toLocaleString()}
      🗣 Language: ${repo_data.data.language || "Unknown"}
      ⏰ Last Updated: ${moment(repo_data.data.updated_at).fromNow()}`
    );
  } catch (e) {
    console.error(e);
  }
};
