// Bootcamp model
const User = require("../models/User");

// Error response
const ErrorResponse = require("../utils/erroResponse");

// Bcryptjs
const bcrypt = require("bcryptjs");

// Crypto
const crypto = require("crypto");

// Async handle
const asyncHandler = require("../middleware/async");

// Send email
const sendEmail = require("../utils/sendEmail");

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

// @desc  Forgot password
// @route POST /api/v1/auth/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // Find user by email
  const user = await User.findOne({ email: req.body.email });

  // Check if user exists
  if (!user) {
    return next(
      new ErrorResponse("No account found by the email you specified", 400)
    );
  }

  // Create password reset token
  const resetToken = await user.getPasswordResetToken();
  console.log(resetToken);
  // Save user
  await user.save({ validateBeforeSave: false });

  // Reset password url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword${resetToken}`;

  // Message to be sent on email.
  const message = `You're receiving because you requested a reset of password. Please make click on the link below: \n\n ${resetUrl}`;

  // Send email
  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    // Response
    res.status(200).json({
      success: true,
      message: "Email sent",
    });
  } catch (error) {
    console.error(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc Reset password using the token send via email
// @route PUT /api/v1/auth/resetpassword/:resettoken
// @access Public
exports.resetpassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  // Check user
  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordExpires = undefined;
  user.resetPasswordToken = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc Get current logged in user
// @route GET /api/v1/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Update logged in user detail
// @route PUT /api/v1/auth/updatedetail
// @access Private
exports.updateDetail = asyncHandler(async (req, res, next) => {
  const filedsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user._id, filedsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Update password
// @route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatepassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  // Check if oldPassword matches with the one in DB
  if (!user.matchPassword(req.body.currentPassword)) {
    return next(new ErrorResponse("Old is password is incorrect", 400));
  }

  // Update password
  user.password = req.body.newPassword;
  await user.save();

  // Return token
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
