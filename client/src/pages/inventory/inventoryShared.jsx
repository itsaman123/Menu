import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { COLORS, TYPE, cardSx } from './inventoryTokens';

// Small text helper so we get exact design typography instead of MUI defaults
export const T = ({ variant = 'bodyMd', sx = {}, children, component = 'p', ...rest }) => (
  <Box component={component} sx={{ m: 0, ...TYPE[variant], ...sx }} {...rest}>
    {children}
  </Box>
);

export const LoadingBlock = ({ height = 240 }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height }}>
    <CircularProgress size={30} sx={{ color: COLORS.primary }} />
  </Box>
);

export const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <Box sx={{ ...cardSx, textAlign: 'center', py: 8 }}>
    {Icon && <Icon sx={{ fontSize: 48, color: COLORS.outlineVariant, mb: 1.5 }} />}
    <T variant="titleMd" sx={{ mb: 0.5 }}>{title}</T>
    {subtitle && <T variant="bodyMd" sx={{ color: COLORS.secondary }}>{subtitle}</T>}
  </Box>
);
