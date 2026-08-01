const User = require('../models/User');

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findById(id) {
    return await User.findById(id).select('-password');
  }

  async create(userData) {
    return await User.create(userData);
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  }

  async findAll({ page = 1, limit = 10, search = '', role, status, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort(sort).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    return { users, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new UserRepository();
