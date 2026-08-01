const Document = require('../models/Document');

class DocumentRepository {
  async create(data) {
    return await Document.create(data);
  }

  async findByShipmentAndType(shipmentId, docType) {
    return await Document.find({ shipment: shipmentId, docType }).sort({ version: -1 });
  }

  async findLatestVersion(shipmentId, docType) {
    return await Document.findOne({ shipment: shipmentId, docType }).sort({ version: -1 });
  }

  async findAll({ page = 1, limit = 10, search = '', docType, shipmentId }) {
    const query = {};
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
      ];
    }
    if (docType) query.docType = docType;
    if (shipmentId) query.shipment = shipmentId;

    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('shipment', 'invoiceNumber customerDetails')
        .populate('generatedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Document.countDocuments(query),
    ]);

    return { documents, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new DocumentRepository();
