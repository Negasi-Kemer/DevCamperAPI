const express = require("express");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/user");

const router = express.Router({ mergeParams: true });

const advancedResutls = require("../middleware/advancedResult");
const { protect, authorize } = require("../middleware/auth");
const User = require("../models/User");

// Any route should use 'protect'
router.use(protect);

// Any route should use 'authorize'
router.use(authorize("admin"));

router.route("/").get(advancedResutls(User), getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
