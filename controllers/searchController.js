const searchService = require('../services/searchService');
const { sendSuccess } = require('../utils/responseFormatter');

class SearchController {
  async search(req, res, next) {
    try {
      const { q } = req.query;
      const results = await searchService.globalSearch(q);
      return sendSuccess(res, 'Global search completed.', results);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SearchController();
