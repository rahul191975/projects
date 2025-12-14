const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protected routes (require authentication)
router.use(authController.protect);

router.get('/my-transactions', transactionController.getMemberTransactions);
router.get('/overdue', authController.restrictTo('librarian', 'admin'), transactionController.getOverdueTransactions);

// Librarian and admin only routes
router.use(authController.restrictTo('librarian', 'admin'));

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getAllTransactions);
router.get('/:id', transactionController.getTransaction);
router.patch('/:id', transactionController.updateTransaction);
router.get('/members/:memberId', transactionController.getMemberTransactions);

module.exports = router;
