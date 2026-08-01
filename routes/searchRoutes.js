const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', (req, res, next) => searchController.search(req, res, next));

module.exports = router;
