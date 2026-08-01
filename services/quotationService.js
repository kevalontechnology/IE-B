const quotationRepo = require('../repositories/quotationRepo');
const shipmentRepo = require('../repositories/shipmentRepo');
const Notification = require('../models/Notification');
const { createAuditLog } = require('../middleware/auditMiddleware');
const HTTP_STATUS = require('../constants/httpStatusCodes');
const { ROLES } = require('../constants/roles');

class QuotationService {
  async createQuotation(data, req) {
    const existing = await quotationRepo.findByNumber(data.quotationNumber);
    if (existing) {
      const error = new Error(`Quotation number '${data.quotationNumber}' already exists.`);
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    const quotation = await quotationRepo.create({
      ...data,
      createdBy: req.user._id,
    });

    await createAuditLog(req, {
      action: 'CREATE_QUOTATION',
      module: 'QUOTATION',
      description: `Created quotation #${quotation.quotationNumber} for ${quotation.customerName}`,
      recordId: quotation._id.toString(),
    });

    return quotation;
  }

  async updateQuotation(id, data, req) {
    const quote = await quotationRepo.findById(id);
    if (!quote) {
      const error = new Error('Quotation not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Sales can only edit own quotation
    if (req.user.role === ROLES.SALES && quote.createdBy._id.toString() !== req.user._id.toString()) {
      const error = new Error('You can only edit your own quotations.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    const updated = await quotationRepo.update(id, data);

    await createAuditLog(req, {
      action: 'UPDATE_QUOTATION',
      module: 'QUOTATION',
      description: `Updated quotation #${updated.quotationNumber}`,
      recordId: updated._id.toString(),
    });

    return updated;
  }

  async updateStatus(id, status, req) {
    const quote = await quotationRepo.findById(id);
    if (!quote) {
      const error = new Error('Quotation not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    quote.status = status;
    await quote.save();

    if (status === 'Approved') {
      await Notification.create({
        recipient: quote.createdBy._id,
        type: 'QUOTATION_APPROVED',
        title: 'Quotation Approved',
        message: `Quotation #${quote.quotationNumber} for ${quote.customerName} has been approved. You can now convert it to a Shipment.`,
        link: `/quotations/${quote._id}`,
      });
    }

    await createAuditLog(req, {
      action: 'UPDATE_QUOTATION_STATUS',
      module: 'QUOTATION',
      description: `Updated status of #${quote.quotationNumber} to ${status}`,
      recordId: quote._id.toString(),
    });

    return quote;
  }

  async convertToShipment(id, shipmentData, req) {
    const quote = await quotationRepo.findById(id);
    if (!quote) {
      const error = new Error('Quotation not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    if (quote.status !== 'Approved') {
      const error = new Error('Only Approved quotations can be converted to Shipment.');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    // Check unique invoice number & container number
    const existingInvoice = await shipmentRepo.findByInvoiceNumber(shipmentData.invoiceNumber);
    if (existingInvoice) {
      const error = new Error(`Invoice number '${shipmentData.invoiceNumber}' already exists.`);
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    const existingContainer = await shipmentRepo.findByContainerNumber(shipmentData.shippingDetails.containerNumber);
    if (existingContainer) {
      const error = new Error(`Container number '${shipmentData.shippingDetails.containerNumber}' already exists.`);
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    const newShipment = await shipmentRepo.create({
      ...shipmentData,
      quotation: quote._id,
      customer: quote.customer._id || quote.customer,
      createdBy: req.user._id,
    });

    quote.status = 'Converted';
    quote.convertedToShipmentId = newShipment._id;
    await quote.save();

    // Broadcast notification
    await Notification.create({
      recipient: null,
      targetRole: ROLES.ADMIN,
      type: 'SHIPMENT_CREATED',
      title: 'Quotation Converted to Shipment',
      message: `Quotation #${quote.quotationNumber} converted to Shipment Invoice #${newShipment.invoiceNumber}`,
      link: `/shipments/${newShipment._id}`,
    });

    await createAuditLog(req, {
      action: 'CONVERT_QUOTATION_TO_SHIPMENT',
      module: 'QUOTATION',
      description: `Converted quotation #${quote.quotationNumber} to Shipment Invoice #${newShipment.invoiceNumber}`,
      recordId: newShipment._id.toString(),
    });

    return newShipment;
  }

  async getQuotations(query) {
    return await quotationRepo.findAll(query);
  }

  async getQuotationById(id) {
    const quote = await quotationRepo.findById(id);
    if (!quote) {
      const error = new Error('Quotation not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    return quote;
  }

  async deleteQuotation(id, req) {
    const quote = await quotationRepo.softDelete(id, req.user._id);
    if (!quote) {
      const error = new Error('Quotation not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    await createAuditLog(req, {
      action: 'DELETE_QUOTATION',
      module: 'QUOTATION',
      description: `Soft deleted quotation #${quote.quotationNumber}`,
      recordId: quote._id.toString(),
    });

    return quote;
  }
}

module.exports = new QuotationService();
