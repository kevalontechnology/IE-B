const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const factorySchema = new mongoose.Schema(
  {
    factoryName: { type: String, required: true, trim: true },
    gst: { type: String, required: true, trim: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

factorySchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Factory', factorySchema);
