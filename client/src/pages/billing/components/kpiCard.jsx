// =============================================================================
// components/KpiCard.jsx
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/components/KpiCard.jsx
//
// Purely presentational — unchanged by the API wiring. It still just
// takes a `card` object ({ label, value, color, trend?, sub? }) and
// renders one KPI box. BillingDashboardPage.jsx now BUILDS these card
// objects from the live GET /api/billing/overview response instead of
// a hardcoded array — this component doesn't need to know that.
// =============================================================================
import React from 'react';
import { Box } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { COLORS, T, cardSx } from '../theme';

const KpiCard = ({ card }) => (
  <Box sx={{ ...cardSx, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
    <Box
      sx={{
        width: 56, height: 56, borderRadius: '16px', flexShrink: 0,
        bgcolor: `${card.color}1A`,
        color: card.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <ReceiptIcon sx={{ fontSize: 26 }} />
    </Box>

    <Box>
      <T variant="labelSm" sx={{ color: COLORS.secondary }}>{card.label}</T>
      <T variant="titleMd" sx={{ fontWeight: 700 }}>{card.value}</T>

      {card.trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: COLORS.statusReady }}>
          <TrendingUpIcon sx={{ fontSize: 14 }} />
          <T variant="labelSm" sx={{ color: COLORS.statusReady, textTransform: 'none' }}>{card.trend}</T>
        </Box>
      )}

      {card.sub && (
        <T variant="labelSm" sx={{ color: card.subColor || COLORS.secondary, textTransform: 'none', mt: 0.5 }}>
          {card.sub}
        </T>
      )}
    </Box>
  </Box>
);

export default KpiCard;