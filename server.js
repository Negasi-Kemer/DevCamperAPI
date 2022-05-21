// Express
const express = require("express");

// Dotenv
const dotenv = require("dotenv");

// Load config variables
dotenv.config({ path: "./config/config.env" });

// App
const app = express();

// Port
const PORT = process.env.PORT || 3000;

// Listen
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
