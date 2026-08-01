const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

router.get('/company', (req, res, next) => masterController.getCompany(req, res, next));
router.put('/company', authorize(ROLES.ADMIN), (req, res, next) => masterController.updateCompany(req, res, next));

router.get('/factories', (req, res, next) => masterController.getFactories(req, res, next));
router.post('/factories', authorize(ROLES.ADMIN, ROLES.SUPERVISOR), (req, res, next) => masterController.createFactory(req, res, next));

router.get('/shipping-lines', (req, res, next) => masterController.getShippingLines(req, res, next));
router.post('/shipping-lines', authorize(ROLES.ADMIN, ROLES.SUPERVISOR), (req, res, next) => masterController.createShippingLine(req, res, next));

router.get('/ports', (req, res, next) => masterController.getPorts(req, res, next));
router.post('/ports', authorize(ROLES.ADMIN, ROLES.SUPERVISOR), (req, res, next) => masterController.createPort(req, res, next));

router.get('/countries', (req, res, next) => masterController.getCountries(req, res, next));
router.get('/currencies', (req, res, next) => masterController.getCurrencies(req, res, next));

module.exports = router;
