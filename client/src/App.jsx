import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
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
import { useAppTheme } from './ThemeContext';

const ThemeToggleButton = () => {
  const { isDark, toggle } = useAppTheme();
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
          borderRadius: '14px',
          background: isDark
            ? 'linear-gradient(135deg, #7c6ef0, #a78bfa)'
            : 'linear-gradient(135deg, #6c5ce7, #8b80f0)',
          color: '#fff',
          boxShadow: isDark
            ? '0 4px 20px rgba(124,110,240,0.5)'
            : '0 4px 20px rgba(108,92,231,0.4)',
          border: 'none',
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            transform: 'scale(1.08) rotate(15deg)',
            boxShadow: isDark
              ? '0 6px 28px rgba(124,110,240,0.7)'
              : '0 6px 28px rgba(108,92,231,0.6)',
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
      <ThemeToggleButton />
    </>
  );
}

export default App;
