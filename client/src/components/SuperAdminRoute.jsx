import React from 'react';
import { Navigate } from 'react-router-dom';

const SuperAdminRoute = ({ children }) => {
  const token = localStorage.getItem('saToken');

  if (!token) {
    return <Navigate to="/superadmin-login" replace />;
  }

  return children;
};

export default SuperAdminRoute;
