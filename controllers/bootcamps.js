const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/asyncErrorhandler");
const geocoder = require("../utils/geocoder");
const ErrorResponse = require("../utils/errorResponse");

// @description Get all bootcamps
// @route       GET api/v1/bootcamps
// @accesss     Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // Pass advancedResults middleware that handle all actions
  res.status(201).json(res.advancedResults);
});

// @description Get single bootcamp
// @route       GET api/v1/bootcamps/:id
// @accesss     Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}.`, 404)
    );
  }

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @description Create new bootcamp
// @route       POST api/v1/bootcamps
// @accesss     Public
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for published Bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // If the user is not an admin they can only add 1 bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @description Update bootcamp
// @route       PUT api/v1/bootcamps/:id
// @accesss     Public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}.`, 404)
    );
  }

  // Make sure that user is owner of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @description Delete bootcamp
// @route       DELETE api/v1/bootcamps/:id
// @accesss     Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}.`, 404)
    );
  }

  // Make sure that user is owner of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this bootcamp`,
        401
      )
    );
  }

  bootcamp.remove();

  res.status(201).json({
    success: true,
    data: {},
  });
});

// @description Get bootcamps within a radius
// @route       GET api/v1/bootcamps/radius/:zipcode/:distance
// @accesss     Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const location = await geocoder.geocode(zipcode);
  const lat = location[0].latitude;
  const lng = location[0].longitude;

  // Calc radius using radians (divide distance by radius of the Earth)
  // Earth Radius = 3,963 m / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @description Upload photo for bootcamp
// @route       PUT api/v1/bootcamps/:id/photo
// @accesss     Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}.`, 404)
    );
  }

  // Make sure that user is owner of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse("PLease, upload a file", 400));
  }

  const file = req.files.file;

  // Check if the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please, upload an image file", 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_SIZE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please, upload an image less than ${
          process.env.MAX_FILE_SIZE_UPLOAD / 1000000
        } Mb`,
        400
      )
    );
  }

  // Create custom filename for an image
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  // Upload file to the public folder
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (error) => {
    if (error) {
      return next(new ErrorResponse("Problem with file upload", 500));
    }

    // Insert file into the database
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
  });

  res.status(200).json({
    success: true,
    data: file.name,
  });
});
