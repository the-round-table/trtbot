module.exports = (sequelize, DataTypes) => {
  return sequelize.define('submission', {
    submitter: DataTypes.STRING,
    link: DataTypes.STRING,
    channel: DataTypes.STRING,
    guildId: DataTypes.STRING,
    title: DataTypes.STRING,
    shortLink: DataTypes.STRING,
    messageUrl: DataTypes.STRING,
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  });
};
