'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class purchase_orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      purchase_orders.belongsTo(models.items,{ foreignKey: 'item', as: 'order_item'});
      purchase_orders.hasMany(models.changes,{ foreignKey: 'purchase_order', as: 'order_changes'});
      purchase_orders.hasMany(models.messages,{ foreignKey: 'recipient_purchase_order', as: 'order_messages'});
    }
  }
  purchase_orders.init({
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'purchase_orders',
  });
  return purchase_orders;
};