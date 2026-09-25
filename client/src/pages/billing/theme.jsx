// =============================================================================
// theme.jsx
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/theme.jsx
//
// Only DESIGN TOKENS live here — colors, fonts, spacing helpers.
// No component logic goes here, only "look & feel" values.
// Every other file in this folder imports from here so colors/fonts
// stay consistent everywhere.
//
// IMPORTANT: this file must stay named "theme.jsx" (not "theme.js")
// because it contains JSX (the <Box>...</Box> below). Vite only parses
// JSX syntax inside .jsx/.tsx files.
// =============================================================================
import React from 'react';
import { Box } from '@mui/material';

export const COLORS = {
  background: '#fdf9f4',
  surfaceContainerLow: '#f7f3ee',
  surfaceContainerHigh: '#ebe8e3',
  surfaceContainer: '#f1ede8',
  onSurface: '#1c1c19',
  secondary: '#5e5e5e',
  outlineVariant: '#ddc1b4',
  border: '#e5e7eb',
  primary: '#783100',
  accentOrange: '#f97316',
  surfaceHighlight: '#FFF3E8',
  statusReady: '#16a34a',
  statusPending: '#2563eb',
  error: '#ba1a1a',
  white: '#ffffff',
};

export const FONT = '"Be Vietnam Pro", "Roboto", sans-serif';

export const TYPE = {
  displayLg: { fontFamily: FONT, fontSize: 32, fontWeight: 600, lineHeight: '40px', letterSpacing: '-0.02em' },
  headlineLg: { fontFamily: FONT, fontSize: 28, fontWeight: 600, lineHeight: '36px', letterSpacing: '-0.02em' },
  titleMd: { fontFamily: FONT, fontSize: 20, fontWeight: 600, lineHeight: '28px' },
  bodyLg: { fontFamily: FONT, fontSize: 16, fontWeight: 400, lineHeight: '24px' },
  bodyMd: { fontFamily: FONT, fontSize: 14, fontWeight: 400, lineHeight: '20px' },
  labelSm: { fontFamily: FONT, fontSize: 12, fontWeight: 600, lineHeight: '16px', letterSpacing: '0.04em', textTransform: 'uppercase' },
};

// T = small "Text" helper component — use instead of MUI's <Typography>
// so our custom TYPE tokens get applied directly.
export const T = ({ variant = 'bodyMd', sx = {}, children, component = 'p', ...rest }) => (
  <Box component={component} sx={{ m: 0, ...TYPE[variant], ...sx }} {...rest}>
    {children}
  </Box>
);

export const cardSx = {
  bgcolor: COLORS.white,
  borderRadius: '16px',
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  p: 3,
};

export const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: COLORS.surfaceContainerLow,
    fontFamily: FONT,
    '& fieldset': { borderColor: 'transparent' },
    '&:hover fieldset': { borderColor: COLORS.outlineVariant },
    '&.Mui-focused fieldset': { borderColor: COLORS.primary },
  },
  '& .MuiInputLabel-root': { fontFamily: FONT },
};

// Rupee formatting helper — turns 4250 into "₹4,250" (Indian comma style)
export const currency = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;