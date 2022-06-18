// Express
const express = require("express");

// Dotenv
const dotenv = require("dotenv");

// Error handler middleware
const errorHandler = require("./middleware/error");

// Colors
const colors = require("colors");

// DB connection
const connectDB = require("./config/db");

// File upload
const fileupload = require("express-fileupload");

// Path
const path = require("path");

// Load config variables
dotenv.config({ path: "./config/config.env" });

// Connect to MongoDB
connectDB();
// App
const app = express();

// Body parse
app.use(express.json());

// Routes
const bootcamp = require("./routes/bootcamps");
const course = require("./routes/courses");

// Morgan
const morgan = require("morgan");

// Log url for development environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Use fileupload
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount bootcamp router to a specific url(path)
app.use("/api/v1/bootcamps", bootcamp);
app.use("/api/v1/courses", course);

// Use the error handler middleware
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

// Listen
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error happened: ${err}`.red.bold);
  // Close server and exit app
  server.close(() => process.exit(1));
});
