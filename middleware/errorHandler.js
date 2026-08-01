const HTTP_STATUS = require('../constants/httpStatusCodes');
const { sendError } = require('../utils/responseFormatter');

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error Stack:', err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return sendError(
      res,
      `Duplicate entry: ${field} '${value}' already exists.`,
      null,
      HTTP_STATUS.CONFLICT
    );
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Invalid format for field: ${err.path}`, null, HTTP_STATUS.BAD_REQUEST);
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
    return sendError(res, 'Database validation error', errors, HTTP_STATUS.BAD_REQUEST);
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, null, statusCode);
};

module.exports = errorHandler;
