const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { User, Shop, Order, MenuItem } = require("../models");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

// Onboard a new shopkeeper (and optionally create their Shop)
router.post("/onboard-shopkeeper", verifyToken, authorizeRoles("admin"), async (req, res) => {
  const { name, email, password, shopId, shopName, shopDescription, shopImage } = req.body;

  try {
    // 1. Verify if user email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // 2. Check if the shop exists, if not, create it
    let shop = await Shop.findOne({ where: { shopId } });
    if (!shop) {
      shop = await Shop.create({
        shopId,
        name: shopName || `${name}'s Stall`,
        description: shopDescription || "Fresh canteen food cooked daily",
        image: shopImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
      });
    }

    // 3. Register the shopkeeper user
    const shopkeeper = await User.create({
      name,
      email,
      password, // Hook hashes this password
      role: "shop_owner",
      shopId,
    });

    res.status(201).json({
      message: "Shopkeeper onboarded successfully",
      shopkeeper: {
        id: shopkeeper.id,
        name: shopkeeper.name,
        email: shopkeeper.email,
        role: shopkeeper.role,
        shopId: shopkeeper.shopId,
      },
      shop,
    });
  } catch (err) {
    console.error("Onboard Shopkeeper Error:", err);
    res.status(500).json({ message: "Server error during shopkeeper onboarding" });
  }
});

// Get system-wide sales analytics (Admin Only)
router.get("/sales-analytics", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        status: {
          [Op.ne]: "cancelled",
        },
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Sales by Shop
    const shopSalesMap = {};
    const dailySalesMap = {};

    orders.forEach((order) => {
      // Breakdown by Shop
      if (!shopSalesMap[order.shopId]) {
        shopSalesMap[order.shopId] = {
          shopName: order.shopName,
          ordersCount: 0,
          revenue: 0,
        };
      }
      shopSalesMap[order.shopId].ordersCount += 1;
      shopSalesMap[order.shopId].revenue += order.totalAmount;

      // Breakdown by Day (YYYY-MM-DD)
      const dateStr = order.createdAt.toISOString().split("T")[0];
      if (!dailySalesMap[dateStr]) {
        dailySalesMap[dateStr] = {
          date: dateStr,
          orders: 0,
          revenue: 0,
        };
      }
      dailySalesMap[dateStr].orders += 1;
      dailySalesMap[dateStr].revenue += order.totalAmount;
    });

    const shopSales = Object.values(shopSalesMap);
    const dailySales = Object.values(dailySalesMap).sort((a, b) => a.date.localeCompare(b.date));

    // Summary numbers
    const totalUsers = await User.count();
    const studentCount = await User.count({ where: { role: "student" } });
    const shopkeeperCount = await User.count({ where: { role: "shop_owner" } });
    const totalShops = await Shop.count();
    const totalMenuItems = await MenuItem.count();

    res.json({
      summary: {
        totalOrders,
        totalRevenue,
        totalUsers,
        studentCount,
        shopkeeperCount,
        totalShops,
        totalMenuItems,
      },
      shopSales,
      dailySales,
    });
  } catch (err) {
    console.error("Sales Analytics Error:", err);
    res.status(500).json({ message: "Server error fetching sales analytics" });
  }
});

module.exports = router;
