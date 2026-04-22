import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTokens } from '../ThemeContext';

const M = motion.create(Box);

export default function LiveOrdersView() {
  const T = useTokens();

  return (
    <M
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-end' }, justifyContent: 'space-between', gap: 3, mb: 6 }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '2.25rem', fontWeight: 900, color: T.text, letterSpacing: '-0.05em' }}>Live Orders</Typography>
          <Typography sx={{ color: T.textSub, mt: 1, fontWeight: 500 }}>Real-time floor management and kitchen synchronization.</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ bgcolor: T.surfaceAlt, px: 3, py: 1.5, borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <span className="material-symbols-outlined" style={{ color: '#006c49', fontSize: 16 }}>radio_button_checked</span>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#006c49' }}>Kitchen Live</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 6 }}>
        <Box sx={{ bgcolor: T.surfaceAlt, p: 3, borderRadius: '0.5rem' }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>Pending Orders</Typography>
          <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: T.text }}>12</Typography>
        </Box>
        <Box sx={{ bgcolor: '#6c5ce7', color: '#faf6ff', p: 3, borderRadius: '0.5rem' }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2, opacity: 0.8 }}>Active Kitchen</Typography>
          <Typography sx={{ fontSize: '3rem', fontWeight: 900 }}>08</Typography>
        </Box>
        <Box sx={{ bgcolor: T.surface, p: 3, borderRadius: '0.5rem', gridColumn: { md: 'span 2' }, boxShadow: T.shadowHov, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>Avg. Completion</Typography>
            <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: T.text }}>18<span style={{ fontSize: '1.25rem', opacity: 0.4, marginLeft: 4 }}>min</span></Typography>
          </Box>
          <Box sx={{ width: 64, height: 48, bgcolor: 'rgba(108,248,187,0.3)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ color: '#006c49', fontSize: 28 }}>trending_down</span>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 4 }}>
        
        {/* Order Card 1 */}
        <Box sx={{ bgcolor: T.surface, borderRadius: '0.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(18,28,42,0.04)', '&:hover': { transform: 'scale(1.02)' }, transition: 'all 0.3s' }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box component="span" sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', bgcolor: '#ffdcc3', color: '#2f1500', px: 1, py: 0.25, borderRadius: '4px' }}>Priority</Box>
                <Box component="span" sx={{ fontSize: '10px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.1em' }}>#ORD-2841</Box>
              </Box>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: T.text }}>Table 04</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Wait Time</Typography>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#ba1a1a' }}>14m</Typography>
            </Box>
          </Box>
          <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: T.text, fontWeight: 500 }}>2x Paneer Tikka (Special)</Typography>
              <Typography sx={{ color: T.textSub, fontSize: '0.875rem', fontWeight: 700 }}>₹780</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: T.text, fontWeight: 500 }}>1x Butter Naan Basket</Typography>
              <Typography sx={{ color: T.textSub, fontSize: '0.875rem', fontWeight: 700 }}>₹240</Typography>
            </Box>
            <Box sx={{ pt: 2, mt: 'auto', borderTop: `1px dashed rgba(200,196,215,0.3)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Amount</Typography>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: T.text }}>₹1,470</Typography>
            </Box>
          </Box>
          <Box sx={{ p: 3, bgcolor: T.surfaceAlt, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box component="button" sx={{ bgcolor: T.surfaceHighest, color: T.text, py: 1.5, px: 2, borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, opacity: 0.5 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>restaurant</span> Preparing
            </Box>
            <Box component="button" sx={{ bgcolor: '#5341cd', color: '#fff', py: 1.5, px: 2, borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer', boxShadow: '0 4px 6px rgba(83,65,205,0.2)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span> Mark Ready
            </Box>
          </Box>
        </Box>

      </Box>
    </M>
  );
}
