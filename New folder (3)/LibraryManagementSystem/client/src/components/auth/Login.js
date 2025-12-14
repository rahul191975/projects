import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user } = res.data.data;

      onLogin(user, token);
      toast.success('Login successful! Welcome back.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-container">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow">
            <Card.Body>
              <div className="text-center mb-4">
                <FaSignInAlt size={50} className="text-primary" />
                <h3 className="mt-2">Sign In</h3>
                <p className="text-muted">Access your library account</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={onSubmit}>
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
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <FaLock className="me-2" /> Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Enter your password"
                    required
                    minLength={8}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Don't have an account? <a href="/register">Register here</a>
                  </p>
                  <p className="text-muted mb-0">
                    <a href="/forgot-password">Forgot password?</a>
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

export default Login;
