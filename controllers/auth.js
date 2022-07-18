const User = require("../models/User");
const asyncHandler = require("../middleware/asyncErrorhandler");
const ErrorResponse = require("../utils/errorResponse");

// @description Register user
// @route       GET api/v1/auth/register
// @accesss     Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create a user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  res.status(200).json({ success: true });
});
