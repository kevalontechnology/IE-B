const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { shipmentSchema } = require('../validators/shipmentValidators');
const { ROLES } = require('../constants/roles');

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.SUPERVISOR));

router.get('/', (req, res, next) => shipmentController.getAll(req, res, next));
router.get('/:id', (req, res, next) => shipmentController.getById(req, res, next));
router.post('/', validate(shipmentSchema), (req, res, next) => shipmentController.create(req, res, next));
router.put('/:id', validate(shipmentSchema), (req, res, next) => shipmentController.update(req, res, next));
router.delete('/:id', authorize(ROLES.ADMIN), (req, res, next) => shipmentController.delete(req, res, next));

module.exports = router;
