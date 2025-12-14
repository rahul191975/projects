const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');

// Configure multer for file uploads
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadBookCover = upload.single('coverImage');

exports.resizeBookCover = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `book-${req.params.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/books/${req.file.filename}`);

  next();
});

exports.getAllBooks = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  let query = Book.find(JSON.parse(queryStr));

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Execute query
  const books = await query;

  res.status(200).json({
    status: 'success',
    results: books.length,
    data: {
      books
    }
  });
});

exports.getBook = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id).populate('addedBy');

  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      book
    }
  });
});

exports.createBook = catchAsync(async (req, res, next) => {
  // Add cover image if uploaded
  if (req.file) req.body.coverImage = req.file.filename;

  const newBook = await Book.create({
    ...req.body,
    addedBy: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: {
      book: newBook
    }
  });
});

exports.updateBook = catchAsync(async (req, res, next) => {
  // Add cover image if uploaded
  if (req.file) req.body.coverImage = req.file.filename;

  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      book
    }
  });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.searchBooks = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  const books = await Book.find({
    $text: { $search: query }
  }, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' }
  }).limit(20);

  res.status(200).json({
    status: 'success',
    results: books.length,
    data: {
      books
    }
  });
});

exports.getBookAvailability = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  // Check if book is available
  const isAvailable = book.availableCopies > 0;

  // Get active transactions for this book
  const activeTransactions = await Transaction.find({
    book: book._id,
    status: { $in: ['active', 'overdue'] }
  }).populate('member', 'name email membershipId');

  res.status(200).json({
    status: 'success',
    data: {
      book,
      isAvailable,
      activeTransactions
    }
  });
});
