const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Company = require('../models/Company');
const Country = require('../models/Country');
const Currency = require('../models/Currency');
const Port = require('../models/Port');
const ShippingLine = require('../models/ShippingLine');
const Factory = require('../models/Factory');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const PaymentTerm = require('../models/PaymentTerm');
const ProductCategory = require('../models/ProductCategory');
const ExportTerm = require('../models/ExportTerm');
const HsnCode = require('../models/HsnCode');
const ContainerQuantity = require('../models/ContainerQuantity');
const { ROLES, USER_STATUS } = require('../constants/roles');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/export_crm_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Seeding...');

    // Drop legacy non-sparse shipmentNumber index if present
    try {
      await mongoose.connection.collection('shipments').dropIndex('shipmentNumber_1');
      console.log('Cleared legacy shipmentNumber index');
    } catch (e) {
      // Ignore if index doesn't exist
    }

    // 1. Seed Admin User
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@exportcrm.com';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        fullName: 'System Administrator',
        companyName: 'Global Export Corporation',
        email: adminEmail,
        mobile: '+919999988888',
        password: process.env.ADMIN_INITIAL_PASSWORD || 'Admin@123456',
        role: ROLES.ADMIN,
        status: USER_STATUS.APPROVED,
      });
      console.log(`✅ Admin Account Created: ${adminEmail}`);
    }

    // 2. Seed Default Company Master
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
          street: '101 Export House, Commercial Hub',
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
      console.log('✅ Company Master Created');
    }

    // 3. Seed Payment Terms Master
    const defaultPaymentTerms = [
      { name: 'LC At Sight', description: 'Letter of Credit at Sight' },
      { name: 'Advance Payment', description: '100% Advance Payment TT' },
      { name: '30 Days', description: '30 Days Net' },
      { name: '45 Days', description: '45 Days Net' },
      { name: '60 Days', description: '60 Days Net' },
      { name: '90 Days', description: '90 Days Net' },
      { name: '120 Days Against BL', description: '120 Days Against Bill of Lading' },
      { name: 'CAD', description: 'Cash Against Documents' },
    ];
    for (const pt of defaultPaymentTerms) {
      await PaymentTerm.updateOne({ name: pt.name }, { ...pt, createdBy: admin._id, updatedBy: admin._id }, { upsert: true });
    }
    console.log('✅ Payment Terms Master Seeded');

    // 4. Seed Product Categories Master
    const defaultCategories = [
      { categoryName: 'Sanitary Ware', description: 'Ceramic Sanitary Ware Products' },
      { categoryName: 'Tiles', description: 'Vitrified and Ceramic Tiles' },
      { categoryName: 'Wash Basin', description: 'Pedestal and Tabletop Wash Basins' },
      { categoryName: 'Accessories', description: 'Bathroom & Hardware Accessories' },
      { categoryName: 'Fittings', description: 'CP Fittings and Valves' },
      { categoryName: 'Agro Commodities', description: 'Agricultural Export Products' },
    ];
    for (const cat of defaultCategories) {
      await ProductCategory.updateOne({ categoryName: cat.categoryName }, { ...cat, createdBy: admin._id, updatedBy: admin._id }, { upsert: true });
    }
    console.log('✅ Product Categories Master Seeded');

    // 5. Seed Export Terms Master
    const defaultExportTerms = [
      { term: 'FOB', description: 'Free On Board (Port of Loading)' },
      { term: 'CIF', description: 'Cost, Insurance and Freight' },
      { term: 'CFR', description: 'Cost and Freight' },
      { term: 'EXW', description: 'Ex Works (Factory Gate)' },
      { term: 'DAP', description: 'Delivered At Place' },
      { term: 'DDP', description: 'Delivered Duty Paid' },
    ];
    for (const et of defaultExportTerms) {
      await ExportTerm.updateOne({ term: et.term }, { ...et, createdBy: admin._id, updatedBy: admin._id }, { upsert: true });
    }
    console.log('✅ Export Terms Master Seeded');

    // 6. Seed HSN Codes Master
    const defaultHsnCodes = [
      { hsnCode: '10063020', gstPercentage: 5, description: 'Basmati Rice' },
      { hsnCode: '69101000', gstPercentage: 18, description: 'Ceramic Sinks, Wash Basins & Sanitary Fixtures' },
      { hsnCode: '69072100', gstPercentage: 18, description: 'Unglazed Ceramic Flags and Paving, Hearth or Wall Tiles' },
    ];
    for (const hsn of defaultHsnCodes) {
      await HsnCode.updateOne({ hsnCode: hsn.hsnCode }, { ...hsn, createdBy: admin._id, updatedBy: admin._id }, { upsert: true });
    }
    console.log('✅ HSN Codes Master Seeded');

    // 7. Seed Container Quantities Master
    const defaultContainerQuantities = [
      { quantityName: '1 x 20 FT', description: 'Single 20 Foot Standard Container' },
      { quantityName: '1 x 40 FT', description: 'Single 40 Foot Standard Container' },
      { quantityName: '2 x 20 FT', description: 'Two 20 Foot Standard Containers' },
      { quantityName: '2 x 40 FT', description: 'Two 40 Foot Standard Containers' },
      { quantityName: '1 x 40 HC', description: 'Single 40 Foot High Cube Container' },
    ];
    for (const cq of defaultContainerQuantities) {
      await ContainerQuantity.updateOne({ quantityName: cq.quantityName }, { ...cq, createdBy: admin._id, updatedBy: admin._id }, { upsert: true });
    }
    console.log('✅ Container Quantities Master Seeded');

    // 8. Seed Countries & Currencies
    const defaultCountries = [
      { name: 'United States', code: 'US', currencyCode: 'USD' },
      { name: 'United Kingdom', code: 'GB', currencyCode: 'GBP' },
      { name: 'United Arab Emirates', code: 'AE', currencyCode: 'AED' },
      { name: 'Germany', code: 'DE', currencyCode: 'EUR' },
      { name: 'Australia', code: 'AU', currencyCode: 'AUD' },
      { name: 'India', code: 'IN', currencyCode: 'INR' },
    ];
    for (const c of defaultCountries) {
      await Country.updateOne({ name: c.name }, c, { upsert: true });
    }

    const defaultCurrencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRateToINR: 83.5 },
      { code: 'EUR', name: 'Euro', symbol: '€', exchangeRateToINR: 90.2 },
      { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRateToINR: 106.1 },
      { code: 'AED', name: 'UAE Dirham', symbol: 'AED', exchangeRateToINR: 22.7 },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRateToINR: 1.0 },
    ];
    for (const curr of defaultCurrencies) {
      await Currency.updateOne({ code: curr.code }, curr, { upsert: true });
    }

    // 9. Seed Ports & Shipping Lines
    const defaultPorts = [
      { portName: 'Jawaharlal Nehru Port (JNPT / Nhava Sheva)', portCode: 'INNSA', country: 'India', type: 'Loading' },
      { portName: 'Mundra Port', portCode: 'INMUN', country: 'India', type: 'Loading' },
      { portName: 'Port of Jebel Ali', portCode: 'AEJEA', country: 'United Arab Emirates', type: 'Discharge' },
      { portName: 'Port of Hamburg', portCode: 'DEHAM', country: 'Germany', type: 'Discharge' },
      { portName: 'Port of New York / New Jersey', portCode: 'USNYC', country: 'United States', type: 'Discharge' },
    ];
    for (const p of defaultPorts) {
      await Port.updateOne({ portCode: p.portCode }, p, { upsert: true });
    }

    const defaultShippingLines = [
      { name: 'Maersk Line', code: 'MAEU' },
      { name: 'MSC (Mediterranean Shipping Company)', code: 'MSCU' },
      { name: 'CMA CGM', code: 'CMDU' },
      { name: 'Hapag-Lloyd', code: 'HLCU' },
      { name: 'ONE (Ocean Network Express)', code: 'ONEY' },
    ];
    for (const sl of defaultShippingLines) {
      await ShippingLine.updateOne({ name: sl.name }, sl, { upsert: true });
    }

    console.log('✨ All Master Datasets & Seed Records Created Successfully!');
  } catch (err) {
    console.error('❌ Seeding Error:', err);
  }
};

if (require.main === module) {
  seedData().then(() => mongoose.disconnect());
}

module.exports = seedData;
