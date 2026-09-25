import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MF, NAV_LINKS } from './mfTheme';
import logo from '../../assets/logo.png';

export default function MenuFlowNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const dropdownRef = useRef(null);



  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Box component="header" sx={{
      position: 'fixed', top: 0, width: '100%', zIndex: 50,
      bgcolor: 'rgba(249,249,250,0.7)', backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${MF.outlineVar}4D`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <Box sx={{
        maxWidth: 1280, mx: 'auto', px: 2,
        height: 72, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {/* Logo */}
        <Box onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
          <Box component="img" src={logo} alt="ScanIt" sx={{ height: 150, width: 'auto' }} />
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

        {/* CTA & Mobile Dropdown */}
        <Box ref={dropdownRef} sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
          {/* Login Link */}
          <Typography
            component="a"
            onClick={() => navigate('/login')}
            sx={{
              display: { xs: 'none', md: 'block' },
              fontSize: { xs: 13, sm: 14.5 },
              fontWeight: 500,
              color: pathname === '/login' ? MF.primary : MF.textSub,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'color 0.2s',
              fontFamily: 'Inter, sans-serif',
              userSelect: 'none',
              '&:hover': {
                color: MF.primary
              }
            }}
          >
            Login
          </Typography>

          {/* Start Trial Button */}
          <Box
            component="button"
            onClick={() => navigate('/contact')}
            sx={{
              display: { xs: 'none', md: 'inline-block' },
              bgcolor: MF.primary,
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.25 },
              fontSize: { xs: 13, sm: 14.5 },
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(249, 115, 22, 0.3)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: MF.secondary,
                boxShadow: '0 8px 24px rgba(234, 88, 12, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'translateY(0.5px)',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
              }
            }}
          >
            Start Trial
          </Box>

          {/* Hamburger Menu button - visible only on mobile/tablet */}
          <Box
            component="button"
            onClick={() => setOpenMenu(!openMenu)}
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              color: '#1f2937',
              border: 'none',
              width: 38,
              height: 38,
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              '&:hover': { background: 'rgba(0,0,0,0.05)' },
              '&:active': { transform: 'scale(0.92)' }
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24, transform: openMenu ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              {openMenu ? 'close' : 'menu'}
            </span>
          </Box>

          {/* Mobile Dropdown Menu Overlay */}
          <AnimatePresence>
            {openMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: 48,
                  right: 0,
                  width: 180,
                  background: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '12px',
                  border: `1px solid ${MF.outlineVar}66`,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                  padding: '6px',
                  zIndex: 100,
                }}
              >
                {NAV_LINKS.map(({ label, path }) => {
                  const active = pathname === path;
                  return (
                    <Box
                      key={path}
                      onClick={() => {
                        navigate(path);
                        setOpenMenu(false);
                      }}
                      sx={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        bgcolor: active ? 'rgba(249, 115, 22, 0.08)' : 'transparent',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(249, 115, 22, 0.05)',
                        }
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontWeight: active ? 700 : 500,
                          color: active ? MF.primary : MF.textSub,
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  );
                })}
                <Box sx={{ my: 1, height: '1px', bgcolor: 'rgba(0,0,0,0.06)' }} />
                <Box
                  onClick={() => {
                    navigate('/login');
                    setOpenMenu(false);
                  }}
                  sx={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(249, 115, 22, 0.05)',
                    }
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: MF.textSub,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Login
                  </Typography>
                </Box>
                <Box
                  onClick={() => {
                    navigate('/contact');
                    setOpenMenu(false);
                  }}
                  sx={{
                    padding: '10px 14px',
                    mt: 0.5,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    bgcolor: MF.primary,
                    color: '#ffffff',
                    '&:hover': {
                      bgcolor: MF.secondary,
                    }
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#ffffff',
                      fontFamily: 'Inter, sans-serif',
                      textAlign: 'center',
                    }}
                  >
                    Start Trial
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}

