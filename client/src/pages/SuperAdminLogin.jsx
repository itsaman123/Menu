import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Box, Button, TextField, Typography, Stack } from '@mui/material';
import { AdminPanelSettings, Lock } from '@mui/icons-material';
import api from '../api';

const T = {
  bg: '#0f1117', surface: '#16191f', surfaceAlt: '#1d2129',
  border: 'rgba(255,255,255,0.07)', accent: '#7c6ef0',
  accentHov: '#9d91f7', accentDim: 'rgba(124,110,240,0.12)',
  text: '#e8eaf0', textSub: '#8b8fa8', textMuted: '#4b5068',
  red: '#ef4444', redDim: 'rgba(239,68,68,0.12)',
  orange: '#f97316', orangeDim: 'rgba(249,115,22,0.12)',
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

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (data) => api.post('/api/superadmin/login', data),
    onSuccess: (res) => {
      localStorage.setItem('saToken', res.data.token);
      localStorage.setItem('saUser', JSON.stringify(res.data));
      navigate('/superadmin');
    },
    onError: (err) => setError(err.response?.data?.message || 'Invalid credentials')
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: T.bg, p: 3,
      '&::before': {
        content: '""', position: 'fixed', inset: 0, zIndex: 0,
        background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,110,240,0.12) 0%, transparent 70%)`,
        pointerEvents: 'none',
      },
    }} className="page-enter">
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        {/* Warning Badge */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center',
          mb: 5,
        }}>
          <Box sx={{
            px: 2, py: 0.8, borderRadius: '10px', background: T.orangeDim,
            border: '1px solid rgba(249,115,22,0.25)',
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <Lock sx={{ fontSize: 14, color: T.orange }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: T.orange, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Restricted Access
            </Typography>
          </Box>
        </Box>

        {/* Card */}
        <Box sx={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: '20px', p: { xs: 3, sm: 4 },
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
            <Box sx={{
              width: 52, height: 52, borderRadius: '15px',
              background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 24px rgba(124,110,240,0.4)`,
            }}>
              <AdminPanelSettings sx={{ fontSize: 26, color: '#fff' }} />
            </Box>
            <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '1.5rem', color: T.text }}>
              Super Admin
            </Typography>
            <Typography sx={{ color: T.textMuted, fontSize: '0.82rem' }}>
              System Administrator Access Only
            </Typography>
          </Stack>

          <Box component="form" onSubmit={handleLogin}>
            <Stack spacing={2}>
              <TextField label="Email" variant="outlined" value={email}
                onChange={e => setEmail(e.target.value)} required fullWidth sx={inputSx} />
              <TextField label="Password" type="password" variant="outlined" value={password}
                onChange={e => setPassword(e.target.value)} required fullWidth sx={inputSx} />
            </Stack>

            {error && (
              <Box sx={{ mt: 2, p: 1.5, borderRadius: '10px', background: T.redDim, border: `1px solid rgba(239,68,68,0.2)` }}>
                <Typography sx={{ color: T.red, fontSize: '0.8rem', fontWeight: 600 }}>{error}</Typography>
              </Box>
            )}

            <Button type="submit" fullWidth disabled={loginMutation.isPending}
              sx={{
                mt: 3.5, py: 1.4, borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700,
                textTransform: 'none',
                background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`,
                color: '#fff', boxShadow: `0 4px 20px rgba(124,110,240,0.4)`,
                '&:hover': { background: `linear-gradient(135deg, ${T.accentHov}, #b4a8fc)` },
                '&:disabled': { opacity: 0.6, color: '#fff' },
              }}>
              {loginMutation.isPending ? 'Authenticating…' : 'Sign In'}
            </Button>
          </Box>
        </Box>

        <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.75rem', color: T.textMuted }}>
          Unauthorized access is strictly prohibited and monitored.
        </Typography>
      </Box>
    </Box>
  );
};

export default SuperAdminLogin;
