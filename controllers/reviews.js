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
