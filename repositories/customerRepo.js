const Customer = require('../models/Customer');

class CustomerRepository {
  async create(data) {
    return await Customer.create(data);
  }

  async findById(id) {
    return await Customer.findById(id).populate('createdBy', 'fullName email');
  }

  async findByEmailOrName(email, name) {
    return await Customer.findOne({ $or: [{ email }, { customerName: name }] });
  }

  async update(id, data) {
    return await Customer.findByIdAndUpdate(id, data, { new: true });
  }

  async softDelete(id, userId) {
    const customer = await Customer.findById(id);
    if (!customer) return null;
    return await customer.softDelete(userId);
  }

  async findAll({ page = 1, limit = 10, search = '', country, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const query = {};
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (country) query.country = country;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [customers, total] = await Promise.all([
      Customer.find(query).populate('createdBy', 'fullName email').sort(sort).skip(skip).limit(Number(limit)),
      Customer.countDocuments(query),
    ]);

    return { customers, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new CustomerRepository();
