const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { jwtSecret } = require('../config/env');

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    req.userId = decoded.userId;

    next();
  } catch (err) {
    throw new ApiError(401, 'Not authorized, token invalid or expired');
  }
});

module.exports = protect;
