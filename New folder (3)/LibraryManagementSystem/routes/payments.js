const express = require('express');
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protected routes (require authentication)
router.use(authController.protect);

router.get('/my-payments', paymentController.getAllPayments);
router.get('/stats', authController.restrictTo('admin', 'librarian'), paymentController.getPaymentStats);

// Admin and librarian only routes
router.use(authController.restrictTo('admin', 'librarian'));

router.post('/', paymentController.createPayment);
router.post('/create-payment-intent', paymentController.createStripePaymentIntent);
router.post('/confirm-stripe-payment', paymentController.confirmStripePayment);
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPayment);

module.exports = router;
