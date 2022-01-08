'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      chat.belongsTo(models.user, {
        as: "sender",
        foreignKey: {
          name: "idSender",
        },
      });

      chat.belongsTo(models.user, {
        as:"recepient",
        foreignKey: {
          name: "idRecepient"
        }
      })
    }
  };
  chat.init({
    idSender: DataTypes.INTEGER,
    idRecepient: DataTypes.INTEGER,
    message: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'chat',
  });
  return chat;
};