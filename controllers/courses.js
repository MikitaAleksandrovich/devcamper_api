const Course = require("../models/Course");
const asyncHandler = require("../middleware/asyncErrorhandler");
const ErrorResponse = require("../utils/errorResponse");

// @description Get all courses
// @route       GET api/v1/courses
// @route       GET api/v1/bootcamps/:bootcampId/courses
// @accesss     Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  // Check if there is a bootcampId in params,
  // if no then return all Courses
  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find().populate({
      path: "bootcamp",
      select: "name description",
    });
  }

  // Executing query
  const courses = await query;

  res.status(201).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});
