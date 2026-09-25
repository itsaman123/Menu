// =============================================================================
// pages/BillingDashboardPage.jsx
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/pages/BillingDashboardPage.jsx
//
// PAGE 1 — now a real data-fetching container instead of a static
// display. On mount (and whenever the search/status filter changes) it
// calls:
//   - billingApi.getOverview()        -> the 4 KPI cards
//   - billingApi.getRevenueTrend()    -> the chart
//   - billingApi.getInvoices(...)     -> the table
//
// The "Add Payment" button has been removed from the header per your
// instruction — "Create Invoice" is the only header action now. The
// per-invoice payment/status actions (Mark Paid / Mark Overdue / Cancel)
// live in the table's "..." menu instead (see InvoicesTable.jsx), and
// their handlers are defined right here since this page owns the
// invoices list and knows how to refresh it after an action succeeds.
// =============================================================================
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { COLORS, T, TYPE, currency } from '../theme';
import * as billingApi from '../billingapi';
import KpiCard from '../components/kpiCard';
import RevenueChart from '../components/RevenueChart';
import QuickPerformance from '../components/QuickPerformance';
import InvoicesTable from '../components/InvoicesTable';

const BillingDashboardPage = ({ onCreateInvoice, onRowClick, onViewAll }) => {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  // Overview + revenue chart load once when the page mounts
  useEffect(() => {
    billingApi.getOverview().then(setOverview).catch(() => setOverview(null));
    billingApi.getRevenueTrend(4).then(setTrend).catch(() => setTrend([]));
  }, []);

  // Dashboard only ever shows a small preview (5 rows) — the full,
  // filterable/searchable/paginated list lives on the "View All" page
  const loadInvoices = useCallback(() => {
    setLoadingInvoices(true);
    billingApi
      .getInvoices({ page: 1, limit: 5 })
      .then((res) => setInvoices(res.invoices || []))
      .catch(() => setInvoices([]))
      .finally(() => setLoadingInvoices(false));
  }, []);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  // ---- Row action menu handlers (POST payment / PUT status) ----
  const handleMarkPaid = (invoice) => {
    // paymentMethod defaults to whatever was set at invoice creation
    // (or "cash" if none was set) since there's no payment-method
    // picker in this UI anymore — tipAmount defaults to 0.
    billingApi
      .addPayment(invoice._id, { paymentMethod: invoice.paymentMethod || 'cash', tipAmount: 0 })
      .then(loadInvoices)
      .catch(() => { });
  };

  const handleMarkOverdue = (invoice) => {
    billingApi.changeInvoiceStatus(invoice._id, 'overdue').then(loadInvoices).catch(() => { });
  };

  const handleCancel = (invoice) => {
    billingApi.changeInvoiceStatus(invoice._id, 'cancelled').then(loadInvoices).catch(() => { });
  };

  // Build the 4 KPI card objects from the overview response
  const kpiCards = overview
    ? [
      {
        label: 'Total Revenue',
        value: currency(overview.totalRevenue),
        color: COLORS.accentOrange,
        trend: overview.revenueGrowthPct != null
          ? `${overview.revenueGrowthPct > 0 ? '+' : ''}${overview.revenueGrowthPct}% vs last month`
          : null,
      },
      {
        label: 'Pending Payments',
        value: currency(overview.pendingAmount),
        color: COLORS.statusPending,
        sub: `${overview.pendingCount} Transactions`,
      },
      {
        label: 'Paid Invoices',
        value: String(overview.paidInvoicesCount),
        color: COLORS.statusReady,
        sub: 'This month',
      },
      {
        label: 'Overdue',
        value: String(overview.overdueCount),
        color: COLORS.error,
        sub: 'Needs Attention',
        subColor: COLORS.error,
      },
    ]
    : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Page header — only "Create Invoice" remains */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <T variant="displayLg" sx={{ color: COLORS.primary }}>Billing & Payments</T>
          <T variant="bodyLg" sx={{ color: COLORS.secondary, mt: 0.5 }}>Monitor revenue streams and manage restaurant invoices.</T>
        </Box>

        <Box
          onClick={onCreateInvoice}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.25,
            bgcolor: COLORS.accentOrange, color: COLORS.white,
            borderRadius: '12px', fontWeight: 600, cursor: 'pointer', ...TYPE.bodyMd,
            boxShadow: `0 8px 16px ${COLORS.accentOrange}33`,
            transition: 'transform 0.1s', '&:active': { transform: 'scale(0.97)' },
          }}
        >
          <ReceiptIcon sx={{ fontSize: 18 }} /> Create Invoice
        </Box>
      </Box>

      {/* 4 KPI cards row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {(kpiCards.length ? kpiCards : Array.from({ length: 4 })).map((card, i) => (
          <Grid key={card?.label || i} size={{ xs: 12, sm: 6, md: 3 }}>
            {card ? <KpiCard card={card} /> : (
              <Box sx={{ height: 96, borderRadius: '16px', bgcolor: COLORS.surfaceContainerLow }} />
            )}
          </Grid>
        ))}
      </Grid>

      {/* Chart + Quick Performance row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <RevenueChart data={trend} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <QuickPerformance overview={overview} />
        </Grid>
      </Grid>

      {/* Invoices table — compact 5-row preview, "View All" opens the full list */}
      <InvoicesTable
        invoices={invoices}
        loading={loadingInvoices}
        onRowClick={onRowClick}
        onMarkPaid={handleMarkPaid}
        onMarkOverdue={handleMarkOverdue}
        onCancel={handleCancel}
        compact
        onViewAll={onViewAll}
      />
    </Box>
  );
};

export default BillingDashboardPage;