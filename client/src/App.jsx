import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PublicMenu from './pages/PublicMenu';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminRoute from './components/SuperAdminRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/menu/:slug" element={<PublicMenu />} />
      <Route path="/checkout/:slug" element={<Checkout />} />
      <Route path="/order-success/:id" element={<OrderSuccess />} />
      <Route 
        path="/admin/*" 
        element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} 
      />
      <Route path="/superadmin-login" element={<SuperAdminLogin />} />
      <Route 
        path="/superadmin/*" 
        element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} 
      />
    </Routes>
  );
}

export default App;
