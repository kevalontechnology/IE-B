const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const documentSchema = new mongoose.Schema(
  {
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true },
    invoiceNumber: { type: String, required: true, index: true },
    docType: {
      type: String,
      enum: ['Commercial Invoice', 'Packing List', 'INR Invoice', 'Annexure', 'VGM'],
      required: true,
      index: true,
    },
    version: { type: Number, default: 1 },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

documentSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Document', documentSchema);
