class MemeManger {
  constructor(Memes) {
    this.Memes = Memes;
  }

  async addMeme({ name, link, creatorID, guildID }) {
    name = name.toLowerCase();
    await this.Memes.findOrCreate({
      where: { name, guildID },
      defaults: {
        name,
        link,
        creatorID,
        guildID,
      },
    });
  }

  async removeMeme(guildID, name) {
    name = name.toLowerCase();
    await this.Memes.destroy({ where: { name, guildID } });
  }

  async queryMeme(guildID, name) {
    name = name.toLowerCase();
    const meme = await this.Memes.findOne({ where: { name, guildID } });
    if (meme) {
      return meme.get({ plain: true });
    }
    return null;
  }

  async listMemes(guildID) {
    const memeInstances = await this.Memes.findAll({
      where: { guildID },
      order: ['name'],
    });
    return await memeInstances.map(meme => meme.get({ plain: true }));
  }
}

module.exports = MemeManger;
