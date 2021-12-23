'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class fund extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      fund.belongsTo(models.user, {
        as:"user",
        foreignKey: {
          name: "userId"
        }
      });

      fund.hasMany(models.transaction, {
        as: "userDonate",
        foreignKey: {
          name: "fundId"
        }
      })
    }
  };
  fund.init({
    title: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    goal: DataTypes.INTEGER,
    description: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'fund',
  });
  return fund;
};