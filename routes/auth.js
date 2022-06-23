const express = require("express");

// Register
const {
  register,
  login,
  getMe,
  forgotPassword,
  updateDetail,
  updatepassword,
  resetpassword,
  logout,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Register route
router.post("/register", register);

router.post("/login", login);

router.get("/logout", logout);

router.get("/me", protect, getMe);

router.post("/forgotpassword", forgotPassword);

router.put("/updatedetail", protect, updateDetail);

router.put("/updatepassword", protect, updatepassword);

router.put("/resetpassword/:resettoken", resetpassword);

// Export
module.exports = router;
