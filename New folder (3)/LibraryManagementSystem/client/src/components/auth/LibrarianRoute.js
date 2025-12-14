import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const LibrarianRoute = ({ user, children }) => {
  if (!user || (user.role !== 'librarian' && user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default LibrarianRoute;
