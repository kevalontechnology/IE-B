const AuditLog = require('../models/AuditLog');
const LoginHistory = require('../models/LoginHistory');
const { sendSuccess } = require('../utils/responseFormatter');

class AuditController {
  async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 20, module, action, search } = req.query;
      const query = {};
      if (module) query.module = module;
      if (action) query.action = action;
      if (search) {
        query.$or = [
          { userName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { recordId: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;
      const [logs, total] = await Promise.all([
        AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        AuditLog.countDocuments(query),
      ]);

      return sendSuccess(res, 'Audit logs fetched.', logs, {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      next(err);
    }
  }

  async getLoginHistory(req, res, next) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const query = {};
      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { ipAddress: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;
      const [history, total] = await Promise.all([
        LoginHistory.find(query).populate('user', 'fullName role').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        LoginHistory.countDocuments(query),
      ]);

      return sendSuccess(res, 'Login history fetched.', history, {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuditController();
