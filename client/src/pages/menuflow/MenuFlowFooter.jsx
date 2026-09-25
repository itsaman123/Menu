import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MF } from './mfTheme';
import LegalModal from './LegalModal';

const COLS = [
  {
    heading: 'Platform', rotate: '1.5deg', hoverRotate: '0.5deg',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'How It Works', to: '/how-it-works' },
    ],
  },
  {
    heading: 'Company', rotate: '-1.2deg', hoverRotate: '-0.3deg',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Legal & Account', rotate: '2deg', hoverRotate: '0.8deg',
    links: [
      { label: 'Privacy Policy', legal: 'privacy' },
      { label: 'Terms & Conditions', legal: 'terms' },
      { label: 'Admin Login', to: '/login' },
    ],
  },
];

export default function ScanItFooter() {
  const navigate = useNavigate();
  const [legalModal, setLegalModal] = useState(null); // 'terms' | 'privacy' | null
  return (
    <Box component="footer" sx={{
      bgcolor: MF.surfaceLow,
      pt: { xs: 8, md: 10 },
      pb: { xs: 6, md: 8 },
      fontFamily: 'Inter, sans-serif',
    }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 3, md: 6 } }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 3.5
        }}>
          {/* Brand Card (Card 1) */}
          <Box sx={{
            gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 2' },
            bgcolor: MF.surfaceLowest,
            borderRadius: '24px',
            p: { xs: 4, md: 5 },
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.025)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            '&:hover': {
              transform: { md: 'translateY(-6px)' },
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.04)'
            }
          }}>
            <Box>
              {/* Logo / Brand Name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: MF.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
                }}>
                  <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 26 }}>qr_code_2</span>
                </Box>
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: MF.text, fontFamily: 'Inter, sans-serif' }}>
                  ScanIt
                </Typography>
              </Box>

              {/* Description */}
              <Typography sx={{ fontSize: 14.5, color: MF.textSub, lineHeight: 1.6, mb: 4, fontFamily: 'Inter, sans-serif' }}>
                Elevating hospitality through seamless digital solutions. Simple. Fast. Efficient.
              </Typography>
            </Box>
          </Box>

          {/* Link Columns (Cards 2, 3, 4) */}
          {COLS.map((col) => (
            <Box
              key={col.heading}
              sx={{
                bgcolor: MF.surface,
                borderRadius: '24px',
                p: { xs: 4, md: 4.5 },
                display: 'flex',
                flexDirection: 'column',
                transform: { xs: 'none', md: `rotate(${col.rotate})` },
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                '&:hover': {
                  transform: { md: `translateY(-6px) rotate(${col.hoverRotate})` },
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.03)'
                }
              }}
            >
              <Typography sx={{
                fontSize: 16,
                fontWeight: 700,
                color: MF.text,
                mb: 3,
                fontFamily: 'Inter, sans-serif'
              }}>
                {col.heading}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {col.links.map((link) => (
                  <Typography
                    key={link.label}
                    onClick={() => {
                      if (link.legal) setLegalModal(link.legal);
                      else if (link.to) navigate(link.to);
                    }}
                    sx={{
                      fontSize: 14.5,
                      color: MF.textSub,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'color 0.2s',
                      width: 'fit-content',
                      '&:hover': {
                        color: MF.primary,
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Bottom Row */}
        <Box sx={{
          mt: { xs: 6, md: 8 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 3,
        }}>
          {/* Copyright */}
          <Typography sx={{ fontSize: 13.5, color: MF.textSub, fontFamily: 'Inter, sans-serif' }}>
            © {new Date().getFullYear()} ScanIt. Built for chefs.
          </Typography>

          {/* Legal links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography onClick={() => setLegalModal('terms')} sx={{ fontSize: 13.5, color: MF.textSub, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'color 0.2s', '&:hover': { color: MF.primary, textDecoration: 'underline' } }}>
              Terms & Conditions
            </Typography>
            <Typography onClick={() => setLegalModal('privacy')} sx={{ fontSize: 13.5, color: MF.textSub, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'color 0.2s', '&:hover': { color: MF.primary, textDecoration: 'underline' } }}>
              Privacy Policy
            </Typography>
          </Box>
        </Box>
      </Box>

      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </Box>
  );
}
