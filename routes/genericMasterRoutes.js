const express = require('express');
const router = express.Router({ mergeParams: true });
const genericMasterController = require('../controllers/genericMasterController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

// Read-only endpoint available to Admin, Supervisor, Sales
router.get('/:type', (req, res, next) => genericMasterController.getAll(req, res, next));
router.get('/:type/:id', (req, res, next) => genericMasterController.getById(req, res, next));

// Mutation endpoints restricted to Admin ONLY
router.post('/:type', authorize(ROLES.ADMIN), (req, res, next) => genericMasterController.create(req, res, next));
router.put('/:type/:id', authorize(ROLES.ADMIN), (req, res, next) => genericMasterController.update(req, res, next));
router.patch('/:type/:id/toggle-status', authorize(ROLES.ADMIN), (req, res, next) => genericMasterController.toggleStatus(req, res, next));
router.delete('/:type/:id', authorize(ROLES.ADMIN), (req, res, next) => genericMasterController.delete(req, res, next));
router.post('/:type/:id/restore', authorize(ROLES.ADMIN), (req, res, next) => genericMasterController.restore(req, res, next));

module.exports = router;
