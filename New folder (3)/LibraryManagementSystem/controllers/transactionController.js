const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createTransaction = catchAsync(async (req, res, next) => {
  const { bookId, memberId, transactionType, dueDate, notes } = req.body;

  // Find book and member
  const book = await Book.findById(bookId);
  const member = await User.findById(memberId);

  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  if (!member) {
    return next(new AppError('No member found with that ID', 404));
  }

  // Check if book is available for borrowing
  if (transactionType === 'borrow' && book.availableCopies <= 0) {
    return next(new AppError('This book is currently not available', 400));
  }

  // Create transaction
  const transaction = await Transaction.create({
    book: bookId,
    member: memberId,
    transactionType,
    dueDate: transactionType === 'borrow' ? dueDate : undefined,
    notes,
    processedBy: req.user._id
  });

  // Update book availability
  if (transactionType === 'borrow') {
    book.availableCopies -= 1;
    await book.save({ validateBeforeSave: false });
  }

  res.status(201).json({
    status: 'success',
    data: {
      transaction
    }
  });
});

exports.getAllTransactions = catchAsync(async (req, res, next) => {
  // Build query based on user role
  let query;

  if (req.user.role === 'admin' || req.user.role === 'librarian') {
    // Admins and librarians can see all transactions
    query = Transaction.find();
  } else {
    // Members can only see their own transactions
    query = Transaction.find({ member: req.user._id });
  }

  // Filtering
  if (req.query.status) {
    query = query.find({ status: req.query.status });
  }

  if (req.query.transactionType) {
    query = query.find({ transactionType: req.query.transactionType });
  }

  // Sorting
  if (req.query.sort) {
    query = query.sort(req.query.sort);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Execute query with population
  const transactions = await query
    .populate('book', 'title author isbn coverImage')
    .populate('member', 'name email membershipId')
    .populate('processedBy', 'name email');

  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: {
      transactions
    }
  });
});

exports.getTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('book', 'title author isbn coverImage')
    .populate('member', 'name email membershipId phone')
    .populate('processedBy', 'name email');

  if (!transaction) {
    return next(new AppError('No transaction found with that ID', 404));
  }

  // Check if user has permission to view this transaction
  if (req.user.role !== 'admin' && req.user.role !== 'librarian' && transaction.member._id.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to view this transaction', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      transaction
    }
  });
});

exports.updateTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(new AppError('No transaction found with that ID', 404));
  }

  // Check if transaction is being returned
  if (req.body.transactionType === 'return' && transaction.transactionType === 'borrow') {
    // Update book availability
    const book = await Book.findById(transaction.book);
    if (book) {
      book.availableCopies += 1;
      await book.save({ validateBeforeSave: false });
    }

    // Calculate fine if overdue
    if (transaction.dueDate && new Date() > new Date(transaction.dueDate)) {
      const fineAmount = transaction.calculateFine();
      transaction.fineAmount = fineAmount;
    }

    transaction.status = 'completed';
    transaction.returnDate = new Date();
    transaction.transactionType = 'return';
  }

  // Update other fields
  if (req.body.status) transaction.status = req.body.status;
  if (req.body.notes) transaction.notes = req.body.notes;
  if (req.body.finePaid) transaction.finePaid = req.body.finePaid;

  await transaction.save();

  res.status(200).json({
    status: 'success',
    data: {
      transaction
    }
  });
});

exports.getMemberTransactions = catchAsync(async (req, res, next) => {
  const memberId = req.params.memberId;

  // Check if user has permission to view this member's transactions
  if (req.user.role !== 'admin' && req.user.role !== 'librarian' && memberId !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to view this member\'s transactions', 403));
  }

  const transactions = await Transaction.find({ member: memberId })
    .populate('book', 'title author isbn coverImage')
    .populate('processedBy', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: {
      transactions
    }
  });
});

exports.getOverdueTransactions = catchAsync(async (req, res, next) => {
  // Only admins and librarians can access this
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const currentDate = new Date();

  const overdueTransactions = await Transaction.find({
    status: 'active',
    dueDate: { $lt: currentDate },
    transactionType: 'borrow'
  })
  .populate('book', 'title author isbn')
  .populate('member', 'name email membershipId phone');

  res.status(200).json({
    status: 'success',
    results: overdueTransactions.length,
    data: {
      overdueTransactions
    }
  });
});
