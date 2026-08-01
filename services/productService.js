const productRepo = require('../repositories/productRepo');
const { createAuditLog } = require('../middleware/auditMiddleware');
const HTTP_STATUS = require('../constants/httpStatusCodes');

class ProductService {
  async createProduct(data, req) {
    const existing = await productRepo.findByHsnOrName(data.hsn, data.productName);
    if (existing) {
      const error = new Error(`Product with name '${data.productName}' or HSN '${data.hsn}' already exists.`);
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    const product = await productRepo.create({
      ...data,
      createdBy: req.user._id,
    });

    await createAuditLog(req, {
      action: 'CREATE_PRODUCT',
      module: 'PRODUCT',
      description: `Created product '${product.productName}' (HSN: ${product.hsn})`,
      recordId: product._id.toString(),
    });

    return product;
  }

  async updateProduct(id, data, req) {
    const product = await productRepo.findById(id);
    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    const updated = await productRepo.update(id, data);

    await createAuditLog(req, {
      action: 'UPDATE_PRODUCT',
      module: 'PRODUCT',
      description: `Updated product '${updated.productName}'`,
      recordId: updated._id.toString(),
    });

    return updated;
  }

  async deleteProduct(id, req) {
    const product = await productRepo.softDelete(id, req.user._id);
    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    await createAuditLog(req, {
      action: 'DELETE_PRODUCT',
      module: 'PRODUCT',
      description: `Soft deleted product '${product.productName}'`,
      recordId: product._id.toString(),
    });

    return product;
  }

  async getProducts(query) {
    return await productRepo.findAll(query);
  }

  async getProductById(id) {
    const product = await productRepo.findById(id);
    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    return product;
  }
}

module.exports = new ProductService();
