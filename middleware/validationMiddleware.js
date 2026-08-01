const HTTP_STATUS = require('../constants/httpStatusCodes');
const { sendError } = require('../utils/responseFormatter');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));
      return sendError(res, 'Validation error', errorDetails, HTTP_STATUS.BAD_REQUEST);
    }

    req[property] = value;
    next();
  };
};

module.exports = { validate };
