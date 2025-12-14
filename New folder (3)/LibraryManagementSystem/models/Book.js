const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide book title'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Please provide author name'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'Please provide ISBN'],
    unique: true,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  publicationYear: {
    type: Number,
    min: 1000,
    max: new Date().getFullYear()
  },
  genre: [{
    type: String,
    enum: [
      'Fiction', 'Non-Fiction', 'Science', 'History', 'Biography',
      'Technology', 'Business', 'Self-Help', 'Fantasy', 'Mystery',
      'Romance', 'Horror', 'Children', 'Poetry', 'Drama', 'Other'
    ]
  }],
  description: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    default: 'English'
  },
  totalCopies: {
    type: Number,
    required: [true, 'Please provide total copies'],
    min: 0
  },
  availableCopies: {
    type: Number,
    required: [true, 'Please provide available copies'],
    min: 0
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  coverImage: {
    type: String,
    default: 'default-book-cover.jpg'
  },
  location: {
    shelf: String,
    aisle: String,
    floor: String
  },
  edition: String,
  pages: Number,
  format: {
    type: String,
    enum: ['Hardcover', 'Paperback', 'E-book', 'Audiobook'],
    default: 'Paperback'
  },
  tags: [String],
  addedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better search performance
bookSchema.index({ title: 'text', author: 'text', isbn: 'text', genre: 'text' });

module.exports = mongoose.model('Book', bookSchema);
