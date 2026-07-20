const express = require("express");
const router = express.Router();
const { MenuItem, Shop } = require("../models");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

// Get all shops
router.get("/shops", async (req, res) => {
  try {
    const shops = await Shop.findAll();
    res.json(shops);
  } catch (err) {
    console.error("Fetch Shops Error:", err);
    res.status(500).json({ message: "Server error fetching shops" });
  }
});

// Get menu items (optionally filtered by shopId)
router.get("/items", async (req, res) => {
  const { shopId } = req.query;
  const options = shopId ? { where: { shopId } } : {};

  try {
    const items = await MenuItem.findAll(options);
    res.json(items);
  } catch (err) {
    console.error("Fetch Menu Items Error:", err);
    res.status(500).json({ message: "Server error fetching menu items" });
  }
});

// Add new menu item (Admin or Shop Owner)
router.post("/items", verifyToken, authorizeRoles("admin", "shop_owner"), async (req, res) => {
  const { name, description, price, image, category, preparationTime, shopId, stockQuantity } = req.body;

  // If role is shop_owner, ensure they can only add to their own shop
  if (req.user.role === "shop_owner" && req.user.shopId !== shopId) {
    return res.status(403).json({ message: "Access Denied: Cannot add items to another shop" });
  }

  try {
    const newItem = await MenuItem.create({
      name,
      description,
      price,
      image,
      category,
      preparationTime,
      shopId,
      stockQuantity: stockQuantity || 0,
      available: stockQuantity > 0,
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Create Menu Item Error:", err);
    res.status(500).json({ message: "Server error creating menu item" });
  }
});

// Update menu item (Admin or Shop Owner)
router.put("/items/:id", verifyToken, authorizeRoles("admin", "shop_owner"), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category, available, preparationTime, stockQuantity } = req.body;

  try {
    const item = await MenuItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // If role is shop_owner, ensure they can only update their own shop's items
    if (req.user.role === "shop_owner" && req.user.shopId !== item.shopId) {
      return res.status(403).json({ message: "Access Denied: Cannot update another shop's items" });
    }

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (image !== undefined) item.image = image;
    if (category !== undefined) item.category = category;
    if (preparationTime !== undefined) item.preparationTime = preparationTime;
    
    if (stockQuantity !== undefined) {
      item.stockQuantity = stockQuantity;
      // Auto-set availability based on stockQuantity
      item.available = stockQuantity > 0;
    } else if (available !== undefined) {
      item.available = available;
    }

    await item.save();
    res.json(item);
  } catch (err) {
    console.error("Update Menu Item Error:", err);
    res.status(500).json({ message: "Server error updating menu item" });
  }
});

// Delete menu item (Admin or Shop Owner)
router.delete("/items/:id", verifyToken, authorizeRoles("admin", "shop_owner"), async (req, res) => {
  const { id } = req.params;

  try {
    const item = await MenuItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // If role is shop_owner, ensure they can only delete their own shop's items
    if (req.user.role === "shop_owner" && req.user.shopId !== item.shopId) {
      return res.status(403).json({ message: "Access Denied: Cannot delete another shop's items" });
    }

    await item.destroy();
    res.json({ message: "Menu item deleted successfully" });
  } catch (err) {
    console.error("Delete Menu Item Error:", err);
    res.status(500).json({ message: "Server error deleting menu item" });
  }
});

module.exports = router;
