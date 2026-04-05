import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Box, Button, TextField, Typography, Stack, Grid } from '@mui/material';
import { FoodBank, Login as LoginIcon, ArrowForward } from '@mui/icons-material';
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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (credentials) => api.post('/auth/login', credentials),
    onSuccess: (res) => {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/admin');
    },
    onError: (err) => setError(err.response?.data?.message || 'Login failed')
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', background: T.bg }} className="page-enter">
      <Grid container sx={{ flex: 1 }}>
        {/* Left: Form */}
        <Grid item xs={12} md={5} sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          p: { xs: 3, md: 6 }, borderRight: { md: `1px solid ${T.border}` },
        }}>
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            {/* Brand */}
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
              Welcome back
            </Typography>
            <Typography sx={{ color: T.textSub, fontSize: '0.88rem', mb: 4 }}>
              Sign in to manage your restaurant
            </Typography>

            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={2}>
                <TextField label="Email Address" autoComplete="email" autoFocus
                  value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required sx={inputSx} />
                <TextField label="Password" type="password" autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required sx={inputSx} />
              </Stack>

              {error && (
                <Box sx={{ mt: 2, p: 1.5, borderRadius: '10px', background: T.redDim, border: `1px solid rgba(239,68,68,0.2)` }}>
                  <Typography sx={{ color: T.red, fontSize: '0.8rem', fontWeight: 600 }}>{error}</Typography>
                </Box>
              )}

              <Button type="submit" fullWidth disabled={loginMutation.isPending}
                startIcon={<LoginIcon sx={{ fontSize: 18 }} />}
                sx={{
                  mt: 3.5, py: 1.4, borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700,
                  textTransform: 'none', letterSpacing: 0,
                  background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`,
                  color: '#fff', boxShadow: `0 4px 20px rgba(124,110,240,0.4)`,
                  '&:hover': { background: `linear-gradient(135deg, ${T.accentHov}, #b4a8fc)`, boxShadow: `0 6px 24px rgba(124,110,240,0.55)` },
                  '&:disabled': { opacity: 0.6, color: '#fff' },
                }}>
                {loginMutation.isPending ? 'Signing in…' : 'Sign In'}
              </Button>

              <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.82rem', color: T.textMuted }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: T.accent, fontWeight: 700, textDecoration: 'none' }}>
                  Create one →
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Right: Visual Panel */}
        <Grid item xs={false} md={7} sx={{ display: { xs: 'none', md: 'flex' }, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1500&q=80")',
            backgroundSize: 'cover', backgroundPosition: 'center',
            '&::before': {
              content: '""', position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(15,17,23,0.85) 0%, rgba(124,110,240,0.45) 100%)',
            },
          }} />
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 8, height: '100%' }}>
            <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '2.4rem', color: '#fff', lineHeight: 1.2, mb: 2 }}>
              Modernize Your<br />Restaurant.
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.8, maxWidth: 440 }}>
              The all-in-one platform for QR menus, real-time ordering, and digitalized restaurant management.
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              {['QR Menus', 'Live Orders', 'Analytics'].map((tag) => (
                <Box key={tag} sx={{ px: 2, py: 0.7, borderRadius: '8px', background: 'rgba(124,110,240,0.18)', border: '1px solid rgba(124,110,240,0.35)' }}>
                  <Typography sx={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 700 }}>{tag}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
