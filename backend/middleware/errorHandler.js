/**
 * Error Handling Middleware
 * Centralized error handling for all API endpoints
 */

/**
 * Error handler middleware
 * Catches and formats errors consistently
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Validation error
  if (err.status === 400) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Bad Request'
    });
  }

  // Not found error
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      message: err.message || 'Resource not found'
    });
  }

  // Server error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

/**
 * Validation helper
 * Creates a validation error object
 */
const validationError = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

/**
 * Not found error helper
 */
const notFoundError = (message = 'Resource not found') => {
  const error = new Error(message);
  error.status = 404;
  return error;
};

module.exports = {
  errorHandler,
  validationError,
  notFoundError
};
