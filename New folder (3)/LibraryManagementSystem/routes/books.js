const express = require('express');
const bookController = require('../controllers/bookController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBook);
router.get('/:id/availability', bookController.getBookAvailability);

// Protected routes (require authentication)
router.use(authController.protect);

// Librarian and admin only routes
router.use(authController.restrictTo('librarian', 'admin'));

router.post(
  '/',
  bookController.uploadBookCover,
  bookController.resizeBookCover,
  bookController.createBook
);

router.patch(
  '/:id',
  bookController.uploadBookCover,
  bookController.resizeBookCover,
  bookController.updateBook
);

router.delete('/:id', bookController.deleteBook);

module.exports = router;
