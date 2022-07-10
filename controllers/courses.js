const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
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

// @description Get single course
// @route       GET api/v1/courses/:id
// @accesss     Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id ${req.params.id}.`, 404)
    );
  }

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @description Add course
// @route       POST api/v1/bootcamps/:bootcampId/courses
// @accesss     Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No Bootcamp with id of ${req.params.bootcampId}.`, 404)
    );
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @description Update course
// @route       PUT api/v1/courses/:id
// @accesss     Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    return next(
      new ErrorResponse(`No Course with id of ${req.params.bootcampId}.`, 404)
    );
  }

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @description Delete course
// @route       DELETE api/v1/courses/:id
// @accesss     Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!Course) {
    return next(
      new ErrorResponse(`Course not found with id ${req.params.id}.`, 404)
    );
  }

  course.remove();

  res.status(201).json({
    success: true,
    data: {},
  });
});
