const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { customerSchema } = require('../validators/customerValidators');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

router.get('/', (req, res, next) => customerController.getAll(req, res, next));
router.get('/:id', (req, res, next) => customerController.getById(req, res, next));
router.post('/', validate(customerSchema), (req, res, next) => customerController.create(req, res, next));
router.put('/:id', validate(customerSchema), (req, res, next) => customerController.update(req, res, next));
router.delete('/:id', authorize(ROLES.ADMIN), (req, res, next) => customerController.delete(req, res, next));

module.exports = router;
