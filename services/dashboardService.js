const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Quotation = require('../models/Quotation');
const Shipment = require('../models/Shipment');
const Document = require('../models/Document');
const { USER_STATUS, ROLES } = require('../constants/roles');

class DashboardService {
  async getAdminStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      pendingUsersCount,
      totalCustomers,
      totalProducts,
      todaysShipmentsCount,
      revenueResult,
      recentQuotations,
      recentShipments,
      pendingDocumentsCount,
      quotationStatusCounts,
    ] = await Promise.all([
      User.countDocuments({ status: USER_STATUS.PENDING }),
      Customer.countDocuments({}),
      Product.countDocuments({}),
      Shipment.countDocuments({ createdAt: { $gte: today } }),
      Shipment.aggregate([
        { $match: { isDeleted: false, status: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: null,
            totalUSD: { $sum: '$financials.grandTotal' },
            totalINR: { $sum: '$financials.grandTotalINR' },
          },
        },
      ]),
      Quotation.find({}).sort({ createdAt: -1 }).limit(5).populate('customer', 'customerName company'),
      Shipment.find({}).sort({ createdAt: -1 }).limit(5).populate('customer', 'customerName company'),
      Shipment.countDocuments({ documentsGenerated: false }),
      Quotation.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenueUSD = revenueResult.length > 0 ? revenueResult[0].totalUSD : 0;
    const totalRevenueINR = revenueResult.length > 0 ? revenueResult[0].totalINR : 0;

    return {
      pendingUsersCount,
      totalCustomers,
      totalProducts,
      todaysShipmentsCount,
      totalRevenueUSD,
      totalRevenueINR,
      recentQuotations,
      recentShipments,
      pendingDocumentsCount,
      quotationStatusCounts,
    };
  }

  async getSupervisorStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todaysShipmentsCount,
      pendingShipmentsCount,
      completedShipmentsCount,
      recentShipments,
    ] = await Promise.all([
      Shipment.countDocuments({ createdAt: { $gte: today } }),
      Shipment.countDocuments({ status: 'Pending Logistics' }),
      Shipment.countDocuments({ status: 'Completed' }),
      Shipment.find({}).sort({ createdAt: -1 }).limit(8),
    ]);

    return {
      todaysShipmentsCount,
      pendingShipmentsCount,
      completedShipmentsCount,
      recentShipments,
    };
  }

  async getSalesStats(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todaysQuotationsCount,
      pendingQuotationsCount,
      approvedQuotationsCount,
      convertedQuotationsCount,
      myRecentQuotations,
    ] = await Promise.all([
      Quotation.countDocuments({ createdBy: userId, createdAt: { $gte: today } }),
      Quotation.countDocuments({ createdBy: userId, status: 'Pending' }),
      Quotation.countDocuments({ createdBy: userId, status: 'Approved' }),
      Quotation.countDocuments({ createdBy: userId, status: 'Converted' }),
      Quotation.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(8),
    ]);

    return {
      todaysQuotationsCount,
      pendingQuotationsCount,
      approvedQuotationsCount,
      convertedQuotationsCount,
      myRecentQuotations,
    };
  }
}

module.exports = new DashboardService();
