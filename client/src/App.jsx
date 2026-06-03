import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
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
import { useAppTheme, useTokens } from './ThemeContext';

const ThemeToggleButton = () => {
  const { isDark, toggle } = useAppTheme();
  const T = useTokens();
  return (
    <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} placement="left">
      <IconButton
        onClick={toggle}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: 46,
          height: 46,
          borderRadius: '16px',
          background: T.cartBg,
          color: '#fff',
          boxShadow: T.cartGlow,
          border: 'none',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            transform: 'scale(1.08) rotate(15deg)',
            boxShadow: isDark
              ? '0 6px 28px rgba(198,191,255,0.4)'
              : '0 6px 28px rgba(83,65,205,0.35)',
          },
          '&:active': { transform: 'scale(0.96)' },
        }}
      >
        {isDark
          ? <LightMode sx={{ fontSize: 20 }} />
          : <DarkMode sx={{ fontSize: 20 }} />
        }
      </IconButton>
    </Tooltip>
  );
};

function App() {
  return (
    <>
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
      <ThemeToggleButton />
    </>
  );
}

export default App;
