const userRepo = require('../repositories/userRepo');
const authService = require('../services/authService');
const { sendSuccess } = require('../utils/responseFormatter');

class UserController {
  async getUsers(req, res, next) {
    try {
      const result = await userRepo.findAll(req.query);
      return sendSuccess(res, 'Users fetched successfully.', result.users, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedUser = await authService.updateUserStatus(id, status, req);
      return sendSuccess(res, `User status updated to ${status}.`, updatedUser);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
