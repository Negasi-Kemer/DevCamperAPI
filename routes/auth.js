const express = require("express");

// Register
const { register, login } = require("../controllers/auth");

const router = express.Router();

// Register route
router.post("/register", register);

router.post("/login", login);

// Export
module.exports = router;
