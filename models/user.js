'use strict';
const bcrypt = require('bcrypt');
const createError = require('http-errors')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.hasMany(models.fund, {
        as: "funds",
        foreignKey: {
          name: "userId"
        }
      });

      user.hasMany(models.transaction, {
        as: "transactions",
        foreignKey: {
          name: "userId"
        }
      });

      user.hasOne(models.profile, {
        as:"profile",
        foreignKey: {
          name: "userId"
        }
      });

      user.hasMany(models.chat, {
        as: "senderMessage",
        foreignKey: {
          name: "idSender",
        }
      });

      user.hasMany(models.chat, {
        as: "recepientMessage",
        foreignKey: {
          name: "idRecepient",
        }
      })
    }
  };
  user.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
  });

  user.addHook('beforeCreate', async(user,next)=>{
    try {
      
      const hashPassword = await bcrypt.hash(user.password, 10);
      user.password = hashPassword;

    } catch (err) {
      throw createError.InternalServerError()
    }
  })

  return user;
};