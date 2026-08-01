const Shipment = require('../models/Shipment');

class ShipmentRepository {
  async create(data) {
    return await Shipment.create(data);
  }

  async findById(id) {
    return await Shipment.findById(id)
      .populate('customer')
      .populate('quotation')
      .populate('shippingDetails.factory')
      .populate('createdBy', 'fullName email role');
  }

  async findByInvoiceNumber(invoiceNumber) {
    return await Shipment.findOne({ invoiceNumber });
  }

  async findByContainerNumber(containerNumber) {
    return await Shipment.findOne({ 'shippingDetails.containerNumber': containerNumber });
  }

  async update(id, data) {
    return await Shipment.findByIdAndUpdate(id, data, { new: true });
  }

  async softDelete(id, userId) {
    const shipment = await Shipment.findById(id);
    if (!shipment) return null;
    return await shipment.softDelete(userId);
  }

  async findAll({ page = 1, limit = 10, search = '', status, customerId, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const query = {};
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'shippingDetails.containerNumber': { $regex: search, $options: 'i' } },
        { 'customerDetails.customerName': { $regex: search, $options: 'i' } },
        { 'customerDetails.company': { $regex: search, $options: 'i' } },
        { 'shippingDetails.blNumber': { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (customerId) query.customer = customerId;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [shipments, total] = await Promise.all([
      Shipment.find(query)
        .populate('customer', 'customerName company country')
        .populate('createdBy', 'fullName email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Shipment.countDocuments(query),
    ]);

    return { shipments, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new ShipmentRepository();
