import React from 'react';
import { Navigate } from 'react-router-dom';

function isTokenValid(key) {
  const token = localStorage.getItem(key);
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds; Date.now() is in ms
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

const ProtectedRoute = ({ children }) => {
  if (!isTokenValid('token')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
