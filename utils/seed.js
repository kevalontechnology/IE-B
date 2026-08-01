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
const { ROLES, USER_STATUS } = require('../constants/roles');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/export_crm_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Seeding...');

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
        status: USER_STATUS.APPROVED, // Admin is approved by default
      });
      console.log(`✅ Admin Account Created: ${adminEmail} / ${process.env.ADMIN_INITIAL_PASSWORD || 'Admin@123456'}`);
    } else {
      console.log(`ℹ️ Admin Account already exists: ${adminEmail}`);
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

    // 3. Seed Default Countries
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
    console.log('✅ Countries Seeded');

    // 4. Seed Default Currencies
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
    console.log('✅ Currencies Seeded');

    // 5. Seed Ports & Shipping Lines
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

    // 6. Seed Sample Factory
    let factory = await Factory.findOne({});
    if (!factory) {
      factory = await Factory.create({
        factoryName: 'Global Manufacturing Unit 1',
        gst: '27AAAAA0000A1Z5',
        address: 'Plot 45, MIDC Industrial Area, Taloja, Navi Mumbai - 410208',
      });
    }

    // 7. Seed Sample Customer & Product
    let customer = await Customer.findOne({});
    if (!customer) {
      await Customer.create({
        customerName: 'John Smith',
        company: 'Apex Global Imports Inc',
        country: 'United States',
        gst: 'N/A',
        email: 'john@apexglobal.com',
        phone: '+1 415 555 0199',
        address: {
          street: '500 Market Street, Suite 400',
          city: 'San Francisco',
          state: 'CA',
          country: 'United States',
          postalCode: '94105',
        },
        notifyParty: 'Apex Logistics LLC, San Francisco',
        paymentTerms: 'LC at Sight',
        currency: 'USD',
        createdBy: admin._id,
      });
      console.log('✅ Sample Customer Created');
    }

    let product = await Product.findOne({});
    if (!product) {
      await Product.create({
        productName: 'Organic Premium Basmati Rice (1121 XL)',
        hsn: '10063020',
        category: 'Agro Commodities',
        description: 'Extra Long Grain Organic Rice, 8.35mm average grain length',
        unit: 'KGS',
        weight: 1.0,
        grossWeight: 1.02,
        packing: '25 KG Non-Woven Poly Bags',
        defaultRate: 1.45,
        currency: 'USD',
        createdBy: admin._id,
      });
      console.log('✅ Sample Product Created');
    }

    console.log('✨ All Seed Data Inserted Successfully!');
  } catch (err) {
    console.error('❌ Seeding Error:', err);
  }
};

if (require.main === module) {
  seedData().then(() => mongoose.disconnect());
}

module.exports = seedData;
