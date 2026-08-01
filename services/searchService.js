const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Quotation = require('../models/Quotation');
const Shipment = require('../models/Shipment');
const Document = require('../models/Document');

class SearchService {
  async globalSearch(queryStr) {
    if (!queryStr || queryStr.trim().length < 2) {
      return { customers: [], products: [], quotations: [], shipments: [], documents: [] };
    }

    const regex = new RegExp(queryStr.trim(), 'i');

    const [customers, products, quotations, shipments, documents] = await Promise.all([
      Customer.find({
        $or: [{ customerName: regex }, { company: regex }, { email: regex }],
      }).limit(5).select('customerName company country email'),

      Product.find({
        $or: [{ productName: regex }, { hsn: regex }],
      }).limit(5).select('productName hsn defaultRate unit'),

      Quotation.find({
        $or: [{ quotationNumber: regex }, { customerName: regex }],
      }).limit(5).select('quotationNumber customerName grandTotal status createdAt'),

      Shipment.find({
        $or: [
          { invoiceNumber: regex },
          { 'shippingDetails.containerNumber': regex },
          { 'shippingDetails.blNumber': regex },
          { 'customerDetails.customerName': regex },
        ],
      }).limit(5).select('invoiceNumber shippingDetails customerDetails financials status'),

      Document.find({
        $or: [{ invoiceNumber: regex }, { fileName: regex }],
      }).limit(5).select('docType invoiceNumber fileName version createdAt'),
    ]);

    return {
      customers,
      products,
      quotations,
      shipments,
      documents,
    };
  }
}

module.exports = new SearchService();
