const Quotation = require('../models/Quotation');

class QuotationRepository {
  async create(data) {
    return await Quotation.create(data);
  }

  async findById(id) {
    return await Quotation.findById(id)
      .populate('customer')
      .populate('createdBy', 'fullName email role');
  }

  async findByNumber(quotationNumber) {
    return await Quotation.findOne({ quotationNumber });
  }

  async update(id, data) {
    return await Quotation.findByIdAndUpdate(id, data, { new: true });
  }

  async softDelete(id, userId) {
    const quote = await Quotation.findById(id);
    if (!quote) return null;
    return await quote.softDelete(userId);
  }

  async findAll({ page = 1, limit = 10, search = '', status, customerId, createdBy, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const query = {};
    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (customerId) query.customer = customerId;
    if (createdBy) query.createdBy = createdBy;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [quotations, total] = await Promise.all([
      Quotation.find(query)
        .populate('customer', 'customerName company country')
        .populate('createdBy', 'fullName email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Quotation.countDocuments(query),
    ]);

    return { quotations, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new QuotationRepository();
