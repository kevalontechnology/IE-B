const customerService = require('../services/customerService');
const { sendSuccess } = require('../utils/responseFormatter');
const HTTP_STATUS = require('../constants/httpStatusCodes');

class CustomerController {
  async create(req, res, next) {
    try {
      const customer = await customerService.createCustomer(req.body, req);
      return sendSuccess(res, 'Customer created successfully.', customer, null, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await customerService.getCustomers(req.query);
      return sendSuccess(res, 'Customers fetched successfully.', result.customers, {
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
      const customer = await customerService.getCustomerById(req.params.id);
      return sendSuccess(res, 'Customer details fetched.', customer);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await customerService.updateCustomer(req.params.id, req.body, req);
      return sendSuccess(res, 'Customer updated successfully.', updated);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await customerService.deleteCustomer(req.params.id, req);
      return sendSuccess(res, 'Customer soft deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CustomerController();
