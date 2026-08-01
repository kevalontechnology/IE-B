const Company = require('../models/Company');
const Factory = require('../models/Factory');
const ShippingLine = require('../models/ShippingLine');
const Port = require('../models/Port');
const Country = require('../models/Country');
const Currency = require('../models/Currency');
const { createAuditLog } = require('../middleware/auditMiddleware');
const HTTP_STATUS = require('../constants/httpStatusCodes');

class MasterService {
  // Company Settings
  async getCompany() {
    let company = await Company.findOne({});
    if (!company) {
      company = await Company.create({
        companyName: 'Global Export Corporation Pvt Ltd',
        gst: '27AAAAA0000A1Z5',
        iec: '1234567890',
        pan: 'AAAAA0000A',
        bin: '1000000000',
        lut: 'AD270324000001X',
        address: {
          street: '101 Export House, Business Hub',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          pincode: '400001',
        },
        phone: '+91 22 9876 5432',
        email: 'export@globalcorp.com',
        website: 'https://globalcorp-export.com',
        bankDetails: {
          bankName: 'HDFC Bank Ltd',
          accountNo: '50200012345678',
          ifscCode: 'HDFC0000123',
          swiftCode: 'HDFCINBBXXX',
          branch: 'Fort, Mumbai',
        },
      });
    }
    return company;
  }

  async updateCompany(data, req) {
    let company = await Company.findOne({});
    if (company) {
      company = await Company.findByIdAndUpdate(company._id, data, { new: true });
    } else {
      company = await Company.create(data);
    }

    await createAuditLog(req, {
      action: 'UPDATE_COMPANY_MASTER',
      module: 'SETTINGS',
      description: `Updated Company Master parameters`,
      recordId: company._id.toString(),
    });

    return company;
  }

  // Factories
  async getFactories() {
    return await Factory.find({}).sort({ factoryName: 1 });
  }

  async createFactory(data, req) {
    const factory = await Factory.create(data);
    await createAuditLog(req, {
      action: 'CREATE_FACTORY',
      module: 'MASTER',
      description: `Created Factory '${factory.factoryName}'`,
      recordId: factory._id.toString(),
    });
    return factory;
  }

  // Shipping Lines
  async getShippingLines() {
    return await ShippingLine.find({}).sort({ name: 1 });
  }

  async createShippingLine(data, req) {
    const shippingLine = await ShippingLine.create(data);
    await createAuditLog(req, {
      action: 'CREATE_SHIPPING_LINE',
      module: 'MASTER',
      description: `Created Shipping Line '${shippingLine.name}'`,
      recordId: shippingLine._id.toString(),
    });
    return shippingLine;
  }

  // Ports
  async getPorts() {
    return await Port.find({}).sort({ portName: 1 });
  }

  async createPort(data, req) {
    const port = await Port.create(data);
    await createAuditLog(req, {
      action: 'CREATE_PORT',
      module: 'MASTER',
      description: `Created Port '${port.portName}' (${port.portCode})`,
      recordId: port._id.toString(),
    });
    return port;
  }

  // Countries & Currencies
  async getCountries() {
    return await Country.find({}).sort({ name: 1 });
  }

  async getCurrencies() {
    return await Currency.find({}).sort({ code: 1 });
  }
}

module.exports = new MasterService();
