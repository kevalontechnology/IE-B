const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, default: 'System' },
    userRole: { type: String, default: 'System' },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    recordId: { type: String, default: null },
    description: { type: String, required: true },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    changes: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
