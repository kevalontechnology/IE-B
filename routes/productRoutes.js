const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { productSchema } = require('../validators/productValidators');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

router.get('/', (req, res, next) => productController.getAll(req, res, next));
router.get('/:id', (req, res, next) => productController.getById(req, res, next));
router.post('/', authorize(ROLES.ADMIN, ROLES.SUPERVISOR), validate(productSchema), (req, res, next) => productController.create(req, res, next));
router.put('/:id', authorize(ROLES.ADMIN, ROLES.SUPERVISOR), validate(productSchema), (req, res, next) => productController.update(req, res, next));
router.delete('/:id', authorize(ROLES.ADMIN), (req, res, next) => productController.delete(req, res, next));

module.exports = router;
