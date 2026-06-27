import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PublicMenu from './pages/PublicMenu';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminRoute from './components/SuperAdminRoute';
import DemoMenu from './pages/DemoMenu';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/menu/:slug" element={<PublicMenu />} />
      <Route path="/checkout/:slug" element={<Checkout />} />
      <Route path="/order-success/:id" element={<OrderSuccess />} />
      <Route path="/demo" element={<DemoMenu />} />
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
