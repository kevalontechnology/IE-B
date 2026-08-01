const rateLimit = require('express-rate-limit');
const HTTP_STATUS = require('../constants/httpStatusCodes');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Limit login/register attempts to 20 per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

module.exports = { apiLimiter, authLimiter };
