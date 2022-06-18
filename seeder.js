// File system
const fs = require("fs");

// Mongoose
const mongoose = require("mongoose");

// Colors - to colorize console text
const colors = require("colors");

// Dotenv
const dotenv = require("dotenv");

// Load environmental variables
dotenv.config({ path: "./config/config.env" });

// Bootcamp model
const Bootcamp = require("./models/Bootcamp");

// Course model
const Course = require("./models/Course");

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Read Bootcamp.json file
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/Bootcamp.json`, "utf-8")
);

// Read Course.json file
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

// Import data in 'bootcamps' to DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);

    console.log("Data Imported...".green.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

// Delete all data in DB
const deletData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    console.log("Data Destroyed...".red.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deletData();
}
