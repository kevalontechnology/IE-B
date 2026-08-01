const User = require('../models/User');
const Company = require('../models/Company');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Factory = require('../models/Factory');
const ShippingLine = require('../models/ShippingLine');
const Port = require('../models/Port');
const Country = require('../models/Country');
const Currency = require('../models/Currency');
const Quotation = require('../models/Quotation');
const Shipment = require('../models/Shipment');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { createAuditLog } = require('../middleware/auditMiddleware');

class BackupService {
  async exportDatabaseSnapshot(req) {
    const [
      users,
      companies,
      customers,
      products,
      factories,
      shippingLines,
      ports,
      countries,
      currencies,
      quotations,
      shipments,
      documents,
    ] = await Promise.all([
      User.find({}).select('-password'),
      Company.find({}),
      Customer.find({}),
      Product.find({}),
      Factory.find({}),
      ShippingLine.find({}),
      Port.find({}),
      Country.find({}),
      Currency.find({}),
      Quotation.find({}),
      Shipment.find({}),
      Document.find({}),
    ]);

    const snapshot = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        users,
        companies,
        customers,
        products,
        factories,
        shippingLines,
        ports,
        countries,
        currencies,
        quotations,
        shipments,
        documents,
      },
    };

    await createAuditLog(req, {
      action: 'EXPORT_DATABASE_BACKUP',
      module: 'SYSTEM',
      description: 'Admin exported full JSON database snapshot backup',
    });

    return snapshot;
  }
}

module.exports = new BackupService();
