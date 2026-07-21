const { User, Shop, MenuItem } = require("./models");

/**
 * Seed initial database records for Users, Shops, and Menu Items
 * if tables are currently empty.
 */
async function seedDatabase() {
  try {
    // 1. Seed Users
    const userCount = await User.count();
    if (userCount === 0) {
      console.log("No users found. Seeding default users...");
      const defaultUsers = [
        {
          name: "Super Admin",
          email: "admin@college.edu",
          password: "admin123",
          role: "admin",
        },
        {
          name: "Demo Student",
          email: "student@college.edu",
          password: "student123",
          role: "student",
          sinNumber: "SIN001",
          walletBalance: 500.0,
        },
        {
          name: "Fathima Jinan",
          email: "jinan28.8.2005@gmail.com",
          password: "123456",
          role: "student",
          sinNumber: "e23ai036",
          walletBalance: 1200.0,
        },
        {
          name: "Annapurna Owner",
          email: "annapurna@zappadu.com",
          password: "shop123",
          role: "shop_owner",
          shopId: "shop1",
        },
        {
          name: "Spice Junction Owner",
          email: "spicejunction@zappadu.com",
          password: "shop123",
          role: "shop_owner",
          shopId: "shop2",
        },
        {
          name: "Quick Bites Owner",
          email: "quickbites@zappadu.com",
          password: "shop123",
          role: "shop_owner",
          shopId: "shop3",
        },
      ];

      // individualHooks: true triggers the beforeSave hook to hash the passwords
      await User.bulkCreate(defaultUsers, { individualHooks: true });
      console.log("Default users seeded successfully.");
    }

    // 2. Seed Shops
    const shopCount = await Shop.count();
    if (shopCount === 0) {
      console.log("No shops found. Seeding default shops...");
      const defaultShops = [
        {
          shopId: "shop1",
          name: "Annapurna South Indian",
          description: "Freshly made hot idlis, crispy dosas, medu vadas, and hot tea/coffee.",
          image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop",
          isOpen: true,
        },
        {
          shopId: "shop2",
          name: "Spice Junction",
          description: "North Indian delicacies, aromatic veg biryanis, dal makhani, and warm chapatis.",
          image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
          isOpen: true,
        },
        {
          shopId: "shop3",
          name: "Quick Bites & Juice Bar",
          description: "Chinese noodles, crispy samosas, refreshing fruit juices, and cold coffee.",
          image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
          isOpen: true,
        },
      ];

      await Shop.bulkCreate(defaultShops);
      console.log("Default shops seeded successfully.");
    }

    // 3. Seed Menu Items
    const menuCount = await MenuItem.count();
    if (menuCount === 0) {
      console.log("No menu items found. Seeding default menu items...");
      const defaultMenuItems = [
        // Shop 1
        {
          name: "Masala Dosa",
          description: "Crispy rice crepe filled with spiced potato filling, served with sambar and chutney",
          price: 50.0,
          image: "https://images.unsplash.com/photo-1668236543090-82eb5eaf67e1?w=400&h=300&fit=crop",
          category: "South Indian",
          available: true,
          preparationTime: 10,
          shopId: "shop1",
          stockQuantity: 15,
        },
        {
          name: "Idli Sambar",
          description: "Soft steamed rice cakes served with lentil soup and coconut chutney",
          price: 35.0,
          image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop",
          category: "South Indian",
          available: true,
          preparationTime: 5,
          shopId: "shop1",
          stockQuantity: 20,
        },
        {
          name: "Medu Vada",
          description: "Crispy fried lentil donuts served with sambar and chutney",
          price: 30.0,
          image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop",
          category: "South Indian",
          available: true,
          preparationTime: 8,
          shopId: "shop1",
          stockQuantity: 12,
        },
        {
          name: "Pongal",
          description: "Creamy rice and lentil dish tempered with cumin and pepper",
          price: 40.0,
          image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop",
          category: "South Indian",
          available: true,
          preparationTime: 10,
          shopId: "shop1",
          stockQuantity: 10,
        },
        {
          name: "Masala Chai",
          description: "Aromatic Indian spiced tea with milk",
          price: 15.0,
          image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop",
          category: "Beverages",
          available: true,
          preparationTime: 3,
          shopId: "shop1",
          stockQuantity: 30,
        },
        // Shop 2
        {
          name: "Veg Biryani",
          description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices",
          price: 80.0,
          image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
          category: "Rice",
          available: true,
          preparationTime: 15,
          shopId: "shop2",
          stockQuantity: 8,
        },
        {
          name: "Paneer Butter Masala",
          description: "Cottage cheese cubes in rich tomato and butter gravy",
          price: 90.0,
          image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop",
          category: "North Indian",
          available: true,
          preparationTime: 12,
          shopId: "shop2",
          stockQuantity: 10,
        },
        {
          name: "Chole Bhature",
          description: "Spicy chickpea curry served with fluffy fried bread",
          price: 60.0,
          image: "https://images.unsplash.com/photo-1626132647523-66f6bf15f6f0?w=400&h=300&fit=crop",
          category: "North Indian",
          available: true,
          preparationTime: 10,
          shopId: "shop2",
          stockQuantity: 15,
        },
        {
          name: "Dal Makhani",
          description: "Slow-cooked black lentils in a creamy buttery gravy",
          price: 70.0,
          image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
          category: "North Indian",
          available: true,
          preparationTime: 12,
          shopId: "shop2",
          stockQuantity: 12,
        },
        {
          name: "Chapati (2 pcs)",
          description: "Soft whole wheat flatbread",
          price: 20.0,
          image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
          category: "Breads",
          available: true,
          preparationTime: 5,
          shopId: "shop2",
          stockQuantity: 40,
        },
        // Shop 3
        {
          name: "Veg Fried Rice",
          description: "Stir-fried rice with fresh vegetables and soy sauce",
          price: 55.0,
          image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
          category: "Chinese",
          available: true,
          preparationTime: 8,
          shopId: "shop3",
          stockQuantity: 15,
        },
        {
          name: "Veg Noodles",
          description: "Hakka noodles tossed with vegetables and Indo-Chinese spices",
          price: 55.0,
          image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
          category: "Chinese",
          available: true,
          preparationTime: 8,
          shopId: "shop3",
          stockQuantity: 15,
        },
        {
          name: "Samosa (2 pcs)",
          description: "Crispy fried pastry with spiced potato filling",
          price: 20.0,
          image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
          category: "Snacks",
          available: true,
          preparationTime: 5,
          shopId: "shop3",
          stockQuantity: 25,
        },
        {
          name: "Vada Pav",
          description: "Mumbai's favorite street food - spiced potato fritter in a bun",
          price: 25.0,
          image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop",
          category: "Snacks",
          available: true,
          preparationTime: 5,
          shopId: "shop3",
          stockQuantity: 20,
        },
        {
          name: "Cold Coffee",
          description: "Chilled coffee blended with ice cream and milk",
          price: 40.0,
          image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
          category: "Beverages",
          available: true,
          preparationTime: 5,
          shopId: "shop3",
          stockQuantity: 20,
        },
        {
          name: "Fresh Lime Soda",
          description: "Refreshing lemon soda - sweet or salted",
          price: 25.0,
          image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=300&fit=crop",
          category: "Beverages",
          available: true,
          preparationTime: 2,
          shopId: "shop3",
          stockQuantity: 25,
        },
      ];

      await MenuItem.bulkCreate(defaultMenuItems);
      console.log("Default menu items seeded successfully.");
    }
  } catch (err) {
    console.error("Database seeding failed:", err);
  }
}

// Allow running directly via `node seed.js`
if (require.main === module) {
  const { sequelize } = require("./models");
  sequelize.authenticate().then(async () => {
    await seedDatabase();
    process.exit(0);
  });
}

module.exports = seedDatabase;
