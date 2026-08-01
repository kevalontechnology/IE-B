const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const currencySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },
    symbol: { type: String, required: true },
    exchangeRateToINR: { type: Number, required: true, default: 83.5 },
  },
  { timestamps: true }
);

currencySchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Currency', currencySchema);
