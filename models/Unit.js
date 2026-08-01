const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const unitSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null, index: true },
    unitName: { type: String, required: true, trim: true },
    multiplier: { type: Number, required: true, default: 1 }, // e.g. 2 for SET, 1 for KGS
    description: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

unitSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Unit', unitSchema);
