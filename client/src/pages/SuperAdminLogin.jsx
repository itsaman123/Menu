import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function SuperAdminLogin() {
  const T = useTokens();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/superadmin/login', { email, password });
      localStorage.setItem('saToken', data.token);
      navigate('/superadmin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Box sx={{
      bgcolor: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', p: 3, position: 'relative', overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Background */}
      <Box sx={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, bgcolor: 'rgba(249,115,22,0.05)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

      <Box sx={{
        width: '100%', maxWidth: 440, bgcolor: T.surface, borderRadius: '1.5rem',
        p: 5, boxShadow: T.shadowHov, position: 'relative', zIndex: 10,
      }}>
        {/* Branding */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '50%', mx: 'auto', mb: 3,
            background: 'linear-gradient(to bottom right, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(249,115,22,0.3)',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 28 }}>shield_person</span>
          </Box>
          <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 900, color: T.text, letterSpacing: '-0.025em', mb: 0.5 }}>Super Admin Portal</Typography>
          <Typography sx={{ color: T.textSub, fontWeight: 500, fontSize: '0.875rem' }}>Restricted access. Authorized personnel only.</Typography>
        </Box>

        {error && (
          <Typography sx={{ color: T.red, bgcolor: T.redDim, p: 1.5, borderRadius: 1, mb: 3, fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Email */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography component="label" sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: T.textSub }}>Admin Email</Typography>
            <Box sx={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 20 }}>admin_panel_settings</span>
              <Box component="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@curatedcanvas.com"
                sx={{
                  width: '100%', height: 56, pl: '48px', pr: 2,
                  bgcolor: T.surfaceAlt, border: 'none', borderRadius: '1rem',
                  color: T.text, outline: 'none', fontSize: '0.875rem',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  '&:focus': { boxShadow: '0 0 0 2px rgba(249,115,22,0.2)', bgcolor: T.surface },
                  '&::placeholder': { color: T.textMuted },
                }}
              />
            </Box>
          </Box>

          {/* Password */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography component="label" sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: T.textSub }}>Password</Typography>
            <Box sx={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 20 }}>lock</span>
              <Box component="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                sx={{
                  width: '100%', height: 56, pl: '48px', pr: 2,
                  bgcolor: T.surfaceAlt, border: 'none', borderRadius: '1rem',
                  color: T.text, outline: 'none', fontSize: '0.875rem',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  '&:focus': { boxShadow: '0 0 0 2px rgba(249,115,22,0.2)', bgcolor: T.surface },
                  '&::placeholder': { color: T.textMuted },
                }}
              />
            </Box>
          </Box>

          <Box component="button" type="submit" sx={{
            width: '100%', height: 56,
            background: 'linear-gradient(to bottom right, #f97316, #ea580c)',
            color: '#fff7ed', fontWeight: 700, borderRadius: '1rem',
            boxShadow: '0 10px 20px rgba(249,115,22,0.2)', cursor: 'pointer',
            border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
            '&:hover': { transform: 'scale(1.02)' }, '&:active': { transform: 'scale(0.95)' },
          }}>
            <span>Authenticate</span>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <span className="material-symbols-outlined" style={{ color: '#006c49', fontSize: 16, fontVariationSettings: "'FILL' 1" }}>security</span>
            <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, fontWeight: 500 }}>End-to-end encrypted session</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
