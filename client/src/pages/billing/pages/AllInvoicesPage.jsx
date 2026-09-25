// =============================================================================
// pages/AllInvoicesPage.jsx
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/pages/AllInvoicesPage.jsx
//
// PAGE 4 — opened from the dashboard's "View All Invoices" link. Built
// from your uploaded Stitch HTML ("Lumiere | Invoice Management"), with
// the outer sidebar/topnav dropped (AdminDashboard already provides
// those) and every "$" swapped for "₹" via the shared currency() helper.
//
// "More Filters" button has been removed per your instruction.
//
// DATE RANGE FILTERING: BILLING_API.pdf's GET /invoices only documents
// status/search/page/limit params — there's no dateFrom/dateTo support
// on the server. So instead of sending date params the backend would
// just ignore, this filters BY DATE ON THE CLIENT:
//   - Whenever a date range is set, we fetch a larger batch (up to 500
//     invoices matching the current status/search) in one request,
//     filter that batch by createdAt locally, then paginate the
//     filtered result ourselves (20 per page, same as usual).
//   - With no date range set, it's back to normal server-side pagination.
// This works for "1 day" (set From = To) just as well as a longer range.
// =============================================================================
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Grid, TextField, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { COLORS, T, TYPE, cardSx, inputSx, currency } from '../theme';
import * as billingApi from '../billingapi';
import AllInvoicesTable from '../components/Allinvoicestable';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
];

const PAGE_SIZE = 20;

