const ErrorResponse = require("../utils/erroResponse");

// Error middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log error to console
  console.log(err);

  // Mogoose bad object Id
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // Duplicate Error
  if (err.code === 11000) {
    const message = "Duplicate record found";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Invalid token error
  if (err.name === "TokenExpiredError") {
    const message = "Token is invalid or has expired";
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

// Export
module.exports = errorHandler;
