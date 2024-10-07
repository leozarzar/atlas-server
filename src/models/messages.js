'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class messages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      messages.belongsTo(models.users,{ foreignKey: 'sender_user', as: 'sender'});
      messages.belongsTo(models.users,{ foreignKey: 'recipient_user', as: 'receiver'});
      messages.belongsTo(models.purchase_orders,{ foreignKey: 'recipient_purchase_order', as: 'purchase_order'});
    }
  }
  messages.init({
    content: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'messages',
  });
  return messages;
};