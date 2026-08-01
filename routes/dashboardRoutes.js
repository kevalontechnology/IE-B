const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/stats', (req, res, next) => dashboardController.getDashboardStats(req, res, next));

module.exports = router;
