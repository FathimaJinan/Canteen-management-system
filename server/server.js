const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize } = require("./models");
const seedDatabase = require("./seed");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Canteen Food Ordering Management System API" });
});

// Database Connection, Sync, Seeding & Server Start
sequelize
  .authenticate()
  .then(async () => {
    console.log("Connected to MySQL database using Sequelize");
    
    // Sync tables (alter tables if schema changes)
    await sequelize.sync({ alter: true });
    console.log("MySQL database synchronized successfully");

    // Seed default records
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection/synchronization error:", err);
  });
