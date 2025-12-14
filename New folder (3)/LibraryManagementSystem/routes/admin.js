const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protected routes (require authentication)
router.use(authController.protect);

// Admin only routes
router.use(authController.restrictTo('admin'));

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/system-settings', adminController.getSystemSettings);
router.patch('/system-settings', adminController.updateSystemSettings);
router.post('/users', adminController.createAdminUser);
router.get('/users', adminController.getAllAdminUsers);
router.get('/audit-log', adminController.getAuditLog);
router.post('/database-backup', adminController.getDatabaseBackup);

module.exports = router;
