import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaBook, FaSearch, FaPlus, FaEye } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/books');
        setBooks(res.data.data.books);
        setFilteredBooks(res.data.data.books);
      } catch (err) {
        setError('Failed to fetch books. Please try again later.');
        toast.error('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    const query = searchQuery.toLowerCase();
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.isbn.includes(query) ||
      (book.genre && book.genre.some(g => g.toLowerCase().includes(query)))
    );
    setFilteredBooks(filtered);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading books...</p>
      </Container>
    );
  }

  if (error && books.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="books-page py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-3"><FaBook className="me-2" /> Library Books</h2>
          <p className="lead">Browse our collection of books</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSearch} className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Search books by title, author, ISBN, or genre..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-grow-1"
                />
                <Button variant="primary" type="submit">
                  <FaSearch className="me-2" /> Search
                </Button>
                <Button variant="outline-secondary" onClick={() => {
                  setSearchQuery('');
                  setFilteredBooks(books);
                }}>
                  Reset
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {filteredBooks.length === 0 ? (
        <Alert variant="info" className="text-center">
          No books found matching your search criteria.
        </Alert>
      ) : (
        <Row className="g-4">
          {filteredBooks.map(book => (
            <Col key={book._id} md={6} lg={4} xl={3}>
              <Card className="h-100 book-card">
                <div className="book-cover-container">
                  {book.coverImage ? (
                    <Card.Img
                      variant="top"
                      src={`/uploads/${book.coverImage}`}
                      alt={book.title}
                      className="book-cover"
                    />
                  ) : (
                    <div className="book-cover-placeholder d-flex align-items-center justify-content-center">
                      <FaBook size={40} className="text-muted" />
                    </div>
                  )}
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-truncate">{book.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{book.author}</Card.Subtitle>
                  <Card.Text className="flex-grow-1">
                    <small>ISBN: {book.isbn}</small><br />
                    <small>Genre: {book.genre?.join(', ') || 'Not specified'}</small><br />
                    <small>Available: {book.availableCopies} of {book.totalCopies}</small>
                  </Card.Text>
                  <div className="d-flex gap-2">
                    <Button
                      as={Link}
                      to={`/books/${book._id}`}
                      variant="outline-primary"
                      size="sm"
                      className="flex-grow-1"
                    >
                      <FaEye className="me-1" /> View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Books;
