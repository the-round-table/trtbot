module.exports = (sequelize, DataTypes) => {
  return sequelize.define('reminder', {
    submitterId: DataTypes.STRING,
    channelId: DataTypes.STRING,
    originalMessageId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    messageText: DataTypes.STRING,
    dueDate: DataTypes.DATE,
  });
};
