const { errorResponse } = require('../utils/responseHandler');

const errorMiddleware = (err, req, res, next) => {
  console.error('Global Error Handler caught:', err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, 409, `Duplicate value entered for ${field}`, 'DUPLICATE_ENTRY');
  }

  // Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    return errorResponse(res, 400, `Invalid ID format for ${err.path}`, 'INVALID_ID');
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message).join('; ');
    return errorResponse(res, 422, messages, 'VALIDATION_ERROR');
  }

  return errorResponse(res, err.statusCode || 500, err.message || 'Internal Server Error', err.errorCode || 'INTERNAL_ERROR');
};

module.exports = errorMiddleware;
