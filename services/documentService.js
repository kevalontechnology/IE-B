const fs = require('fs');
const path = require('path');
const shipmentRepo = require('../repositories/shipmentRepo');
const documentRepo = require('../repositories/documentRepo');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const pdfEngine = require('../utils/pdfEngine');
const { createAuditLog } = require('../middleware/auditMiddleware');
const HTTP_STATUS = require('../constants/httpStatusCodes');

class DocumentService {
  async generateDocument(shipmentId, docType, req) {
    const shipment = await shipmentRepo.findById(shipmentId);
    if (!shipment) {
      const error = new Error('Shipment not found.');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    const company = await Company.findOne({});

    // Determine version number
    const latestDoc = await documentRepo.findLatestVersion(shipmentId, docType);
    const version = latestDoc ? latestDoc.version + 1 : 1;

    const sanitizedType = docType.toLowerCase().replace(/ /g, '_');
    const fileName = `${sanitizedType}_v${version}_${shipment.invoiceNumber}.pdf`;
    const uploadsDir = path.join(__dirname, '../uploads/documents');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);

    // Generate PDF stream and save file
    const docStream = pdfEngine.generatePDFStream(docType, shipment, company);
    const writeStream = fs.createWriteStream(filePath);
    docStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const stats = fs.statSync(filePath);

    const documentRecord = await documentRepo.create({
      shipment: shipment._id,
      invoiceNumber: shipment.invoiceNumber,
      docType,
      version,
      fileName,
      filePath: `/uploads/documents/${fileName}`,
      fileSize: stats.size,
      generatedBy: req.user._id,
    });

    shipment.documentsGenerated = true;
    await shipment.save();

    await createAuditLog(req, {
      action: 'GENERATE_PDF',
      module: 'DOCUMENT',
      description: `Generated ${docType} v${version} for Invoice #${shipment.invoiceNumber}`,
      recordId: documentRecord._id.toString(),
    });

    return documentRecord;
  }

  async getDocumentHistory(shipmentId, docType) {
    return await documentRepo.findByShipmentAndType(shipmentId, docType);
  }

  async getDocuments(query) {
    return await documentRepo.findAll(query);
  }
}

module.exports = new DocumentService();
