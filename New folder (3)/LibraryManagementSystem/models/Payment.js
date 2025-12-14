const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Payment must belong to a user']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'stripe'],
    required: [true, 'Please specify payment method']
  },
  paymentType: {
    type: String,
    enum: ['membership_fee', 'fine', 'book_purchase', 'donation', 'other'],
    required: [true, 'Please specify payment type']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  stripePaymentIntentId: String,
  receiptUrl: String,
  notes: String,
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
