require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

// Import all models
const User = require("../models/User");
const Order = require("../models/Order");
const Chat = require("../models/Chat");
const Rating = require("../models/Rating");
const RatingUser = require("../models/RatingUser");
const RatingStuker = require("../models/RatingStuker");
const OrderHistory = require("../models/OrderHistory");
const OrderHistoryUser = require("../models/OrderHistoryUser");
const OrderHistoryStuker = require("../models/OrderHistoryStuker");

async function clearAllData() {
  try {
    // Connect to database
    console.log("Connecting to database...");
    await connectDB();

    console.log("\n⚠️  WARNING: This will delete ALL data from all collections!");
    console.log("Starting data deletion...\n");

    // Delete all documents from each collection
    const collections = [
      { name: "User", model: User },
      { name: "Order", model: Order },
      { name: "Chat", model: Chat },
      { name: "Rating", model: Rating },
      { name: "RatingUser", model: RatingUser },
      { name: "RatingStuker", model: RatingStuker },
      { name: "OrderHistory", model: OrderHistory },
      { name: "OrderHistoryUser", model: OrderHistoryUser },
      { name: "OrderHistoryStuker", model: OrderHistoryStuker },
    ];

    let totalDeleted = 0;

    for (const collection of collections) {
      const result = await collection.model.deleteMany({});
      console.log(`✓ ${collection.name}: Deleted ${result.deletedCount} documents`);
      totalDeleted += result.deletedCount;
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Successfully deleted ${totalDeleted} total documents`);
    console.log("✅ All collections are now empty (tables preserved)");
    console.log("=".repeat(50) + "\n");

    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error clearing database:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
clearAllData();


