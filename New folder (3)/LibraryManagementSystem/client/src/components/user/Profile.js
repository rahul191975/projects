import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendarAlt, FaBook, FaEdit, FaSave } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/members/me');
        setProfile(res.data.data.member);
        setFormData({
          name: res.data.data.member.name,
          phone: res.data.data.member.phone || '',
          address: res.data.data.member.address || {}
        });
      } catch (err) {
        setError('Failed to fetch profile data');
        toast.error('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.patch('/members/update-me', formData);
      toast.success('Profile updated successfully!');
      setEditMode(false);
      // Refresh profile data
      const res = await axios.get('/api/members/me');
      setProfile(res.data.data.member);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading profile...</p>
      </Container>
    );
  }

  if (error && !profile) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="profile-page py-4">
      <Row>
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="profile-avatar mb-3">
                {profile?.profileImage ? (
                  <img
                    src={`/uploads/${profile.profileImage}`}
                    alt="Profile"
                    className="rounded-circle"
                    width={150}
                    height={150}
                  />
                ) : (
                  <div className="avatar-placeholder rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 150, height: 150 }}>
                    <FaUser size={60} />
                  </div>
                )}
              </div>
              <h3>{profile?.name}</h3>
              <p className="text-muted">{profile?.email}</p>

              <div className="profile-stats mt-4">
                <Row className="text-center">
                  <Col xs={6} className="border-end">
                    <h4>{profile?.statistics?.activeTransactions || 0}</h4>
                    <p className="text-muted small">Active Loans</p>
                  </Col>
                  <Col xs={6}>
                    <h4>{profile?.statistics?.totalTransactions || 0}</h4>
                    <p className="text-muted small">Total Transactions</p>
                  </Col>
                </Row>
              </div>

              {profile?.membershipId && (
                <div className="membership-info mt-4">
                  <h5>Membership Information</h5>
                  <p><FaIdCard className="me-2" /> ID: {profile.membershipId}</p>
                  <p>
                    <FaCalendarAlt className="me-2" /> Status:
                    <span className={`badge ms-2 ${profile.membershipStatus === 'active' ? 'bg-success' :
                                      profile.membershipStatus === 'expired' ? 'bg-danger' :
                                      'bg-warning'}`}>
                      {profile.membershipStatus}
                    </span>
                  </p>
                  {profile.membershipExpiry && (
                    <p><FaCalendarAlt className="me-2" /> Expires: {new Date(profile.membershipExpiry).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Profile Information</h4>
              {editMode ? (
                <Button variant="outline-secondary" onClick={() => setEditMode(false)} disabled={loading}>
                  Cancel
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setEditMode(true)}>
                  <FaEdit className="me-2" /> Edit Profile
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    disabled={!editMode}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={profile?.email || ''}
                    disabled
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Street</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.street"
                        value={formData.address?.street || ''}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.city"
                        value={formData.address?.city || ''}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.state"
                        value={formData.address?.state || ''}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Zip Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.zipCode"
                        value={formData.address?.zipCode || ''}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {editMode && (
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" /> Save Changes
                      </>
                    )}
                  </Button>
                )}
              </Form>
            </Card.Body>
          </Card>

          {profile?.transactions && profile.transactions.length > 0 && (
            <Card className="mt-4">
              <Card.Header>
                <h4 className="mb-0">Recent Transactions</h4>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.transactions.slice(0, 5).map(transaction => (
                        <tr key={transaction._id}>
                          <td>{transaction.book?.title || 'N/A'}</td>
                          <td>
                            <span className="badge bg-info">
                              {transaction.transactionType}
                            </span>
                          </td>
                          <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${transaction.status === 'completed' ? 'bg-success' :
                                              transaction.status === 'overdue' ? 'bg-danger' :
                                              'bg-warning'}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td>
                            {transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-center mt-3">
                  <Button variant="outline-primary" as={Link} to="/my-transactions">
                    View All Transactions
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
