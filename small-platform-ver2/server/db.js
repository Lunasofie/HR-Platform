require("dotenv").config(); // 👈 Add this as the FIRST line

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // These options are recommended for MongoDB Atlas
      retryWrites: true,
      w: "majority",
    });

    console.log("✅ MongoDB Atlas connected successfully");
    console.log(`📍 Connected to: ${mongoose.connection.host}`);
    console.log(`🗄️  Database: ${mongoose.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });
  } catch (err) {
    console.error("❌ MongoDB Atlas connection failed:", err.message);
    console.error("💡 Make sure you:");
    console.error("   1. Replaced <db_password> with your actual password");
    console.error("   2. Whitelisted your IP address in MongoDB Atlas");
    console.error("   3. Created a database user with proper permissions");
    process.exit(1);
  }
};

// Seed admin + employee if collection is empty
async function init() {
  try {
    const count = await User.countDocuments();
    console.log(`📊 Current user count: ${count}`);

    if (count === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash("adminpass", salt);
      const empPass = await bcrypt.hash("employeepass", salt);

      await User.insertMany([
        {
          name: "Admin User",
          email: "admin@example.com",
          password: adminPass,
          role: "admin",
          last_login: null,
        },
        {
          name: "Employee User",
          email: "employee@example.com",
          password: empPass,
          role: "employee",
          last_login: null,
        },
      ]);

      console.log("🌱 Seeded admin and employee accounts into MongoDB Atlas");
      console.log("👤 Admin: admin@example.com / adminpass");
      console.log("👤 Employee: employee@example.com / employeepass");
    } else {
      console.log("✅ Database already has users, skipping seed");
    }
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  }
}

// Helpers
async function getUserByEmail(email) {
  return await User.findOne({ email });
}

async function getUserById(id) {
  return await User.findById(id);
}

async function getAllUsers() {
  return await User.find({});
}

async function updateUser(user) {
  return await User.findByIdAndUpdate(user._id, user, { new: true });
}

// Graceful shutdown
async function closeDB() {
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed gracefully");
  } catch (err) {
    console.error("❌ Error closing MongoDB connection:", err);
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  await closeDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  init,
  getUserByEmail,
  getUserById,
  getAllUsers,
  updateUser,
  closeDB,
};
