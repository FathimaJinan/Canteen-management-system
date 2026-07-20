const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MenuItem = sequelize.define("MenuItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  preparationTime: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    allowNull: false,
  },
  shopId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

module.exports = MenuItem;
