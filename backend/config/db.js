const mongoose = require("mongoose");

async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      console.log("MongoDB URI not configured.");
      console.log("Running in Demo Mode.");
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    console.log("Continuing in Demo Mode.");
  }
}

module.exports = connectDB;