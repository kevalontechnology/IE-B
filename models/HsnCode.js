const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const hsnCodeSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null, index: true },
    hsnCode: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    gstPercentage: { type: Number, required: true, default: 18 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

hsnCodeSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('HsnCode', hsnCodeSchema);
