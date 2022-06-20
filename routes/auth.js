const express = require("express");

// Register
const { register } = require("../controllers/auth");

const router = express.Router();

// Register route
router.post("/register", register);

// Export
module.exports = router;
