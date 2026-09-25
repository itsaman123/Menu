// =============================================================================
// components/RevenueChart.jsx
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/components/RevenueChart.jsx
//
// Now uses a real charting library (recharts, already in package.json)
// instead of a hand-drawn SVG path. Takes the `data` prop — the array
// returned by GET /api/billing/revenue-trend, e.g.
//   [{ week: "Week 1", current: 32000, previous: 28000 }, ...]
// — and renders it as an area chart with two series (Current / Previous).
// =============================================================================
import React from 'react';
import { Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS, T, cardSx, currency } from '../theme';

// Custom tooltip so it matches the Lumiere design instead of recharts' default box
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <Box sx={{ bgcolor: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: '10px', p: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <T variant="labelSm" sx={{ color: COLORS.secondary, mb: 0.5 }}>{label}</T>
      {payload.map((p) => (
        <T key={p.dataKey} variant="bodyMd" sx={{ fontWeight: 700, color: p.color }}>
          {p.name}: {currency(p.value)}
        </T>
      ))}
    </Box>
  );
};

const RevenueChart = ({ data = [] }) => (
  <Box sx={cardSx}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <T variant="titleMd">Monthly Revenue Analysis</T>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.accentOrange }} />
          <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>Current</T>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.outlineVariant }} />
          <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>Previous</T>
        </Box>
      </Box>
    </Box>

    <Box sx={{ height: 260, bgcolor: COLORS.surfaceContainerLow, borderRadius: '12px', p: 1 }}>
      {data.length === 0 ? (
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <T variant="bodyMd" sx={{ color: COLORS.secondary }}>No revenue data yet</T>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="currentFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.accentOrange} stopOpacity={0.35} />
                <stop offset="95%" stopColor={COLORS.accentOrange} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.outlineVariant} vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: COLORS.secondary, fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: COLORS.secondary, fontFamily: 'inherit' }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="previous" name="Previous" stroke={COLORS.outlineVariant} strokeWidth={2} fill="none" />
            <Area type="monotone" dataKey="current" name="Current" stroke={COLORS.accentOrange} strokeWidth={3} fill="url(#currentFill)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Box>
  </Box>
);

export default RevenueChart;