const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const quotationItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  hsn: { type: String, required: true },
  description: { type: String, default: '' },
  unit: { type: String, default: 'KGS' },
  weight: { type: Number, default: 0 },
  packing: { type: String, default: 'Carton Box' },
  quantity: { type: Number, required: true, min: 0.01 },
  rate: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  amount: { type: Number, required: true },
});

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: { type: String, required: true, unique: true, index: true },
    quotationDate: { type: Date, default: Date.now },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    items: [quotationItemSchema],
    currency: { type: String, default: 'USD' },
    exchangeRate: { type: Number, default: 83.5 },
    subTotal: { type: Number, required: true, default: 0 },
    discountTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    grandTotalINR: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Converted'],
      default: 'Draft',
      index: true,
    },
    notes: { type: String, default: '' },
    termsAndConditions: { type: String, default: '' },
    convertedToShipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

quotationSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Quotation', quotationSchema);
