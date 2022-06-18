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

router
  .route("/")
  .get(
    advancedResult(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(createCourse);

router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse);

// Export
module.exports = router;
