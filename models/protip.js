module.exports = (sequelize, DataTypes) => {
  return sequelize.define('protip', {
    submitter: DataTypes.STRING,
    submitterId: DataTypes.STRING,
    messageText: DataTypes.STRING,
    channelId: DataTypes.STRING,
    guildId: DataTypes.STRING,
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });
};
