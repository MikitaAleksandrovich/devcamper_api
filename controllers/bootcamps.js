const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/asyncErrorhandler");
const geocoder = require("../utils/geocoder");
const ErrorResponse = require("../utils/errorResponse");

// @description Get all bootcamps
// @route       GET api/v1/bootcamps
// @accesss     Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();

  res.status(201).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
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
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

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

// @description Delete bootcamp
// @route       DELETE api/v1/bootcamps/:id
// @accesss     Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}.`, 404)
    );
  }

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
