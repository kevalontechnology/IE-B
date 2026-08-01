const mongoose = require('mongoose');

const sequenceSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, unique: true }, // e.g. 'QUOTATION', 'INVOICE', 'SHIPMENT'
    prefix: { type: String, required: true }, // e.g. 'QT-', 'INV-', 'SHP-'
    year: { type: Number, default: new Date().getFullYear() },
    sequenceNumber: { type: Number, default: 1 },
    padding: { type: Number, default: 6 }, // 000001
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sequence', sequenceSchema);
