import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Box, Button, TextField, Typography, Stack, Grid } from '@mui/material';
import { FoodBank, AppRegistration } from '@mui/icons-material';
import api from '../api';

const T = {
  bg: '#0f1117', surface: '#16191f', border: 'rgba(255,255,255,0.07)',
  accent: '#7c6ef0', accentHov: '#9d91f7', accentDim: 'rgba(124,110,240,0.12)',
  text: '#e8eaf0', textSub: '#8b8fa8', textMuted: '#4b5068',
  red: '#ef4444', redDim: 'rgba(239,68,68,0.12)',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: T.text, borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.accent },
    '&.Mui-focused fieldset': { borderColor: T.accent, borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { color: T.textSub, fontSize: '0.88rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: T.accent },
};

const Register = () => {
  const [formData, setFormData] = useState({ restaurantName: '', slug: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', data),
    onSuccess: (res) => {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/admin');
    },
    onError: (err) => setError(err.response?.data?.message || 'Registration failed')
  });

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate(formData);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', background: T.bg }} className="page-enter">
      <Grid container sx={{ flex: 1 }}>
        {/* Left: Visual Panel */}
        <Grid item xs={false} md={6} sx={{ display: { xs: 'none', md: 'flex' }, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1500&q=80")',
            backgroundSize: 'cover', backgroundPosition: 'center',
            '&::before': {
              content: '""', position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(15,17,23,0.88) 0%, rgba(124,110,240,0.4) 100%)',
            },
          }} />
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 8, height: '100%' }}>
            <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '2.4rem', color: '#fff', lineHeight: 1.2, mb: 2 }}>
              Get Started with<br />CulinaryCanvas.
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.8, maxWidth: 400 }}>
              Join thousands of restaurants that have modernized their dining experience. Registration takes less than 2 minutes.
            </Typography>
            <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
              {[['5min', 'Setup time'], ['0', 'Hardware needed'], ['∞', 'Menu updates']].map(([v, l]) => (
                <Box key={l}>
                  <Typography sx={{ color: '#a78bfa', fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '1.4rem' }}>{v}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>{l}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid>

        {/* Right: Form */}
        <Grid item xs={12} md={6} sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          p: { xs: 3, md: 6 }, borderLeft: { md: `1px solid ${T.border}` },
        }}>
          <Box sx={{ width: '100%', maxWidth: 440 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
              <Box sx={{
                width: 38, height: 38, borderRadius: '11px',
                background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FoodBank sx={{ fontSize: 20, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '1.1rem', color: T.text }}>
                CulinaryCanvas
              </Typography>
            </Box>

            <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '1.8rem', color: T.text, mb: 0.5 }}>
              Create your account
            </Typography>
            <Typography sx={{ color: T.textSub, fontSize: '0.88rem', mb: 4 }}>
              Set up your restaurant's digital presence in minutes
            </Typography>

            <Box component="form" onSubmit={handleRegister}>
              <Stack spacing={2}>
                <TextField label="Restaurant Name" name="restaurantName" autoFocus required
                  value={formData.restaurantName} onChange={handleChange} fullWidth sx={inputSx} />
                <TextField label="URL Slug (e.g. my-cafe)" name="slug" required
                  value={formData.slug} onChange={handleChange} fullWidth sx={inputSx}
                  helperText={<span style={{ color: T.textMuted, fontSize: '0.72rem' }}>Your menu URL: culinarycanvas.app/menu/<strong>{formData.slug || 'your-slug'}</strong></span>} />
                <TextField label="Email Address" name="email" type="email" required
                  value={formData.email} onChange={handleChange} fullWidth sx={inputSx} />
                <TextField label="Password" name="password" type="password" required
                  value={formData.password} onChange={handleChange} fullWidth sx={inputSx} />
              </Stack>

              {error && (
                <Box sx={{ mt: 2, p: 1.5, borderRadius: '10px', background: T.redDim, border: `1px solid rgba(239,68,68,0.2)` }}>
                  <Typography sx={{ color: T.red, fontSize: '0.8rem', fontWeight: 600 }}>{error}</Typography>
                </Box>
              )}

              <Button type="submit" fullWidth disabled={registerMutation.isPending}
                startIcon={<AppRegistration sx={{ fontSize: 18 }} />}
                sx={{
                  mt: 3.5, py: 1.4, borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700,
                  textTransform: 'none', letterSpacing: 0,
                  background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`,
                  color: '#fff', boxShadow: `0 4px 20px rgba(124,110,240,0.4)`,
                  '&:hover': { background: `linear-gradient(135deg, ${T.accentHov}, #b4a8fc)` },
                  '&:disabled': { opacity: 0.6, color: '#fff' },
                }}>
                {registerMutation.isPending ? 'Creating Account…' : 'Create My Account'}
              </Button>

              <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.82rem', color: T.textMuted }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: T.accent, fontWeight: 700, textDecoration: 'none' }}>
                  Sign in →
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register;
