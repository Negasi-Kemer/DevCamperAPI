// Geocoder
const geocoder = require("../utils/geocoder");

// Bootcamp model
const Bootcamp = require("../models/Bootcamp");

// Error response
const ErrorResponse = require("../utils/erroResponse");

// Async handle
const asyncHandler = require("../middleware/async");

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from being matched
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and remove them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create opertators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Find the resource
  query = Bootcamp.find(JSON.parse(queryStr));

  // Select only specific fields to show on result
  if (req.query.select) {
    // The 'req.query.select' has its values separated by ','
    // E.g: localhost:3000/api/v1/bootcamps?select=name,description
    // So remove the ',' between 'name' and 'description' and pass it to 'query.select()'
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort by a colum user chose. If not, sort by date
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Execute the query
  const bootcamps = await query;

  // Pagination object
  const pagination = {};

  // If endIndex is less than the total document count, add 'next' button
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  // If startIndex is greater than zero, add 'prev' button
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
});

// @desc Get one bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No Bootcamp with id ${req.params.id} found`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc Create bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Create bootcamp
  const bootcamp = await Bootcamp.create(req.body);

  // Response
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc Edit bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No Bootcamp with id ${req.params.id} found`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc Delete bootcamp
// @route DELETE /api/v1/bootcamps:/ID
// @access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndRemove(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No Bootcamp with id ${req.params.id} found`, 404)
    );
  }

  res.status(200).json({ success: true });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $center: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
