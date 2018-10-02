module.exports = (sequelize, DataTypes) => {
  return sequelize.define('message', {
    submitter: DataTypes.STRING,
    channel: DataTypes.STRING,
    guildId: DataTypes.STRING,
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  });
};
