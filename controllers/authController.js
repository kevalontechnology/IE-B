const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const HTTP_STATUS = require('../constants/httpStatusCodes');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.registerUser(req.body, req);
      return sendSuccess(res, result.message, result, null, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password, req);

      // Set Refresh Token in HttpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, 'Login successful.', result);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);
      const tokens = await authService.refreshToken(refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, 'Token refreshed successfully.', tokens);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie('refreshToken');
      return sendSuccess(res, 'Logged out successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      return sendSuccess(res, 'User profile fetched.', req.user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
