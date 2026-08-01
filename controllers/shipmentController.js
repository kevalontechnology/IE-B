const shipmentService = require('../services/shipmentService');
const { sendSuccess } = require('../utils/responseFormatter');
const HTTP_STATUS = require('../constants/httpStatusCodes');

class ShipmentController {
  async create(req, res, next) {
    try {
      const shipment = await shipmentService.createShipment(req.body, req);
      return sendSuccess(res, 'Shipment created successfully.', shipment, null, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await shipmentService.getShipments(req.query);
      return sendSuccess(res, 'Shipments fetched successfully.', result.shipments, {
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
      const shipment = await shipmentService.getShipmentById(req.params.id);
      return sendSuccess(res, 'Shipment details fetched.', shipment);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await shipmentService.updateShipment(req.params.id, req.body, req);
      return sendSuccess(res, 'Shipment updated successfully.', updated);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await shipmentService.deleteShipment(req.params.id, req);
      return sendSuccess(res, 'Shipment soft deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ShipmentController();
