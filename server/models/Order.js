const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  studentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shopId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shopName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "preparing", "ready", "collected", "cancelled"),
    defaultValue: "pending",
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM("pay_now", "pay_later", "wallet", "razorpay_upi", "razorpay_card", "razorpay_netbanking", "razorpay_googlepay"),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM("pending", "paid"),
    defaultValue: "pending",
    allowNull: false,
  },
  estimatedReadyTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  pickupTimeSlot: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Order;
