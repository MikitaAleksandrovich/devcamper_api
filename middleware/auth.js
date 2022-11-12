const jwt = require("jsonwebtoken");
const asyncErrorHandler = require("./asyncErrorhandler");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const ErrorReponse = require("../utils/errorResponse");

// Protect routes
exports.protect = asyncErrorHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorReponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return next(new ErrorReponse("Not authorized to access this route", 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorReponse(
          `User role ${req.user.role} is not authorize to commit this action`,
          403
        )
      );
    }
    next();
  };
};
