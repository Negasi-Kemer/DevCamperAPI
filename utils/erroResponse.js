class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Export
module.exports = ErrorResponse;

// const ErrorResponse = function (message, statusCode) {
//   let ErrorObj = new Error(message);
//   this.message = message;
//   this.statusCode = statusCode;
// };

// module.exports = ErrorResponse;
