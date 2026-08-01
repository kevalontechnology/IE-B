const quotationService = require('../services/quotationService');
const { sendSuccess } = require('../utils/responseFormatter');
const HTTP_STATUS = require('../constants/httpStatusCodes');

const { ROLES } = require('../constants/roles');

class QuotationController {
  async create(req, res, next) {
    try {
      const quotation = await quotationService.createQuotation(req.body, req);
      return sendSuccess(res, 'Quotation created successfully.', quotation, null, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const query = { ...req.query };
      if (req.user.role === ROLES.SALES) {
        query.createdBy = req.user._id;
      }
      const result = await quotationService.getQuotations(query);
      return sendSuccess(res, 'Quotations fetched successfully.', result.quotations, {
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
      const quote = await quotationService.getQuotationById(req.params.id);
      return sendSuccess(res, 'Quotation details fetched.', quote);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await quotationService.updateQuotation(req.params.id, req.body, req);
      return sendSuccess(res, 'Quotation updated successfully.', updated);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const updated = await quotationService.updateStatus(req.params.id, req.body.status, req);
      return sendSuccess(res, `Quotation status updated to ${req.body.status}.`, updated);
    } catch (err) {
      next(err);
    }
  }

  async convertToShipment(req, res, next) {
    try {
      const shipment = await quotationService.convertToShipment(req.params.id, req.body, req);
      return sendSuccess(res, 'Quotation successfully converted into Shipment.', shipment, null, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await quotationService.deleteQuotation(req.params.id, req);
      return sendSuccess(res, 'Quotation soft deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new QuotationController();
