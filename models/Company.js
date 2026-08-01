const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const companySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    gst: { type: String, required: true, trim: true },
    iec: { type: String, required: true, trim: true },
    pan: { type: String, required: true, trim: true },
    bin: { type: String, default: '', trim: true },
    lut: { type: String, default: '', trim: true },
    logo: { type: String, default: '' },
    digitalSignature: { type: String, default: '' },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
      pincode: { type: String, required: true },
    },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    website: { type: String, default: '' },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountNo: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      swiftCode: { type: String, default: '' },
      branch: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

companySchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Company', companySchema);
