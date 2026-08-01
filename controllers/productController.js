const productService = require('../services/productService');
const { sendSuccess } = require('../utils/responseFormatter');
const HTTP_STATUS = require('../constants/httpStatusCodes');

class ProductController {
  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body, req);
      return sendSuccess(res, 'Product created successfully.', product, null, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await productService.getProducts(req.query);
      return sendSuccess(res, 'Products fetched successfully.', result.products, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      return sendSuccess(res, 'Product details fetched.', product);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await productService.updateProduct(req.params.id, req.body, req);
      return sendSuccess(res, 'Product updated successfully.', updated);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id, req);
      return sendSuccess(res, 'Product soft deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductController();
