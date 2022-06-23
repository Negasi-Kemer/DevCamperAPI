const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/erroResponse");
const User = require("../models/User");

// Protect
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Set token from Bearer token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  //   // Set token from cookie
  //  else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  if (!token) {
    return next(new ErrorResponse("Not authorized to access the route ", 401));
  }

  try {
    // Decode JWT
    const decodedData = await jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id from the decoded data and set it to 'req.user'
    req.user = await User.findById(decodedData.id);

    next();
  } catch (error) {
    next(error);
  }
});

// Authorize
exports.authorize = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not auhtorized for this route`,
          403
        )
      );
    }
    next();
  };
};
