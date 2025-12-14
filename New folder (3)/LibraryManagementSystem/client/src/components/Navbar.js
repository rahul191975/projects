import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaBook, FaUser, FaSignInAlt, FaSignOutAlt, FaHome, FaUsers, FaExchangeAlt, FaCreditCard, FaChartBar } from 'react-icons/fa';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar expand="lg" className="navbar">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          <FaBook className="me-2" /> Library Management System
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              <FaHome className="me-1" /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/books">
              <FaBook className="me-1" /> Books
            </Nav.Link>

            {user && (
              <>
                <Nav.Link as={Link} to="/profile">
                  <FaUser className="me-1" /> Profile
                </Nav.Link>

                {(user.role === 'admin' || user.role === 'librarian') && (
                  <>
                    <Nav.Link as={Link} to="/members">
                      <FaUsers className="me-1" /> Members
                    </Nav.Link>
                    <Nav.Link as={Link} to="/transactions">
                      <FaExchangeAlt className="me-1" /> Transactions
                    </Nav.Link>
                    <Nav.Link as={Link} to="/payments">
                      <FaCreditCard className="me-1" /> Payments
                    </Nav.Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Nav.Link as={Link} to="/admin">
                      <FaChartBar className="me-1" /> Admin Dashboard
                    </Nav.Link>
                    <Nav.Link as={Link} to="/reports">
                      <FaChartBar className="me-1" /> Reports
                    </Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>

          <Nav>
            {user ? (
              <>
                <span className="navbar-text me-3">Welcome, {user.name}</span>
                <Button variant="outline-light" onClick={handleLogout}>
                  <FaSignOutAlt className="me-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <FaSignInAlt className="me-1" /> Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <FaUser className="me-1" /> Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
