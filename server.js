// Express
const express = require("express");

// Dotenv
const dotenv = require("dotenv");

// Error handler middleware
const errorHandler = require("./middleware/error");

// Colors
const colors = require("colors");

// DB connection
const connectDB = require("./config/db");

// File upload
const fileupload = require("express-fileupload");

// Cookie parser
const cookieParser = require("cookie-parser");

// Mongo santize
const mongoSanitize = require("express-mongo-sanitize");

// Helmet
const helmet = require("helmet");

// XSS-Clean
const xss = require("xss-clean");

// Rate limit
const rateLimit = require("express-rate-limit");

// HTTP Parameter Polution
const hpp = require("hpp");

// CORS
const cors = require("cors");

// Path
const path = require("path");

// Load config variables
dotenv.config({ path: "./config/config.env" });

// Connect to MongoDB
connectDB();
// App
const app = express();

// Body parse
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Routes
const bootcamp = require("./routes/bootcamps");
const course = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/user");
const reviews = require("./routes/review");

// Morgan
const morgan = require("morgan");

// Log url for development environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Use fileupload
app.use(fileupload());

// Mongo santize
app.use(mongoSanitize());

// Set security header
app.use(helmet());

// Prevent XSS attack
app.use(xss());

// Rate limiter - DOS attack protector
const limiter = rateLimit({
  windowMs: 10 * 60 * 10000, // 10 minutes
  max: 100,
});
app.use(limiter);

// Http parameter polution (hpp)
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount bootcamp router to a specific url(path)
app.use("/api/v1/bootcamps", bootcamp);
app.use("/api/v1/courses", course);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

// Use the error handler middleware
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

// Listen
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error happened: ${err}`.red.bold);
  // Close server and exit app
  server.close(() => process.exit(1));
});
