const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { updateStatusSchema } = require('../validators/authValidators');
const { ROLES } = require('../constants/roles');

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/', (req, res, next) => userController.getUsers(req, res, next));
router.patch('/:id/status', validate(updateStatusSchema), (req, res, next) => userController.updateStatus(req, res, next));

module.exports = router;
