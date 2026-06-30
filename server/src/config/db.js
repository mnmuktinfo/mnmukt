const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    const conn = await mongoose.connect(mongoURI);

    logger("INFO", "✅ MongoDB Connected Successfully");

    console.log("======================================");
    console.log("🍃 MongoDB Connected");
    console.log(`📂 Database : ${conn.connection.name}`);
    console.log(`🌐 Host     : ${conn.connection.host}`);
    console.log(`🚪 Port     : ${conn.connection.port}`);
    console.log(`📦 ReadyState : ${conn.connection.readyState}`);
    console.log("======================================");

    mongoose.connection.on("connected", () => {
      logger("INFO", "MongoDB connection established");
    });

    mongoose.connection.on("disconnected", () => {
      logger("WARN", "MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      logger("ERROR", err.message);
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger("INFO", "MongoDB connection closed");
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger("ERROR", `MongoDB Connection Failed: ${error.message}`);

    console.error("======================================");
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);
    console.error("======================================");

    process.exit(1);
  }
};

module.exports = connectDB;