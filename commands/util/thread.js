const commando = require('discord.js-commando');
const util = require('../../config.js');
const _ = require('lodash');

module.exports = class ThreadCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'thread',
      memberName: 'thread',
      group: 'util',
      description:
        'Finds an overflow room and creates a discussion there with the tagged members',
      examples: ['thread "some topic" @josh @ben'],
      guildOnly: true,
      argsPromptLimit: 0,
      args: [
        {
          key: 'topic',
          prompt: 'The topic of the thread',
          type: 'string'
        },
        {
          key: 'users',
          prompt: 'The users to include in the thread',
          type: 'user',
          infinite: true,
          default: msg => [msg.author]
        }
      ]
    });
  }

  getThreadChannelGroup(guild) {
    return guild.channels
      .filter(channel => channel.type == 'category')
      .find('name', util.THREAD_CHANNEL_GROUP);
  }

  getThreadChannel(guild) {
    const categoryChannel = this.getThreadChannelGroup(guild);
    if (categoryChannel) {
      return _.sample(categoryChannel.children.array());
    }
  }

  async run(msg, { topic, users }) {
    const threadChannel = this.getThreadChannel(msg.guild);
    threadChannel.setName(topic);

    if (threadChannel) {
      users.push(msg.author);
      threadChannel.send(
        `Here's a place to discuss "${topic}": ${users.join(', ')}\n👇 👇 👇`
      );
      msg.reply(`You got it! I setup a thread in ${threadChannel}`);
    } else {
      msg.reply('Unable to find a channel to put the thread in!');
    }
  }
};
