const HTTP_STATUS = require('../constants/httpStatusCodes');
const { sendError } = require('../utils/responseFormatter');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated user.', null, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. ${req.user.role} role does not have permission for this action.`,
        null,
        HTTP_STATUS.FORBIDDEN
      );
    }
    next();
  };
};

module.exports = { authorize };
