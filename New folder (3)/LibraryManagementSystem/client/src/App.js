import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import './App.css';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Books from './components/books/Books';
import BookDetail from './components/books/BookDetail';
import AddBook from './components/books/AddBook';
import Members from './components/members/Members';
import MemberDetail from './components/members/MemberDetail';
import Transactions from './components/transactions/Transactions';
import Payments from './components/payments/Payments';
import Reports from './components/reports/Reports';
import AdminDashboard from './components/admin/AdminDashboard';
import Profile from './components/user/Profile';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import LibrarianRoute from './components/auth/LibrarianRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get('/api/auth/me');
          setUser(res.data.data.user);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar user={user} onLogout={handleLogout} />

      <Container className="main-content mt-4 mb-4">
        <Routes>
          <Route path="/" element={<Home user={user} />} />

          {/* Auth routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />

          {/* Public routes */}
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute user={user} />}>
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/my-transactions" element={<Transactions user={user} />} />
            <Route path="/my-payments" element={<Payments user={user} />} />

            {/* Librarian routes */}
            <Route element={<LibrarianRoute user={user} />}>
              <Route path="/members" element={<Members />} />
              <Route path="/members/:id" element={<MemberDetail />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/books/add" element={<AddBook />} />
              <Route path="/books/:id/edit" element={<AddBook />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute user={user} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>

      <Footer />
    </div>
  );
}

export default App;
