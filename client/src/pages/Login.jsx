import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Grid, Stack } from '@mui/material';
import { Restaurant, Login as LoginIcon } from '@mui/icons-material';
import api from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f0f2f5', position: 'relative', overflow: 'hidden' }}>
      {/* Background Animated Bubbles */}
      {[...Array(10)].map((_, i) => (
        <Box
          key={i}
          className="bubble"
          sx={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 5 + 5}s infinite ease-in-out`,
            bgcolor: 'primary.light',
            opacity: 0.1
          }}
        />
      ))}

      <Grid container sx={{ flexGrow: 1, zIndex: 1 }}>
        {/* Left Side: Form */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
          <Paper elevation={0} sx={{ p: 5, width: '100%', maxWidth: 450, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <Stack spacing={1} sx={{ mb: 4, alignItems: 'center' }}>
              <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderRadius: 3, color: 'white', mb: 1 }}>
                <Restaurant fontSize="large" />
              </Box>
              <Typography variant="h4" fontWeight="900" color="text.primary">Welcome Back</Typography>
              <Typography variant="body2" color="text.secondary">Manage your digital menu with ease</Typography>
            </Stack>

            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              {error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<LoginIcon />}
                sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 3, fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 8px 16px rgba(255, 87, 34, 0.3)' }}
              >
                Sign In
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link to="/register" style={{ textDecoration: 'none', color: '#FF5722', fontWeight: 'bold' }}>
                    Sign Up Now
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Side: Image/Branding */}
        <Grid item xs={false} md={7} sx={{ position: 'relative', display: { xs: 'none', md: 'block' }, overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1500&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', '&::before': { content: '""', position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' } }} />
          <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 8, color: 'white' }}>
            <Typography variant="h2" fontWeight="900" gutterBottom sx={{ textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
              Modernize Your <br /> Restaurant.
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: 500, lineHeight: 1.6 }}>
              The all-in-one platform for QR menus, real-time ordering, and digitalized restaurant management.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
