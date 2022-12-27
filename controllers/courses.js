const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/asyncErrorhandler");
const ErrorResponse = require("../utils/errorResponse");

// @description Get all courses
// @route       GET api/v1/courses
// @route       GET api/v1/bootcamps/:bootcampId/courses
// @accesss     Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // Check if there is a bootcampId in params,
  // if no then return all Courses
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(201).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(201).json(res.advancedResults);
  }
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
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No Bootcamp with id of ${req.params.bootcampId}.`, 404)
    );
  }

  console.log("user", bootcamp.user);

  // Make sure that user is owner of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
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

  // Make sure that user is owner of the course
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update course ${course._id}`,
        401
      )
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

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id ${req.params.id}.`, 404)
    );
  }

  // Make sure that user is owner of the course
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete course ${course._id}`,
        401
      )
    );
  }

  course.remove();

  res.status(201).json({
    success: true,
    data: {},
  });
});
