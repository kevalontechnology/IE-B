const masterService = require('../services/masterService');
const { sendSuccess } = require('../utils/responseFormatter');

class MasterController {
  // Company
  async getCompany(req, res, next) {
    try {
      const company = await masterService.getCompany();
      return sendSuccess(res, 'Company details fetched.', company);
    } catch (err) {
      next(err);
    }
  }

  async updateCompany(req, res, next) {
    try {
      const updated = await masterService.updateCompany(req.body, req);
      return sendSuccess(res, 'Company Master updated successfully.', updated);
    } catch (err) {
      next(err);
    }
  }

  // Factories
  async getFactories(req, res, next) {
    try {
      const factories = await masterService.getFactories();
      return sendSuccess(res, 'Factories fetched.', factories);
    } catch (err) {
      next(err);
    }
  }

  async createFactory(req, res, next) {
    try {
      const factory = await masterService.createFactory(req.body, req);
      return sendSuccess(res, 'Factory created.', factory);
    } catch (err) {
      next(err);
    }
  }

  // Shipping Lines
  async getShippingLines(req, res, next) {
    try {
      const lines = await masterService.getShippingLines();
      return sendSuccess(res, 'Shipping lines fetched.', lines);
    } catch (err) {
      next(err);
    }
  }

  async createShippingLine(req, res, next) {
    try {
      const line = await masterService.createShippingLine(req.body, req);
      return sendSuccess(res, 'Shipping line created.', line);
    } catch (err) {
      next(err);
    }
  }

  // Ports
  async getPorts(req, res, next) {
    try {
      const ports = await masterService.getPorts();
      return sendSuccess(res, 'Ports fetched.', ports);
    } catch (err) {
      next(err);
    }
  }

  async createPort(req, res, next) {
    try {
      const port = await masterService.createPort(req.body, req);
      return sendSuccess(res, 'Port created.', port);
    } catch (err) {
      next(err);
    }
  }

  // Countries & Currencies
  async getCountries(req, res, next) {
    try {
      const countries = await masterService.getCountries();
      return sendSuccess(res, 'Countries fetched.', countries);
    } catch (err) {
      next(err);
    }
  }

  async getCurrencies(req, res, next) {
    try {
      const currencies = await masterService.getCurrencies();
      return sendSuccess(res, 'Currencies fetched.', currencies);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MasterController();
