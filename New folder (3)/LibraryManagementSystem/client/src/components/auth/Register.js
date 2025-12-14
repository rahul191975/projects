import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { FaUserPlus, FaEnvelope, FaLock, FaUser, FaPhone } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    role: 'member'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, email, password, passwordConfirm, phone, role } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/auth/signup', {
        name,
        email,
        password,
        phone,
        role
      });

      const { token, user } = res.data.data;

      onLogin(user, token);
      toast.success('Registration successful! Welcome to the library.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-container">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body>
              <div className="text-center mb-4">
                <FaUserPlus size={50} className="text-primary" />
                <h3 className="mt-2">Create Account</h3>
                <p className="text-muted">Join our library management system</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={onSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaUser className="me-2" /> Full Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={name}
                        onChange={onChange}
                        placeholder="Enter your full name"
                        required
                        autoFocus
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaEnvelope className="me-2" /> Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="Enter your email"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaLock className="me-2" /> Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Enter password (min 8 characters)"
                        required
                        minLength={8}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaLock className="me-2" /> Confirm Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="passwordConfirm"
                        value={passwordConfirm}
                        onChange={onChange}
                        placeholder="Confirm your password"
                        required
                        minLength={8}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaPhone className="me-2" /> Phone Number
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={phone}
                        onChange={onChange}
                        placeholder="Enter your phone number"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Account Type</Form.Label>
                      <Form.Select
                        name="role"
                        value={role}
                        onChange={onChange}
                        disabled
                      >
                        <option value="member">Member</option>
                        <option value="librarian">Librarian (Admin approval required)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registering...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Already have an account? <a href="/login">Sign in here</a>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
