const express = require("express");

// Methods in courses controller
const { getCourses } = require("../controllers/courses");

// Router
const router = express.Router({ mergeParams: true });

router.route("/").get(getCourses);

// Export
module.exports = router;
