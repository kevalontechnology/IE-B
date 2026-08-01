const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { USER_STATUS } = require('../constants/roles');
const HTTP_STATUS = require('../constants/httpStatusCodes');
const { sendError } = require('../utils/responseFormatter');

const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, 'Authentication token missing. Please log in.', null, HTTP_STATUS.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'export_crm_jwt_access_secret_key_2026_secure_key');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 'User no longer exists.', null, HTTP_STATUS.UNAUTHORIZED);
    }

    if (user.status !== USER_STATUS.APPROVED) {
      return sendError(
        res,
        `Your account status is ${user.status}. Please contact Admin.`,
        null,
        HTTP_STATUS.FORBIDDEN
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired. Please refresh session.', null, HTTP_STATUS.UNAUTHORIZED);
    }
    return sendError(res, 'Invalid authentication token.', null, HTTP_STATUS.UNAUTHORIZED);
  }
};

module.exports = { authenticate };
