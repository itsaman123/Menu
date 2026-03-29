import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Grid, Stack } from '@mui/material';
import { Restaurant, AppRegistration } from '@mui/icons-material';
import api from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    slug: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        {/* Left Side: Illustration / Info */}
        <Grid item xs={false} md={7} sx={{ position: 'relative', display: { xs: 'none', md: 'block' }, overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1500&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', '&::before': { content: '""', position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(1px)' } }} />
          <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 8, color: 'white' }}>
            <Typography variant="h2" fontWeight="900" gutterBottom sx={{ textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
              Get Started with <br /> QR-Menu.
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: 500, lineHeight: 1.6 }}>
              Join thousands of restaurants that have modernized their dining experience. Registration takes less than 2 minutes.
            </Typography>
          </Box>
        </Grid>

        {/* Right Side: Form */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
          <Paper elevation={0} sx={{ p: 5, width: '100%', maxWidth: 450, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <Stack spacing={1} sx={{ mb: 4, alignItems: 'center' }}>
              <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderRadius: 3, color: 'white', mb: 1 }}>
                <Restaurant fontSize="large" />
              </Box>
              <Typography variant="h4" fontWeight="900" color="text.primary">Join Now</Typography>
              <Typography variant="body2" color="text.secondary">Create your restaurant's digital presence</Typography>
            </Stack>

            <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
              <TextField
                margin="dense"
                required
                fullWidth
                label="Restaurant Name"
                name="restaurantName"
                autoFocus
                value={formData.restaurantName}
                onChange={handleChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                margin="dense"
                required
                fullWidth
                label="URL Slug (e.g. delicious-cafe)"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                 margin="dense"
                 required
                 fullWidth
                 label="Email Address"
                 name="email"
                 type="email"
                 value={formData.email}
                 onChange={handleChange}
                 sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                margin="dense"
                required
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              {error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<AppRegistration />}
                sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 3, fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 8px 16px rgba(255, 87, 34, 0.3)' }}
              >
                Create My Account
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link to="/login" style={{ textDecoration: 'none', color: '#FF5722', fontWeight: 'bold' }}>
                    Sign In instead
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register;
