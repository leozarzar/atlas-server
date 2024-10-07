'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class changes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      changes.belongsTo(models.users,{ foreignKey: 'user', as: 'change_user'});
      changes.belongsTo(models.purchase_orders,{ foreignKey: 'purchase_order', as: 'changed_purchase_order'});
    }
  }
  changes.init({
    scope: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'changes',
  });
  return changes;
};