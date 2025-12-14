const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: [
      'daily_transactions', 'monthly_transactions', 'overdue_books',
      'popular_books', 'membership_status', 'financial_summary',
      'inventory_status', 'custom_report'
    ],
    required: [true, 'Please specify report type']
  },
  generatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Report must have a generator']
  },
  startDate: Date,
  endDate: Date,
  data: mongoose.Schema.Types.Mixed,
  fileUrl: String,
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
