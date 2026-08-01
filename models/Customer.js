const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const customerSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true, index: true },
    company: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, index: true },
    gst: { type: String, default: '', trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      country: { type: String, required: true },
      postalCode: { type: String, default: '' },
    },
    notifyParty: { type: String, default: '' },
    paymentTerms: { type: String, default: 'LC at Sight' },
    currency: { type: String, default: 'USD' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

customerSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Customer', customerSchema);
