'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class items extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      items.hasMany(models.photo_paths,{ foreignKey: 'item', as: 'photo_paths'});
      items.hasMany(models.purchase_orders,{ foreignKey: 'item', as: 'purchase_orders'});
    }
  }
  items.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'items',
  });
  return items;
};