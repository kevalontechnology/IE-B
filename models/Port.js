const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const portSchema = new mongoose.Schema(
  {
    portName: { type: String, required: true, trim: true },
    portCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Loading', 'Discharge', 'Both'], default: 'Both' },
  },
  { timestamps: true }
);

portSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Port', portSchema);
