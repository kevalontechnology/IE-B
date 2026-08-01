const customerRepo = require('../repositories/customerRepo');
const { createAuditLog } = require('../middleware/auditMiddleware');
const HTTP_STATUS = require('../constants/httpStatusCodes');

class CustomerService {
  async createCustomer(data, req) {
    // Check duplicate detection
    const existing = await customerRepo.findByEmailOrName(data.email, data.customerName);
    if (existing) {
      const error = new Error(`Customer with name '${data.customerName}' or email '${data.email}' already exists.`);
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    const customer = await customerRepo.create({
      ...data,
      createdBy: req.user._id,
    });

    await createAuditLog(req, {
      action: 'CREATE_CUSTOMER',
      module: 'CUSTOMER',
      description: `Created customer '${customer.customerName}' (${customer.company})`,
      recordId: customer._id.toString(),
    });

    return customer;
  }

  async updateCustomer(id, data, req) {
    const customer = await customerRepo.findById(id);
    if (!customer) {
      const error = new Error('Customer not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    const updated = await customerRepo.update(id, data);

    await createAuditLog(req, {
      action: 'UPDATE_CUSTOMER',
      module: 'CUSTOMER',
      description: `Updated customer '${updated.customerName}'`,
      recordId: updated._id.toString(),
    });

    return updated;
  }

  async deleteCustomer(id, req) {
    const customer = await customerRepo.softDelete(id, req.user._id);
    if (!customer) {
      const error = new Error('Customer not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    await createAuditLog(req, {
      action: 'DELETE_CUSTOMER',
      module: 'CUSTOMER',
      description: `Soft deleted customer '${customer.customerName}'`,
      recordId: customer._id.toString(),
    });

    return customer;
  }

  async getCustomers(query) {
    return await customerRepo.findAll(query);
  }

  async getCustomerById(id) {
    const customer = await customerRepo.findById(id);
    if (!customer) {
      const error = new Error('Customer not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    return customer;
  }
}

module.exports = new CustomerService();
