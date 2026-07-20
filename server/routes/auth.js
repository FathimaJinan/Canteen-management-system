const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { verifyToken } = require("../middleware/auth");

// Register a student
router.post("/register", async (req, res) => {
  const { name, email, password, sinNumber } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password, // hooks handle hashing
      role: "student",
      sinNumber,
      walletBalance: 0,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "supersecretjwtkey123456!",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sinNumber: user.sinNumber,
        walletBalance: user.walletBalance,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, shopId: user.shopId },
      process.env.JWT_SECRET || "supersecretjwtkey123456!",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sinNumber: user.sinNumber,
        shopId: user.shopId,
        walletBalance: user.walletBalance,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Get current user profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// Top up wallet (Students only)
router.post("/wallet/topup", verifyToken, async (req, res) => {
  const { amount } = req.body;
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Only students can top up wallets" });
  }

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.walletBalance = (user.walletBalance || 0) + Number(amount);
    await user.save();

    res.json({
      walletBalance: user.walletBalance,
      message: `Successfully topped up ₹${amount}`,
    });
  } catch (err) {
    console.error("Wallet Topup Error:", err);
    res.status(500).json({ message: "Server error during topup" });
  }
});

module.exports = router;
