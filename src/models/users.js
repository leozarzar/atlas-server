'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      users.hasMany(models.messages,{ foreignKey: 'sender_user', as: 'sent_messages'});
      users.hasMany(models.messages,{ foreignKey: 'recipient_user', as: 'received_messages'});
      users.hasMany(models.changes,{ foreignKey: 'user', as: 'user_changes'});
    }
  }
  users.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    photo_path: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};