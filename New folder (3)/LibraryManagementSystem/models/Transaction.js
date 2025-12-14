const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: [true, 'Transaction must belong to a book']
  },
  member: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Transaction must belong to a member']
  },
  transactionType: {
    type: String,
    enum: ['borrow', 'return', 'renew', 'reserve', 'purchase'],
    required: [true, 'Please specify transaction type']
  },
  dueDate: Date,
  returnDate: Date,
  issueDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'overdue', 'cancelled'],
    default: 'active'
  },
  fineAmount: {
    type: Number,
    default: 0
  },
  finePaid: {
    type: Boolean,
    default: false
  },
  renewedCount: {
    type: Number,
    default: 0
  },
  notes: String,
  processedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate fine amount based on overdue days
transactionSchema.methods.calculateFine = function() {
  if (this.status === 'completed' || !this.dueDate) return 0;

  const currentDate = new Date();
  const dueDate = new Date(this.dueDate);

  if (currentDate > dueDate) {
    const daysOverdue = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24));
    return daysOverdue * 1; // $1 per day fine
  }

  return 0;
};

module.exports = mongoose.model('Transaction', transactionSchema);
