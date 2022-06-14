const express = require("express");

// Methods in courses controller
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");

// Router
const router = express.Router({ mergeParams: true });

router.route("/").get(getCourses).post(createCourse);

router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse);

// Export
module.exports = router;
