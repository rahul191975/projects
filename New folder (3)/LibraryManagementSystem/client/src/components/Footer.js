import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <h5>Library Management System</h5>
            <p>A professional library management solution for modern libraries.</p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white">Home</a></li>
              <li><a href="/books" className="text-white">Books</a></li>
              <li><a href="/about" className="text-white">About</a></li>
              <li><a href="/contact" className="text-white">Contact</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <address>
              123 Library Street<br />
              Book City, BC 12345<br />
              <i className="fas fa-phone"></i> (555) 123-4567<br />
              <i className="fas fa-envelope"></i> info@library.com
            </address>
          </Col>
        </Row>
        <hr className="bg-light" />
        <Row>
          <Col className="text-center">
            <p className="mb-0">&copy; {currentYear} Library Management System. All rights reserved.</p>
            <p className="mb-0 small">Designed and developed for professional library management</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
