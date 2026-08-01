const shipmentRepo = require('../repositories/shipmentRepo');
const Notification = require('../models/Notification');
const { createAuditLog } = require('../middleware/auditMiddleware');
const HTTP_STATUS = require('../constants/httpStatusCodes');
const { ROLES } = require('../constants/roles');

class ShipmentService {
  async createShipment(data, req) {
    // Unique Invoice Number Validation
    const existingInvoice = await shipmentRepo.findByInvoiceNumber(data.invoiceNumber);
    if (existingInvoice) {
      const error = new Error(`Invoice Number '${data.invoiceNumber}' already exists.`);
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    // Unique Container Number Validation
    const existingContainer = await shipmentRepo.findByContainerNumber(data.shippingDetails.containerNumber);
    if (existingContainer) {
      const error = new Error(`Container Number '${data.shippingDetails.containerNumber}' already exists.`);
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    const shipment = await shipmentRepo.create({
      ...data,
      createdBy: req.user._id,
    });

    await Notification.create({
      recipient: null,
      targetRole: ROLES.ADMIN,
      type: 'SHIPMENT_CREATED',
      title: 'New Shipment Created',
      message: `Shipment Invoice #${shipment.invoiceNumber} created for ${shipment.customerDetails.customerName}`,
      link: `/shipments/${shipment._id}`,
    });

    await createAuditLog(req, {
      action: 'CREATE_SHIPMENT',
      module: 'SHIPMENT',
      description: `Created Shipment Invoice #${shipment.invoiceNumber} (Container: ${shipment.shippingDetails.containerNumber})`,
      recordId: shipment._id.toString(),
    });

    return shipment;
  }

  async updateShipment(id, data, req) {
    const shipment = await shipmentRepo.findById(id);
    if (!shipment) {
      const error = new Error('Shipment not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    const updated = await shipmentRepo.update(id, data);

    await createAuditLog(req, {
      action: 'UPDATE_SHIPMENT',
      module: 'SHIPMENT',
      description: `Updated Shipment Invoice #${updated.invoiceNumber}`,
      recordId: updated._id.toString(),
    });

    return updated;
  }

  async getShipments(query) {
    return await shipmentRepo.findAll(query);
  }

  async getShipmentById(id) {
    const shipment = await shipmentRepo.findById(id);
    if (!shipment) {
      const error = new Error('Shipment not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    return shipment;
  }

  async deleteShipment(id, req) {
    const shipment = await shipmentRepo.softDelete(id, req.user._id);
    if (!shipment) {
      const error = new Error('Shipment not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    await createAuditLog(req, {
      action: 'DELETE_SHIPMENT',
      module: 'SHIPMENT',
      description: `Soft deleted Shipment Invoice #${shipment.invoiceNumber}`,
      recordId: shipment._id.toString(),
    });

    return shipment;
  }
}

module.exports = new ShipmentService();
