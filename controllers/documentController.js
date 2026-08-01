const documentService = require('../services/documentService');
const { sendSuccess } = require('../utils/responseFormatter');
const HTTP_STATUS = require('../constants/httpStatusCodes');

class DocumentController {
  async generate(req, res, next) {
    try {
      const { shipmentId, docType } = req.body;
      const documentRecord = await documentService.generateDocument(shipmentId, docType, req);
      return sendSuccess(
        res,
        `${docType} generated successfully (v${documentRecord.version}).`,
        documentRecord,
        null,
        HTTP_STATUS.CREATED
      );
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const { shipmentId, docType } = req.query;
      const history = await documentService.getDocumentHistory(shipmentId, docType);
      return sendSuccess(res, 'Document version history fetched.', history);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await documentService.getDocuments(req.query);
      return sendSuccess(res, 'Documents fetched successfully.', result.documents, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DocumentController();
