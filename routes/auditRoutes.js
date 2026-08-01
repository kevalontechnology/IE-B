const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/logs', (req, res, next) => auditController.getAuditLogs(req, res, next));
router.get('/logins', (req, res, next) => auditController.getLoginHistory(req, res, next));

module.exports = router;
