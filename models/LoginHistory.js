const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    email: { type: String, required: true },
    ipAddress: { type: String, required: true },
    browser: { type: String },
    os: { type: String },
    device: { type: String },
    status: { type: String, enum: ['Success', 'Failed', 'Blocked', 'Pending'], required: true },
    failureReason: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
