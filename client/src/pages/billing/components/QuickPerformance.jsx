// =============================================================================
// components/QuickPerformance.jsx
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/components/QuickPerformance.jsx
//
// Previously this imported a hardcoded QUICK_PERFORMANCE array. Now it
// takes the real `overview` object (from GET /api/billing/overview) as
// a prop and builds the rows from averageBill / highestSale /
// gstCollected / tipsShared.
// =============================================================================
import React from 'react';
import { Box, Divider } from '@mui/material';
import { COLORS, T, cardSx, currency } from '../theme';

const QuickPerformance = ({ overview }) => {
  const rows = overview
    ? [
      { label: 'Average Bill', value: currency(overview.averageBill) },
      { label: 'Highest Sale', value: currency(overview.highestSale) },
      { label: 'GST Collected', value: currency(overview.gstCollected) },
      { label: 'Tips Shared', value: currency(overview.tipsShared) },
    ]
    : [];

  return (
    <Box sx={{ ...cardSx, bgcolor: COLORS.surfaceHighlight, border: `1px solid ${COLORS.outlineVariant}` }}>
      <T variant="titleMd" sx={{ color: COLORS.primary, mb: 2 }}>Quick Performance</T>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {rows.map((row) => (
          <Box
            key={row.label}
            sx={{
              p: 1.5, bgcolor: COLORS.white, borderRadius: '12px', border: `1px solid ${COLORS.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <T variant="bodyMd" sx={{ color: COLORS.secondary }}>{row.label}</T>
            <T variant="bodyMd" sx={{ fontWeight: 700 }}>{row.value}</T>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 2, borderColor: COLORS.outlineVariant }} />

      <Box sx={{ textAlign: 'center' }}>
        <T
          variant="labelSm"
          sx={{ color: COLORS.primary, textTransform: 'none', cursor: 'pointer', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
        >
          Download Detailed Report
        </T>
      </Box>
    </Box>
  );
};

export default QuickPerformance;