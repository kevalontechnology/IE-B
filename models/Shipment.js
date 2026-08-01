const mongoose = require('mongoose');
const softDeletePlugin = require('../utils/softDeletePlugin');

const shipmentItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  hsn: { type: String, required: true },
  description: { type: String, default: '' },
  unit: { type: String, default: 'KGS' },
  quantity: { type: Number, required: true, min: 0.01 },
  rate: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  netWeight: { type: Number, default: 0 },
  grossWeight: { type: Number, default: 0 },
  packages: { type: Number, default: 1 },
  packingType: { type: String, default: 'Carton Box' },
});

const shipmentSchema = new mongoose.Schema(
  {
    shipmentNumber: { type: String, default: null, sparse: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    invoiceDate: { type: Date, default: Date.now },
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerDetails: {
      customerName: { type: String, required: true },
      company: { type: String, required: true },
      country: { type: String, required: true },
      gst: { type: String, default: '' },
      address: { type: String, required: true },
      notifyParty: { type: String, default: '' },
      paymentTerms: { type: String, default: 'LC at Sight' },
      currency: { type: String, default: 'USD' },
    },
    items: [shipmentItemSchema],
    shippingDetails: {
      containerNumber: { type: String, required: true, unique: true, index: true },
      containerSize: { type: String, default: '20FT Standard' },
      sealNumber: { type: String, required: true },
      electronicSealNumber: { type: String, default: '' },
      totalPackages: { type: Number, required: true, min: 1 },
      packageType: { type: String, default: 'Carton Boxes' },
      totalNetWeight: { type: Number, required: true, min: 0 },
      totalGrossWeight: { type: Number, required: true, min: 0 },
      vgmWeight: { type: Number, required: true, min: 0 },
      weighBridgeName: { type: String, default: 'Certified Weigh Bridge' },
      portOfLoading: { type: String, required: true },
      portOfDischarge: { type: String, required: true },
      shippingLine: { type: String, required: true },
      blNumber: { type: String, default: '' },
      vesselName: { type: String, default: '' },
      etd: { type: Date, default: null },
      eta: { type: Date, default: null },
      factory: { type: mongoose.Schema.Types.ObjectId, ref: 'Factory', default: null },
      currency: { type: String, default: 'USD' },
      exchangeRate: { type: Number, default: 83.5 },
      incoterms: { type: String, default: 'FOB' },
      lutNumber: { type: String, default: '' },
    },
    financials: {
      subTotal: { type: Number, required: true, default: 0 },
      discountTotal: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true, default: 0 },
      grandTotalINR: { type: Number, required: true, default: 0 },
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Logistics', 'Shipped', 'Completed', 'Cancelled'],
      default: 'Pending Logistics',
      index: true,
    },
    documentsGenerated: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

shipmentSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Shipment', shipmentSchema);
