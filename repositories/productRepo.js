const Product = require('../models/Product');

class ProductRepository {
  async create(data) {
    return await Product.create(data);
  }

  async findById(id) {
    return await Product.findById(id).populate('createdBy', 'fullName email');
  }

  async findByHsnOrName(hsn, name) {
    return await Product.findOne({ $or: [{ hsn }, { productName: name }] });
  }

  async update(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  async softDelete(id, userId) {
    const product = await Product.findById(id);
    if (!product) return null;
    return await product.softDelete(userId);
  }

  async findAll({ page = 1, limit = 10, search = '', category, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const query = {};
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { hsn: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      Product.find(query).populate('createdBy', 'fullName email').sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return { products, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new ProductRepository();
