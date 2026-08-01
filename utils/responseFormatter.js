const HTTP_STATUS = require('../constants/httpStatusCodes');

const sendSuccess = (res, message = 'Success', data = null, meta = null, statusCode = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
  };
  return res.status(statusCode).json(response);
};

const sendError = (res, message = 'An error occurred', errors = null, statusCode = HTTP_STATUS.BAD_REQUEST) => {
  const response = {
    success: false,
    message,
    ...(errors !== null && { errors }),
  };
  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
