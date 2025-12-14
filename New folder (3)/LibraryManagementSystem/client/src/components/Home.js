import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaBook, FaUsers, FaExchangeAlt, FaChartBar, FaSearch, FaUserPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Home = ({ user }) => {
  return (
    <Container className="home-page">
      <header className="text-center py-5">
        <h1 className="display-4 mb-3">Welcome to Library Management System</h1>
        <p className="lead mb-4">A professional solution for modern library management</p>

        {!user && (
          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/login" variant="primary" size="lg">
              <FaSignInAlt className="me-2" /> Login
            </Button>
            <Button as={Link} to="/register" variant="outline-primary" size="lg">
              <FaUserPlus className="me-2" /> Register
            </Button>
          </div>
        )}
      </header>

      <section className="features py-5">
        <h2 className="text-center mb-5">Our Features</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 feature-card">
              <Card.Body className="text-center">
                <div className="feature-icon mb-4">
                  <FaBook size={50} className="text-primary" />
                </div>
                <Card.Title>Comprehensive Book Management</Card.Title>
                <Card.Text>
                  Easily manage your entire book collection with advanced search, categorization,
                  and inventory tracking features.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 feature-card">
              <Card.Body className="text-center">
                <div className="feature-icon mb-4">
                  <FaUsers size={50} className="text-success" />
                </div>
                <Card.Title>Member Management</Card.Title>
                <Card.Text>
                  Streamline member registration, track membership status, and manage
                  member profiles with our intuitive interface.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 feature-card">
              <Card.Body className="text-center">
                <div className="feature-icon mb-4">
                  <FaExchangeAlt size={50} className="text-info" />
                </div>
                <Card.Title>Transaction Tracking</Card.Title>
                <Card.Text>
                  Monitor all book borrowings, returns, and renewals with real-time
                  tracking and automated notifications.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mt-4">
          <Col md={6}>
            <Card className="h-100 feature-card">
              <Card.Body className="text-center">
                <div className="feature-icon mb-4">
                  <FaChartBar size={50} className="text-warning" />
                </div>
                <Card.Title>Advanced Reporting</Card.Title>
                <Card.Text>
                  Generate comprehensive reports on library usage, popular books,
                  overdue items, and financial performance.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="h-100 feature-card">
              <Card.Body className="text-center">
                <div className="feature-icon mb-4">
                  <FaSearch size={50} className="text-danger" />
                </div>
                <Card.Title>Powerful Search</Card.Title>
                <Card.Text>
                  Find books quickly with our advanced search functionality including
                  title, author, ISBN, and full-text search capabilities.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      {user && (
        <section className="quick-actions py-5">
          <h2 className="text-center mb-5">Quick Actions</h2>
          <Row className="g-4">
            <Col md={3}>
              <Card className="text-center quick-action-card">
                <Card.Body>
                  <FaBook size={40} className="mb-3 text-primary" />
                  <Card.Title>Browse Books</Card.Title>
                  <Button as={Link} to="/books" variant="primary">View All Books</Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="text-center quick-action-card">
                <Card.Body>
                  <FaUsers size={40} className="mb-3 text-success" />
                  <Card.Title>Member Management</Card.Title>
                  <Button as={Link} to="/members" variant="success" disabled={user.role !== 'admin' && user.role !== 'librarian'}>
                    Manage Members
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="text-center quick-action-card">
                <Card.Body>
                  <FaExchangeAlt size={40} className="mb-3 text-info" />
                  <Card.Title>Transactions</Card.Title>
                  <Button as={Link} to="/transactions" variant="info" disabled={user.role !== 'admin' && user.role !== 'librarian'}>
                    View Transactions
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="text-center quick-action-card">
                <Card.Body>
                  <FaChartBar size={40} className="mb-3 text-warning" />
                  <Card.Title>Reports</Card.Title>
                  <Button as={Link} to="/reports" variant="warning" disabled={user.role !== 'admin'}>
                    Generate Reports
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>
      )}

      <section className="about py-5 bg-light">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h2>About Our System</h2>
              <p className="lead">
                Our Library Management System is designed to help libraries of all sizes
                manage their operations efficiently and professionally.
              </p>
              <p>
                With features like comprehensive book management, member tracking,
                transaction processing, and advanced reporting, our system provides
                everything you need to run a modern library.
              </p>
              <p>
                Whether you're a small community library or a large academic institution,
                our solution scales to meet your needs.
              </p>
            </Col>
            <Col md={6}>
              <Card className="stats-card">
                <Card.Body>
                  <Card.Title>System Statistics</Card.Title>
                  <Row className="text-center">
                    <Col xs={6} className="border-end">
                      <h3>100+</h3>
                      <p>Libraries Using</p>
                    </Col>
                    <Col xs={6}>
                      <h3>500K+</h3>
                      <p>Books Managed</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </Container>
  );
};

export default Home;
