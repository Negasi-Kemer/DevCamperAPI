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

  // Send token as response and along with a cookie
  sendTokenResponse(user, 200, res);
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

  // Send token as response and along with a cookie
  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create JWT
  const token = user.getSignedJwtToken();

  // Options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // If in production, set 'secure' field in cookie to true
  if (process.env.NODE_ENV === "production") options.secure = true;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// @desc Get current logged in user
// @route POST /api/v1/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    data: user,
  });
});
