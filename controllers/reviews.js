const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/asyncErrorhandler");
const ErrorResponse = require("../utils/errorResponse");

// @description Get all reviews
// @route       GET api/v1/reviews
// @route       GET api/v1/bootcamps/:bootcampId/reviews
// @accesss     Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  // Check if there is a bootcampId in params,
  // if no then return all Reviews
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res.status(201).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(201).json(res.advancedResults);
  }
});

// @description Get single review
// @route       GET api/v1/reviews/:id
// @accesss     Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id ${req.params.id}.`, 404)
    );
  }

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @description Add review
// @route       POST api/v1/bootcamps/:bootcampsId/reviews
// @accesss     Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No Bootcamp with id of ${req.params.bootcampId}.`, 404)
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});