const crypto = require("crypto");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncErrorhandler");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");

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

  sendTokenResponseWithCookie(user, 200, res);
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

  if (!user) {
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  // Check if password matches
  const isPasswordMatched = await user.isPasswordCorrect(password);

  if (!isPasswordMatched) {
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  sendTokenResponseWithCookie(user, 200, res);
});

// @description Get current logged in user
// @route       POST api/v1/auth/me
// @accesss     Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @description Forgor password
// @route       POST api/v1/auth/forgotpassword
// @accesss     Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because (or someone else) has requested the reset of a password. 
  Please, make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({
      success: true,
      data: "Email sent",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorReponse("Email could not be sent", 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @description Reset Password
// @route       PUT api/v1/auth/resetpassword/:resettoken
// @accesss     Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponseWithCookie(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponseWithCookie = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
