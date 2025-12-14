import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({ user, children }) => {
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