const AllInvoicesPage = ({ onBack, onCreateInvoice, onRowClick }) => {
  const [overview, setOverview] = useState(null);

  // Raw data from the server for the current status/search (and, when a
  // date range is active, a much bigger batch so we can filter locally)
  const [rawInvoices, setRawInvoices] = useState([]);
  const [rawTotal, setRawTotal] = useState(0);
  const [rawPages, setRawPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const hasDateFilter = Boolean(dateFrom || dateTo);

  useEffect(() => {
    billingApi.getOverview().then(setOverview).catch(() => setOverview(null));
  }, []);

  const loadInvoices = useCallback(() => {
    setLoading(true);
    // With a date filter active we can't rely on the server's page
    // math (it doesn't know about the date filter), so pull a big
    // batch instead and paginate client-side after filtering.
    const params = hasDateFilter
      ? { status: statusFilter, search, page: 1, limit: 500 }
      : { status: statusFilter, search, page, limit: PAGE_SIZE };

    billingApi
      .getInvoices(params)
      .then((res) => {
        setRawInvoices(res.invoices || []);
        setRawTotal(res.total || 0);
        setRawPages(res.pages || 1);
      })
      .catch(() => {
        setRawInvoices([]);
        setRawTotal(0);
        setRawPages(1);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search, page, hasDateFilter]);

  useEffect(() => {
    const timer = setTimeout(loadInvoices, 300); // small debounce for the search box
    return () => clearTimeout(timer);
  }, [loadInvoices]);

  // Apply the date-range filter (client-side) and work out the final
  // page of invoices + total/pages to actually display
  const { pageInvoices, total, pages } = useMemo(() => {
    if (!hasDateFilter) {
      return { pageInvoices: rawInvoices, total: rawTotal, pages: rawPages };
    }
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : -Infinity;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : Infinity;
    const filtered = rawInvoices.filter((inv) => {
      const t = new Date(inv.createdAt).getTime();
      return t >= fromTime && t <= toTime;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return { pageInvoices: slice, total: filtered.length, pages: totalPages };
  }, [rawInvoices, rawTotal, rawPages, hasDateFilter, dateFrom, dateTo, page]);

  // Changing the status tab, search term, or date range resets back to page 1
  const handleStatusTab = (value) => { setStatusFilter(value); setPage(1); };
  const handleSearch = (value) => { setSearch(value); setPage(1); };
  const handleDateFrom = (value) => { setDateFrom(value); setPage(1); };
  const handleDateTo = (value) => { setDateTo(value); setPage(1); };
  const clearDates = () => { setDateFrom(''); setDateTo(''); setPage(1); };

  const handleExportCsv = () => {
    billingApi
      .exportInvoicesCsv({ status: statusFilter, search })
      .then((blob) => billingApi.downloadCsvBlob(blob, 'invoices.csv'))
      .catch(() => { });
  };

  const handleMarkPaid = (invoice) => {
    billingApi.addPayment(invoice._id, { paymentMethod: invoice.paymentMethod || 'cash', tipAmount: 0 }).then(loadInvoices).catch(() => { });
  };
  const handleMarkOverdue = (invoice) => {
    billingApi.changeInvoiceStatus(invoice._id, 'overdue').then(loadInvoices).catch(() => { });
  };
  const handleCancel = (invoice) => {
    billingApi.changeInvoiceStatus(invoice._id, 'cancelled').then(loadInvoices).catch(() => { });
  };

  const kpiCards = overview
    ? [
      {
        label: 'Total Revenue', value: currency(overview.totalRevenue), icon: TrendingUpIcon, color: COLORS.statusReady,
        note: overview.revenueGrowthPct != null ? `${overview.revenueGrowthPct > 0 ? '+' : ''}${overview.revenueGrowthPct}% from last month` : null,
      },
      {
        label: 'Outstanding', value: currency(overview.pendingAmount), icon: ScheduleIcon, color: COLORS.accentOrange,
        note: `${overview.pendingCount} invoices pending`,
      },
      {
        label: 'Average Check', value: currency(overview.averageBill), icon: InfoIcon, color: COLORS.secondary,
        note: `${overview.paidInvoicesCount} invoices this month`,
      },
      {
        label: 'Overdue Alerts', value: String(overview.overdueCount), icon: WarningIcon, color: COLORS.error,
        note: 'Requires immediate action', highlight: true,
      },
    ]
    : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box onClick={onBack} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: COLORS.primary, cursor: 'pointer' }}>
          <ArrowBackIcon sx={{ fontSize: 18 }} />
          <T variant="labelSm" sx={{ color: COLORS.primary, textTransform: 'none', fontWeight: 700 }}>Back to Dashboard</T>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <T variant="titleMd" sx={{ color: COLORS.primary }}>All Invoices</T>
        <TextField
          size="small" value={search} onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search invoices, customers..."
          InputProps={{ startAdornment: <SearchIcon sx={{ color: COLORS.secondary, fontSize: 20, mr: 1 }} /> }}
          sx={{ width: 320, ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], borderRadius: '999px' } }}
        />
      </Box>

      {/* Actions & Filters bar — "More Filters" removed, calendar is now a real date-range picker */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Status pill tabs */}
          <Box sx={{ display: 'flex', bgcolor: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: '12px', p: 0.5, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            {STATUS_TABS.map((tab) => (
              <Box
                key={tab.value}
                onClick={() => handleStatusTab(tab.value)}
                sx={{
                  px: 2, py: 1, borderRadius: '8px', cursor: 'pointer', ...TYPE.bodyMd,
                  fontWeight: statusFilter === tab.value ? 700 : 500,
                  bgcolor: statusFilter === tab.value ? COLORS.surfaceHighlight : 'transparent',
                  color: statusFilter === tab.value ? COLORS.primary : COLORS.secondary,
                }}
              >
                {tab.label}
              </Box>
            ))}
          </Box>

          {/* Real date-range picker — clicking either field opens the
              browser's native calendar. Set only "From" for open-ended,
              or From = To for a single day. */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, bgcolor: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <CalendarTodayIcon sx={{ fontSize: 18, color: COLORS.secondary }} />
            <Box
              component="input"
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateFrom(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: COLORS.onSurface, cursor: 'pointer', fontFamily: 'inherit' }}
            />
            <T variant="bodyMd" sx={{ color: COLORS.secondary }}>to</T>
            <Box
              component="input"
              type="date"
              value={dateTo}
              onChange={(e) => handleDateTo(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: COLORS.onSurface, cursor: 'pointer', fontFamily: 'inherit' }}
            />
            {hasDateFilter && (
              <IconButton size="small" onClick={clearDates}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            onClick={handleExportCsv}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: COLORS.white,
              border: `1px solid ${COLORS.border}`, borderRadius: '12px', color: COLORS.secondary, cursor: 'pointer',
              '&:hover': { bgcolor: COLORS.surfaceContainerLow },
            }}
          >
            <DownloadIcon sx={{ fontSize: 18 }} />
            <T variant="bodyMd">Export CSV</T>
          </Box>
          <Box
            onClick={onCreateInvoice}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1, bgcolor: COLORS.primary, color: COLORS.white,
              borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 16px ${COLORS.primary}33`,
              transition: 'transform 0.1s', '&:active': { transform: 'scale(0.97)' },
            }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
            <T variant="bodyMd" sx={{ fontWeight: 700 }}>Create Invoice</T>
          </Box>
        </Box>
      </Box>

      {/* KPI row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {(kpiCards.length ? kpiCards : Array.from({ length: 4 })).map((card, i) => (
          <Grid key={card?.label || i} size={{ xs: 12, md: 3 }}>
            {card ? (
              <Box sx={{ ...cardSx, ...(card.highlight ? { bgcolor: COLORS.surfaceHighlight, border: `1px solid ${COLORS.primary}33` } : {}), height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <T variant="labelSm" sx={{ color: card.highlight ? COLORS.primary : COLORS.secondary }}>{card.label}</T>
                <T variant="headlineLg" sx={{ color: card.highlight ? COLORS.error : COLORS.onSurface, mt: 0.5 }}>{card.value}</T>
                {card.note && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: card.color }}>
                    <card.icon sx={{ fontSize: 16 }} />
                    <T variant="labelSm" sx={{ color: card.color, textTransform: 'none', fontWeight: 700 }}>{card.note}</T>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ height: 110, borderRadius: '16px', bgcolor: COLORS.surfaceContainerLow }} />
            )}
          </Grid>
        ))}
      </Grid>

      {/* Full table + pagination (client-paginated when a date filter is active) */}
      <AllInvoicesTable
        invoices={pageInvoices}
        loading={loading}
        total={total}
        page={page}
        pages={pages}
        onPageChange={setPage}
        onRowClick={onRowClick}
        onMarkPaid={handleMarkPaid}
        onMarkOverdue={handleMarkOverdue}
        onCancel={handleCancel}
      />
    </Box>
  );
};

export default AllInvoicesPage;