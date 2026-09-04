/**
 * Wraps an async controller so any thrown/rejected error is forwarded to
 * next(), landing in the centralized error middleware instead of requiring
 * a try/catch block in every controller function.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
