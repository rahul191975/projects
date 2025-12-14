const express = require('express');
const reportController = require('../controllers/reportController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protected routes (require authentication)
router.use(authController.protect);

// Admin and librarian only routes
router.use(authController.restrictTo('admin', 'librarian'));

router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReport);
router.get('/:id/pdf', reportController.generatePDFReport);

router.get('/daily-transactions', reportController.generateDailyTransactionsReport);
router.get('/monthly-transactions', reportController.generateMonthlyTransactionsReport);
router.get('/overdue-books', reportController.generateOverdueBooksReport);
router.get('/popular-books', reportController.generatePopularBooksReport);
router.get('/financial-summary', reportController.generateFinancialSummaryReport);

module.exports = router;
