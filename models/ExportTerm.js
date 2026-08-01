const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const exportTermSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null, index: true },
    term: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

exportTermSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('ExportTerm', exportTermSchema);
