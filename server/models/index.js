const sequelize = require("../config/database");
const User = require("./User");
const Shop = require("./Shop");
const MenuItem = require("./MenuItem");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

// Associations
User.hasMany(Order, { foreignKey: "studentId", as: "orders" });
Order.belongsTo(User, { foreignKey: "studentId", as: "student" });

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

MenuItem.hasMany(OrderItem, { foreignKey: "menuItemId" });
OrderItem.belongsTo(MenuItem, { foreignKey: "menuItemId", as: "menuItem" });

module.exports = {
  sequelize,
  User,
  Shop,
  MenuItem,
  Order,
  OrderItem,
};
