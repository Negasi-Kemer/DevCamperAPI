// Express
const express = require("express");

// Method in controller
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
} = require("../controllers/bootcamp");

// Router
const router = express.Router();

// Bootcamp controller
const bootcampController = require("../controllers/bootcamp");

// Group routes
router.route("/").get(getBootcamps).post(createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

// Export router
module.exports = router;
