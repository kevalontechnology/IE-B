const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, trim: true },
    currencyCode: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

countrySchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Country', countrySchema);
