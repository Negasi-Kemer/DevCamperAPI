const express = require("express");

// Methods in courses controller
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");

// Course model
const Course = require("../models/Course");

// Advanced results
const advancedResult = require("../middleware/advancedResult");

// Router
const router = express.Router({ mergeParams: true });

// Protect
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(
    advancedResult(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(protect, authorize("publisher", "admin"), createCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize("publisher", "admin"), updateCourse)
  .delete(protect, authorize("publisher", "admin"), deleteCourse);

// Export
module.exports = router;
