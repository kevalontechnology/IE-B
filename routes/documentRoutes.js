const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

router.post('/generate', (req, res, next) => documentController.generate(req, res, next));
router.get('/history', (req, res, next) => documentController.getHistory(req, res, next));
router.get('/', (req, res, next) => documentController.getAll(req, res, next));

module.exports = router;
