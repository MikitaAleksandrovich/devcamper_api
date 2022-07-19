const User = require("../models/User");
const asyncHandler = require("../middleware/asyncErrorhandler");
const ErrorResponse = require("../utils/errorResponse");

// @description Register user
// @route       POST api/v1/auth/register
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

  // Create token
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});

// @description Login user
// @route       POST api/v1/auth/login
// @accesss     Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse("Please, provide an email and password", 400)
    );
  }

  // Check for the user
  const user = await User.findOne({ email }).select("+password");

  console.log("user", user);

  if (!user) {
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  // Check if password matches
  const isPasswordMatched = await user.isPasswordCorrect(password);

  if (!isPasswordMatched) {
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  // Create token
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});
