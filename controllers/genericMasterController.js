const genericMasterService = require('../services/GenericMasterService');
const { sendSuccess } = require('../utils/responseFormatter');
const HTTP_STATUS = require('../constants/httpStatusCodes');

class GenericMasterController {
  async getAll(req, res, next) {
    try {
      const { type } = req.params;
      const result = await genericMasterService.getAll(type, req.query);
      return sendSuccess(res, `${result.config.displayName} fetched.`, result.items, {
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
      const { type, id } = req.params;
      const item = await genericMasterService.getById(type, id);
      return sendSuccess(res, 'Record fetched.', item);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { type } = req.params;
      const record = await genericMasterService.create(type, req.body, req);
      return sendSuccess(res, 'Record created successfully.', record, null, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { type, id } = req.params;
      const updated = await genericMasterService.update(type, id, req.body, req);
      return sendSuccess(res, 'Record updated successfully.', updated);
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req, res, next) {
    try {
      const { type, id } = req.params;
      const updated = await genericMasterService.toggleStatus(type, id, req);
      return sendSuccess(res, `Status updated to ${updated.status}.`, updated);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { type, id } = req.params;
      await genericMasterService.softDelete(type, id, req);
      return sendSuccess(res, 'Record soft deleted successfully.');
    } catch (err) {
      next(err);
    }
  }

  async restore(req, res, next) {
    try {
      const { type, id } = req.params;
      const restored = await genericMasterService.restore(type, id, req);
      return sendSuccess(res, 'Record restored successfully.', restored);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GenericMasterController();
