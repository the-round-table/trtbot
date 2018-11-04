module.exports = (sequelize, DataTypes) => {
  return sequelize.define('meme', {
    creatorID: DataTypes.STRING,
    guildID: DataTypes.STRING,
    link: DataTypes.STRING,
    name: DataTypes.STRING,
  });
};
