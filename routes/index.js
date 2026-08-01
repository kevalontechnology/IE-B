const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const customerRoutes = require('./customerRoutes');
const productRoutes = require('./productRoutes');
const quotationRoutes = require('./quotationRoutes');
const shipmentRoutes = require('./shipmentRoutes');
const documentRoutes = require('./documentRoutes');
const masterRoutes = require('./masterRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const searchRoutes = require('./searchRoutes');
const backupRoutes = require('./backupRoutes');
const auditRoutes = require('./auditRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/quotations', quotationRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/documents', documentRoutes);
router.use('/masters', masterRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/search', searchRoutes);
router.use('/backup', backupRoutes);
router.use('/audit', auditRoutes);

module.exports = router;
