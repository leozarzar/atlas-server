'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class photo_paths extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      photo_paths.belongsTo(models.items,{ foreignKey: 'item', as: 'photo_item'});
    }
  }
  photo_paths.init({
    path: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'photo_paths',
  });
  return photo_paths;
};