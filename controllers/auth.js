// Bootcamp model
const User = require("../models/User");

// Error response
const ErrorResponse = require("../utils/erroResponse");

// Async handle
const asyncHandler = require("../middleware/async");

// @desc Register user
// @route GET /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
  // Get body content
  const { name, email, password, role } = req.body;
  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token: token });
});
