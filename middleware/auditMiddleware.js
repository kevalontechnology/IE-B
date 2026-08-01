const AuditLog = require('../models/AuditLog');

const createAuditLog = async (req, { action, module, description, recordId = null, changes = null }) => {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await AuditLog.create({
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.fullName : 'System / Guest',
      userRole: req.user ? req.user.role : 'System',
      action,
      module,
      recordId,
      description,
      ipAddress,
      userAgent,
      changes,
    });
  } catch (err) {
    console.error('Audit Log error:', err.message);
  }
};

module.exports = { createAuditLog };
