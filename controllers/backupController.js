const backupService = require('../services/backupService');
const { sendSuccess } = require('../utils/responseFormatter');

class BackupController {
  async exportBackup(req, res, next) {
    try {
      const snapshot = await backupService.exportDatabaseSnapshot(req);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=export_crm_backup_${Date.now()}.json`);
      return res.json(snapshot);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BackupController();
