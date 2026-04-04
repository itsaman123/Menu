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
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'var(--cc-surface-container-low)', position: 'relative', overflow: 'hidden' }} className="page-enter">
      {/* Background Bubbles */}
      {[...Array(8)].map((_, i) => (
        <Box key={i} className="bubble" sx={{
          width: Math.random() * 120 + 40,
          height: Math.random() * 120 + 40,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${Math.random() * 6 + 6}s infinite ease-in-out`,
        }} />
      ))}

      <Grid container sx={{ flexGrow: 1, zIndex: 1 }}>
        {/* Left: Form */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, md: 6 } }}>
          <Paper elevation={0} sx={{
            p: 5, width: '100%', maxWidth: 450, borderRadius: 'var(--radius-2xl)',
            bgcolor: 'var(--cc-surface-container-lowest)',
            boxShadow: 'var(--shadow-ambient)',
          }}>
            <Stack spacing={1} sx={{ mb: 4, alignItems: 'center' }}>
              <Box sx={{ background: 'linear-gradient(135deg, #5341cd, #6C5CE7)', p: 1.5, borderRadius: 'var(--radius-lg)', color: 'white', mb: 1 }}>
                <Restaurant fontSize="large" />
              </Box>
              <Typography variant="h4" fontWeight="800">Welcome Back</Typography>
              <Typography variant="body2" color="text.secondary">Manage your digital menu with ease</Typography>
            </Stack>

            <Box component="form" onSubmit={handleLogin}>
              <TextField margin="normal" required fullWidth label="Email Address" autoComplete="email" autoFocus
                value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField margin="normal" required fullWidth label="Password" type="password" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}
              <Button type="submit" fullWidth variant="contained" startIcon={<LoginIcon />}
                sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '0.95rem' }}>
                Sign In
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link to="/register" style={{ textDecoration: 'none', color: '#5341cd', fontWeight: 'bold' }}>Sign Up Now</Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right: Hero Image */}
        <Grid item xs={false} md={7} sx={{ position: 'relative', display: { xs: 'none', md: 'block' }, overflow: 'hidden' }}>
          <Box sx={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1500&q=80")',
            backgroundSize: 'cover', backgroundPosition: 'center',
            '&::before': { content: '""', position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(83,65,205,0.6), rgba(108,92,231,0.4))', backdropFilter: 'blur(2px)' }
          }} />
          <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 8, color: 'white' }}>
            <Typography variant="h2" gutterBottom sx={{ textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              Modernize Your <br /> Restaurant.
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: 500, lineHeight: 1.7, fontWeight: 400 }}>
              The all-in-one platform for QR menus, real-time ordering, and digitalized restaurant management.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
