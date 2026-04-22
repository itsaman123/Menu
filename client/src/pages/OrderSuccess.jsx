import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTokens } from '../ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';

export default function OrderSuccess() {
  const T = useTokens();
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Box sx={{
      bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3,
    }}>
      {/* Success Card */}
      <Box sx={{
        bgcolor: T.surface, borderRadius: '1.5rem', p: 6, boxShadow: T.shadowHov,
        textAlign: 'center', maxWidth: 440, width: '100%',
      }}>
        {/* Success Icon */}
        <Box sx={{
          width: 96, height: 96, borderRadius: '50%', bgcolor: '#6cf8bb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 4, boxShadow: '0 8px 28px rgba(0,108,73,0.2)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#006c49', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </Box>

        <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 900, color: T.text, mb: 1, letterSpacing: '-0.025em' }}>
          Order Placed!
        </Typography>
        <Typography sx={{ color: T.textSub, fontSize: '1rem', mb: 4, lineHeight: 1.625 }}>
          Your order has been confirmed and sent to the kitchen. Sit back and relax!
        </Typography>

        {/* Order Details */}
        <Box sx={{ bgcolor: T.surfaceAlt, borderRadius: '1rem', p: 3, mb: 4, textAlign: 'left' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>Order ID</Typography>
            <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem' }}>#{id || 'TCC-2024-' + Math.floor(Math.random() * 9000 + 1000)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>Status</Typography>
            <Box component="span" sx={{
              bgcolor: '#6cf8bb', color: '#00714d', px: 1.5, py: 0.5,
              borderRadius: '9999px', fontSize: '10px', fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>Preparing</Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>Est. Time</Typography>
            <Typography sx={{ fontWeight: 900, color: '#5341cd', fontSize: '0.875rem' }}>15-20 mins</Typography>
          </Box>
        </Box>

        {/* Animated status bar */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            {['Order Placed', 'Preparing', 'Ready'].map((s, i) => (
              <Typography key={s} sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: i === 0 ? '#006c49' : T.textMuted }}>
                {s}
              </Typography>
            ))}
          </Box>
          <Box sx={{ height: 8, bgcolor: T.surfaceHigh, borderRadius: '9999px', overflow: 'hidden' }}>
            <Box sx={{
              height: '100%', width: '33%', bgcolor: '#006c49', borderRadius: '9999px',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
            }} />
          </Box>
        </Box>

        {/* Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box component="button" sx={{
            width: '100%', height: 56,
            background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)',
            color: '#fff', fontWeight: 700, borderRadius: '1rem',
            boxShadow: '0 10px 20px rgba(83,65,205,0.2)', cursor: 'pointer',
            border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '1rem',
            '&:hover': { transform: 'scale(1.02)' }, '&:active': { transform: 'scale(0.95)' },
          }}>
            Track Order
          </Box>
          <Box component="button" onClick={() => navigate(-2)} sx={{
            width: '100%', height: 48, bgcolor: T.surfaceAlt, color: T.text,
            fontWeight: 700, borderRadius: '1rem', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
            '&:hover': { bgcolor: T.surfaceHigh },
          }}>
            Back to Menu
          </Box>
        </Box>
      </Box>

      {/* Badge */}
      <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 1 }}>
        <span className="material-symbols-outlined" style={{ color: T.textMuted, fontSize: 16 }}>verified</span>
        <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, fontWeight: 500 }}>
          Powered by The Curated Canvas
        </Typography>
      </Box>
    </Box>
  );
}
