import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="not-found-page text-center py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="error-icon mb-4">
            <FaExclamationTriangle size={80} className="text-warning" />
          </div>
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-3">Page Not Found</h2>
          <p className="lead mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button as={Link} to="/" variant="primary" size="lg">
            <FaHome className="me-2" /> Return to Home
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
