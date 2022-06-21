// Course model
const Course = require("../models/Course");

// Error response
const ErrorResponse = require("../utils/erroResponse");

// Async handle
const asyncHandler = require("../middleware/async");

const Bootcamp = require("../models/Bootcamp");

// @desc Get courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    // Respond
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc Get single course
// @route GET /api/v1/courses/:courseId
// @access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  // Check if course exists with such id
  if (!course) {
    return next(
      new ErrorResponse(`No course found with the id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc Add new course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.createCourse = asyncHandler(async (req, res, next) => {
  // Add bootcamp id to body
  req.body.bootcamp = req.params.bootcampId;

  // Add user to body
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  // Check if bootcamp exists with such id
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp found with the id ${req.params.bootcampId}`,
        404
      )
    );
  }

  // Check if user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `You're not auhorized to add course on this bootcamp`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc update course
// @route PUT /api/v1/:courseId/
// @access Public
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  // Check if course exists with such id
  if (!course) {
    return next(
      new ErrorResponse(`No course found with the id ${req.params.id}`, 404)
    );
  }

  // Check if user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`You're not auhorized to update this course`, 401)
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc delete course
// @route DELETE /api/v1/:courseId/
// @access Public
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  // Check if course exists with such id
  if (!course) {
    return next(
      new ErrorResponse(`No course found with the id ${req.params.id}`, 404)
    );
  }

  // Check if user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`You're not auhorized to delete this course`, 401)
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
