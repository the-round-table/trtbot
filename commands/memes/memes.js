const discord = require('discord.js');
const commando = require('discord.js-commando');
const isImageUrl = require('is-image-url');
const URL = require('url').URL;
const MemeManager = require('../../actions/memes.js');

const MEME_ADD_USAGE = 'Correct usage: `trt meme add [MEME_NAME] [MEME_URL]`';
const MEME_REMOVE_USAGE = 'Correct usage: `trt meme remove [MEME_NAME]`';

function isWhitelisted(url) {
  const host = new URL(url).host;
  return (
    host.endsWith('giphy.com') ||
    host.endsWith('gph.is') ||
    host.endsWith('tenor.com')
  );
}

function hasGifEmbed(msg) {
  return msg.embeds.some(embed => embed.type.indexOf('gif') !== -1);
}

module.exports = class MemesCommand extends commando.Command {
  constructor(client, memeManager) {
    super(client, {
      name: 'memes',
      memberName: 'memes',
      group: 'memes',
      aliases: ['meme'],
      description: 'Save memes for later posting',
      guildOnly: true,
      argsType: 'multiple',
    });

    this.memeManager = new MemeManager(client.Memes);
  }

  async run(msg, args) {
    if (args.length === 0) {
      await msg.reply(
        "Need a subcommand. Options are 'add', 'list', 'remove', or a meme name"
      );
    }

    const firstArgument = args[0];
    switch (firstArgument) {
      case 'add': {
        return await this.addMeme(msg, args.slice(1));
      }
      case 'remove': {
        return await this.removeMeme(msg, args.slice(1));
      }
      case 'list': {
        return await this.listMemes(msg);
      }
      default: {
        return await this.searchMeme(msg, args);
      }
    }
  }

  async addMeme(msg, args) {
    if (args.length !== 2) {
      return msg.reply('Incorrect usage. ' + MEME_ADD_USAGE);
    }
    const [memeName, memeLink] = args;

    if (
      !isImageUrl(memeLink, true) &&
      !hasGifEmbed(msg) &&
      !isWhitelisted(memeLink)
    ) {
      return await msg.reply(
        'Invalid link provided for meme! ' + MEME_ADD_USAGE
      );
    }

    await this.memeManager.addMeme({
      creatorID: msg.author.id,
      guildID: msg.guild.id,
      name: memeName,
      link: memeLink,
    });
    await msg.reply('Alright. Meme saved! 🕺');
  }

  async removeMeme(msg, args) {
    if (args.length !== 1) {
      return await msg.reply(MEME_REMOVE_USAGE);
    }
    const memeName = args[0];
    await this.memeManager.removeMeme(memeName);
    return await msg.reply('Alright. Meme removed. 🔥🗑🔥');
  }

  async searchMeme(msg, args) {
    if (args.length === 0) {
      return;
    }
    const query = args[0];
    const meme = await this.memeManager.queryMeme(msg.guild.id, query);
    if (meme == null) {
      return msg.reply(`Couldn't find meme with name "${query}". 😞`);
    }
    return await msg.channel.send(meme.link);
  }

  async listMemes(msg) {
    const memes = await this.memeManager.listMemes(msg.guild.id);
    const embed = new discord.RichEmbed()
      .setTitle('🖼 Registered Memes')
      .setDescription(memes.map(meme => meme.name).join(', '));
    return await msg.reply(embed);
  }
};
