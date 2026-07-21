const express = require("express");
const router = express.Router();
const { Order, OrderItem, MenuItem, User, Shop, sequelize } = require("../models");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

// Helper to format SQL order objects to the nested structure expected by the React frontend
const formatOrder = (order) => {
  if (!order) return null;
  const plainOrder = order.toJSON ? order.toJSON() : order;
  
  // Ensure the primary ID is a string to match frontend type definitions
  plainOrder.id = String(plainOrder.id);
  
  if (plainOrder.items) {
    plainOrder.items = plainOrder.items.map((item) => ({
      id: String(item.id),
      menuItem: {
        id: String(item.menuItemId),
        name: item.name,
        price: item.price,
      },
      quantity: item.quantity,
    }));
  } else {
    plainOrder.items = [];
  }
  return plainOrder;
};

// Place an order (Student only)
router.post("/", verifyToken, authorizeRoles("student"), async (req, res) => {
  const { items, paymentMethod, shopId, pickupTimeSlot } = req.body;
  const studentId = req.user.id;

  try {
    // 1. Validate inputs
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in the order" });
    }
    if (!shopId) {
      return res.status(400).json({ message: "Shop ID is required" });
    }

    const transaction = await sequelize.transaction();

    try {
      // 2. Fetch student details to check/deduct wallet
      const student = await User.findByPk(studentId, { transaction });
      if (!student) {
        await transaction.rollback();
        return res.status(404).json({ message: "Student not found" });
      }

      // 3. Find the Shop
      const shop = await Shop.findOne({ where: { shopId }, transaction });
      if (!shop) {
        await transaction.rollback();
        return res.status(404).json({ message: "Shop not found" });
      }

      // 4. Validate stock availability and calculate total price
      let totalAmount = 0;
      const itemsToUpdate = [];
      const orderItemsData = [];

      for (const item of items) {
        const itemId = item.menuItem.id || item.menuItem._id;
        const dbItem = await MenuItem.findByPk(itemId, { transaction });
        if (!dbItem) {
          await transaction.rollback();
          return res.status(404).json({ message: `Menu item not found: ${item.menuItem.name}` });
        }

        if (!dbItem.available || dbItem.stockQuantity < item.quantity) {
          await transaction.rollback();
          return res.status(400).json({
            message: `Item "${dbItem.name}" is out of stock or has insufficient quantity. Available stock: ${dbItem.stockQuantity}`,
          });
        }

        totalAmount += dbItem.price * item.quantity;
        itemsToUpdate.push({ dbItem, quantity: item.quantity });
        orderItemsData.push({
          menuItemId: dbItem.id,
          name: dbItem.name,
          price: dbItem.price,
          quantity: item.quantity,
        });
      }

      // 5. Add nominal tax/fee (e.g. ₹5 fee and 5% GST)
      const paymentFee = 5;
      const paymentGst = Math.round(totalAmount * 0.05);
      const grandTotal = totalAmount + paymentFee + paymentGst;

      // 6. Handle Wallet Deduction if chosen
      if (paymentMethod === "wallet") {
        if ((student.walletBalance || 0) < grandTotal) {
          await transaction.rollback();
          return res.status(400).json({ message: "Insufficient wallet balance. Please top up." });
        }
        student.walletBalance -= grandTotal;
        await student.save({ transaction });
      }

      // 7. Atomic inventory decrement
      for (const { dbItem, quantity } of itemsToUpdate) {
        dbItem.stockQuantity -= quantity;
        if (dbItem.stockQuantity === 0) {
          dbItem.available = false;
        }
        await dbItem.save({ transaction });
      }

      // 8. Generate Order ID (e.g., ORD123456)
      const orderId = `ORD${Date.now().toString().slice(-6)}`;

      // 9. Save Order
      const newOrder = await Order.create({
        orderId,
        studentId: student.id,
        studentName: student.name,
        shopId: shop.shopId,
        shopName: shop.name,
        totalAmount: grandTotal,
        status: "pending",
        paymentMethod,
        paymentStatus: paymentMethod === "pay_later" ? "pending" : "paid",
        estimatedReadyTime: new Date(Date.now() + 15 * 60 * 1000), // Default 15 mins prep time
        pickupTimeSlot: pickupTimeSlot || "",
      }, { transaction });

      // 10. Save OrderItems in bulk
      const orderItemsWithOrderId = orderItemsData.map((oi) => ({
        ...oi,
        orderId: newOrder.id,
      }));
      await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction });

      await transaction.commit();

      const finalOrder = await Order.findByPk(newOrder.id, {
        include: [{ model: OrderItem, as: "items" }],
      });

      res.status(201).json({
        message: "Order placed successfully!",
        order: formatOrder(finalOrder),
        walletBalance: student.walletBalance,
      });
    } catch (innerErr) {
      await transaction.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error("Place Order Error:", err);
    res.status(500).json({ message: "Server error placing order" });
  }
});

// Fetch orders depending on Role
router.get("/", verifyToken, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "student") {
      filter = { studentId: req.user.id };
    } else if (req.user.role === "shop_owner") {
      filter = { shopId: req.user.shopId };
    }

    const orders = await Order.findAll({
      where: filter,
      include: [{ model: OrderItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders.map(formatOrder));
  } catch (err) {
    console.error("Fetch Orders Error:", err);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

// Update order status (Shopkeeper & Admin only)
router.put("/:id/status", verifyToken, authorizeRoles("shop_owner", "admin"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "accepted", "preparing", "ready", "collected", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  try {
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: "items" }],
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If shopkeeper, ensure the order belongs to their shop
    if (req.user.role === "shop_owner" && req.user.shopId !== order.shopId) {
      return res.status(403).json({ message: "Access Denied: Cannot update orders of other shops" });
    }

    order.status = status;
    if (status === "collected" || status === "cancelled") {
      order.paymentStatus = "paid"; // Mark paid upon collection
    }
    await order.save();

    res.json({ message: `Order status updated to ${status}`, order: formatOrder(order) });
  } catch (err) {
    console.error("Update Order Status Error:", err);
    res.status(500).json({ message: "Server error updating order status" });
  }
});

module.exports = router;
