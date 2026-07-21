const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("student", "shop_owner", "admin"),
      defaultValue: "student",
      allowNull: false,
    },
    sinNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shopId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    walletBalance: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      allowNull: true,
    },
  },
  {
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Compare password method
User.prototype.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
