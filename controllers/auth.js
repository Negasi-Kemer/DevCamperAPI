// Bootcamp model
const User = require("../models/User");

// Error response
const ErrorResponse = require("../utils/erroResponse");

// Bcryptjs
const bcrypt = require("bcryptjs");

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

// @desc Login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  // Get body content
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new ErrorResponse("Email and passwor are required", 400));
  }
  console.log("Password: ", password);

  // Find user by email and then set 'password' column selectable
  const user = await User.findOne({ email }).select("+password");

  // Check if user exists
  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  if (!(await user.matchPassword(password))) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Create JWT
  const token = user.getSignedJwtToken();

  res
    .status(200)
    .json({ success: true, message: "Login Successfull", token: token });
});
