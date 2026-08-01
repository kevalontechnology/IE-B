const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/responseFormatter');
const { ROLES } = require('../constants/roles');

class DashboardController {
  async getDashboardStats(req, res, next) {
    try {
      const userRole = req.user.role;
      let stats = {};

      if (userRole === ROLES.ADMIN) {
        stats = await dashboardService.getAdminStats();
      } else if (userRole === ROLES.SUPERVISOR) {
        stats = await dashboardService.getSupervisorStats();
      } else if (userRole === ROLES.SALES) {
        stats = await dashboardService.getSalesStats(req.user._id);
      }

      return sendSuccess(res, 'Dashboard metrics fetched successfully.', { role: userRole, stats });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
