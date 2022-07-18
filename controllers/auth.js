const User = require("../models/User");
const asyncHandler = require("../middleware/asyncErrorhandler");
const ErrorResponse = require("../utils/errorResponse");

// @description Register user
// @route       GET api/v1/auth/register
// @accesss     Public
exports.register = asyncHandler(async (req, res, next) => {
  res.status(201).json({
    success: true,
  });
});
