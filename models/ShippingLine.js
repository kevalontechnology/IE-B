const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const shippingLineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
  },
  { timestamps: true }
);

shippingLineSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('ShippingLine', shippingLineSchema);
