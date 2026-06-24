import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { MF, NAV_LINKS } from './mfTheme';
import logo from '../../assets/logo.png';

export default function MenuFlowNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box component="header" sx={{
      position: 'fixed', top: 0, width: '100%', zIndex: 50,
      bgcolor: 'rgba(249,249,250,0.7)', backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${MF.outlineVar}4D`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <Box sx={{
        maxWidth: 1280, mx: 'auto', px: 1,
        height: 72, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {/* Logo */}
        <Box onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
          <Box component="img" src={logo} alt="ScanIt" sx={{ height: 150, width: 'auto' }} />
          {/* <Typography sx={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', color: MF.text, fontFamily: 'Inter, sans-serif' }}>
            ScanIt
          </Typography> */}
        </Box>

        {/* Nav links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
          {NAV_LINKS.map(({ label, path }) => {
            const active = pathname === path;
            return (
              <Box key={path} sx={{ position: 'relative' }}>
                <Typography
                  component="a"
                  onClick={() => navigate(path)}
                  sx={{
                    fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
                    textTransform: 'uppercase', cursor: 'pointer',
                    color: active ? MF.primary : MF.textSub,
                    textDecoration: 'none', transition: 'color 0.2s',
                    '&:hover': { color: MF.primary },
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {label}
                </Typography>
                {active && (
                  <Box sx={{
                    position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
                    width: 4, height: 4, borderRadius: '50%', bgcolor: MF.primary,
                  }} />
                )}
              </Box>
            );
          })}
        </Box>

        {/* CTA */}
        <Box component="button" onClick={() => navigate('/register')} sx={{
          background: MF.gradient, color: '#fff', px: 3, py: 1,
          borderRadius: '12px', fontWeight: 700, fontSize: 14, border: 'none',
          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          transition: 'transform 0.15s', '&:hover': { transform: 'scale(1.04)' },
          '&:active': { transform: 'scale(0.95)' },
        }}>
          Start Free Trial
        </Box>
      </Box>
    </Box>
  );
}
