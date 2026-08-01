const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { quotationSchema } = require('../validators/quotationValidators');
const { shipmentSchema } = require('../validators/shipmentValidators');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

router.get('/', (req, res, next) => quotationController.getAll(req, res, next));
router.get('/:id', (req, res, next) => quotationController.getById(req, res, next));
router.post('/', validate(quotationSchema), (req, res, next) => quotationController.create(req, res, next));
router.put('/:id', validate(quotationSchema), (req, res, next) => quotationController.update(req, res, next));
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.SUPERVISOR), (req, res, next) => quotationController.updateStatus(req, res, next));
router.post('/:id/convert-to-shipment', validate(shipmentSchema), (req, res, next) => quotationController.convertToShipment(req, res, next));
router.delete('/:id', authorize(ROLES.ADMIN), (req, res, next) => quotationController.delete(req, res, next));

module.exports = router;
