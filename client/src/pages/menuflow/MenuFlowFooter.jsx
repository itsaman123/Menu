import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MF } from './mfTheme';

const COLS = [
  { heading: 'Platform', links: ['Menus', 'Ordering', 'Analytics', 'Multi-location'] },
  { heading: 'Company',  links: ['About', 'Careers', 'Culture', 'Blog'] },
  { heading: 'Support',  links: ['Documentation', 'Support', 'Privacy', 'Terms'] },
];

export default function ScanItFooter() {
  const navigate = useNavigate();
  return (
    <Box component="footer" sx={{
      bgcolor: MF.surfaceLowest, borderTop: `1px solid ${MF.outlineVar}`,
      pt: 10, pb: 5, fontFamily: 'Inter, sans-serif',
    }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: 6 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)', lg: 'repeat(6,1fr)' }, gap: 3 }}>
          {/* Brand */}
          <Box sx={{ gridColumn: { lg: 'span 2' } }}>
            <Typography sx={{ fontSize: 24, fontWeight: 900, color: MF.text, mb: 2 }}>ScanIt</Typography>
            <Typography sx={{ fontSize: 14, color: MF.textSub, maxWidth: 280, lineHeight: 1.7 }}>
              The operating system for the modern restaurant. Streamline ordering, increase sales, and delight your guests.
            </Typography>
          </Box>
          {/* Link columns */}
          {COLS.map(col => (
            <Box key={col.heading}>
              <Typography sx={{ fontSize: 20, fontWeight: 600, color: MF.text, mb: 2 }}>{col.heading}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {col.links.map(l => (
                  <Typography key={l} component="a" href="#" sx={{
                    fontSize: 14, color: MF.textSub, textDecoration: 'none',
                    transition: 'color 0.2s', '&:hover': { color: MF.primary, textDecoration: 'underline' },
                  }}>{l}</Typography>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 8, pt: 3, borderTop: `1px solid ${MF.outlineVar}33`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography sx={{ fontSize: 12, color: MF.textSub }}>© 2024 ScanIt. All rights reserved.</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {['public', 'share', 'alternate_email'].map(icon => (
              <Box key={icon} sx={{ color: MF.outlineVar, cursor: 'pointer', '&:hover': { color: MF.primary }, transition: 'color 0.2s' }}>
                <span className="material-symbols-outlined">{icon}</span>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
