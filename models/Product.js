const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true, index: true },
    sku: { type: String, default: null, sparse: true, index: true },
    hsn: { type: String, required: true, trim: true, index: true },
    category: { type: String, default: 'General', trim: true },
    description: { type: String, default: '' },
    unit: { type: String, required: true, default: 'KGS' },
    weight: { type: Number, default: 0 },
    grossWeight: { type: Number, default: 0 },
    packing: { type: String, default: 'Carton Box' },
    defaultRate: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

productSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Product', productSchema);
