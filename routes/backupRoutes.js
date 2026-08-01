const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/export', (req, res, next) => backupController.exportBackup(req, res, next));

module.exports = router;
