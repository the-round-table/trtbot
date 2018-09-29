module.exports = (sequelize, DataTypes) => {
  return sequelize.define('reminder', {
    submitter: DataTypes.STRING,
    channelId: DataTypes.STRING,
    guildId: DataTypes.STRING,
    originalMessageId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    messageText: DataTypes.STRING,
    dueDate: DataTypes.DATE,
  });
};
