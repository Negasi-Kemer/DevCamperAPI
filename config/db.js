// Mongoose
const mongoose = require("mongoose");

// Connect to MongoDB
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline.bold);
};

// Export
module.exports = connectDB;
