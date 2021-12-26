'use strict';
const createError = require('http-errors')
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

  
  fund.addHook('afterFind', (fund)=>{
    try {
      
      let imageSrc = "http://localhost:5000/uploads/" + fund[0].thumbnail;
      fund[0].thumbnail = imageSrc;
    } catch (err) {
      throw createError.InternalServerError(err.message);
    }
  });

  return fund;
};