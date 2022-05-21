// Express
const express = require("express");

// Dotenv
const dotenv = require("dotenv");

// Load config variables
dotenv.config({ path: "./config/config.env" });

// App
const app = express();

// Routes
const bootcamp = require("./routes/bootcamps");

// Morgan
const morgan = require("morgan");

// Log url for development environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount bootcamp router to a specific url(path)
app.use("/api/v1/bootcamps", bootcamp);

// Port
const PORT = process.env.PORT || 3000;

// Listen
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
