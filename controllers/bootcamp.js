// Geocoder
const geocoder = require("../utils/geocoder");

// Bootcamp model
const Bootcamp = require("../models/Bootcamp");

// Error response
const ErrorResponse = require("../utils/erroResponse");

// Async handle
const asyncHandler = require("../middleware/async");

// Path
const path = require("path");

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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
  const bootcamp = await Bootcamp.findById(req.params.id);
  // Check if bootcamp exists
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No Bootcamp with id ${req.params.id} found`, 404)
    );
  }
  bootcamp.remove();

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

// @desc Upload bootcamp photo
// @route PUT /api/v1/bootcamps:/id/photo
// @access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  // Check if bootcamp exists
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No Bootcamp with id ${req.params.id} found`, 404)
    );
  }

  // Check if file is uploaded
  if (!req.files) {
    return next(new ErrorResponse("Please upload a photo", 400));
  }

  const file = req.files.file;
  // Check if the file uploaded is of image type
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload an image file", 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }
  // Create custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  // Store the image in public/upload folder
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(
        new ErrorResponse("Error uploading file. Please try again", 500)
      );
    }

    // Update the photo field of bootcamp with the uploaded photo name
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    // Send response
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
