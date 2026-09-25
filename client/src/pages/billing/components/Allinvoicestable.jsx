// =============================================================================
// components/AllInvoicesTable.jsx
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/components/AllInvoicesTable.jsx
//
// The full data table for the "All Invoices" page (built from your
// uploaded Stitch HTML). Compared to the dashboard's compact
// InvoicesTable, this one has:
//   - a "Date" column
//   - a real pagination footer wired to the API's page/pages/total
//     fields from GET /api/billing/invoices
// All amounts use the shared currency() helper (₹), not the $ from the
// original HTML mock.
//
// CHANGE: the "Method" column (header + body cell) is commented out per
// request. colSpan on the loading/empty rows dropped from 8 to 7 to match
// the now-7-column table. To bring it back later, uncomment the two
// blocks marked below and bump colSpan back to 8.
// =============================================================================
import React from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Avatar, Chip, IconButton, Menu, MenuItem, ListItemIcon } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CancelIcon from '@mui/icons-material/Cancel';
import { COLORS, FONT, T, TYPE, cardSx, currency } from '../theme';
import { PAYMENT_ICON, STATUS_STYLE, CUSTOMER_TYPE_LABEL } from '../mockData';

const RowActionsMenu = ({ invoice, onMarkPaid, onMarkOverdue, onCancel }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const isClosed = invoice.status === 'paid' || invoice.status === 'cancelled';

  const handleAction = (fn) => (e) => {
    e.stopPropagation();
    setAnchorEl(null);
    fn(invoice);
  };

  return (
    <>
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}>
        <MoreVertIcon sx={{ color: COLORS.secondary, fontSize: 20 }} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} onClick={(e) => e.stopPropagation()}>
        <MenuItem onClick={handleAction(onMarkPaid)} disabled={isClosed} sx={{ fontFamily: FONT }}>
          <ListItemIcon><CheckCircleIcon fontSize="small" sx={{ color: COLORS.statusReady }} /></ListItemIcon>
          Mark as Paid
        </MenuItem>
        <MenuItem onClick={handleAction(onMarkOverdue)} disabled={isClosed} sx={{ fontFamily: FONT }}>
          <ListItemIcon><ScheduleIcon fontSize="small" sx={{ color: COLORS.error }} /></ListItemIcon>
          Mark Overdue
        </MenuItem>
        <MenuItem onClick={handleAction(onCancel)} disabled={isClosed} sx={{ fontFamily: FONT }}>
          <ListItemIcon><CancelIcon fontSize="small" sx={{ color: COLORS.secondary }} /></ListItemIcon>
          Cancel Invoice
        </MenuItem>
      </Menu>
    </>
  );
};

// Builds a compact list of page numbers to show around the current page,
// e.g. [1, '…', 4, 5, 6, '…', 20]
const buildPageList = (current, total) => {
  const pages = [];
  const push = (p) => pages.push(p);
  const windowSize = 1;

  push(1);
  if (current - windowSize > 2) push('…');
  for (let p = Math.max(2, current - windowSize); p <= Math.min(total - 1, current + windowSize); p++) push(p);
  if (current + windowSize < total - 1) push('…');
  if (total > 1) push(total);

  return pages;
};

const AllInvoicesTable = ({
  invoices,
  loading,
  total,
  page,
  pages,
  onPageChange,
  onRowClick,
  onMarkPaid,
  onMarkOverdue,
  onCancel,
}) => (
  <Box sx={{ ...cardSx, p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ p: 3, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <T variant="titleMd">Recent Invoices</T>
      <T variant="bodyMd" sx={{ color: COLORS.secondary }}>
        Showing {invoices.length ? (page - 1) * 20 + 1 : 0}-{(page - 1) * 20 + invoices.length} of {total} results
      </T>
    </Box>

    <Box sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: COLORS.surfaceContainerLow }}>
            {/* 'Method' removed from this header list — was here between 'Date' and 'Status' */}
            {['Invoice #', 'Customer', 'Table', 'Date', 'Amount', 'Status', ''].map((h) => (
              <TableCell key={h} sx={{ ...TYPE.labelSm, color: COLORS.secondary, border: 'none' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && (
            <TableRow>
              {/* colSpan dropped from 8 to 7 — one less column now that Method is gone */}
              <TableCell colSpan={7} sx={{ border: 'none', py: 4, textAlign: 'center' }}>
                <T variant="bodyMd" sx={{ color: COLORS.secondary }}>Loading invoices…</T>
              </TableCell>
            </TableRow>
          )}
          {!loading && invoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} sx={{ border: 'none', py: 4, textAlign: 'center' }}>
                <T variant="bodyMd" sx={{ color: COLORS.secondary }}>No invoices found</T>
              </TableCell>
            </TableRow>
          )}
          {!loading && invoices.map((inv) => {
            const MethodIcon = PAYMENT_ICON[inv.paymentMethod];
            const status = STATUS_STYLE[inv.status] || STATUS_STYLE.pending;
            const initials = (inv.customerName || '?').slice(0, 2).toUpperCase();
            const dateStr = inv.createdAt
              ? new Date(inv.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '—';

            return (
              <TableRow
                key={inv._id}
                onClick={() => onRowClick(inv)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: COLORS.surfaceHighlight }, '&:last-child td': { borderBottom: 0 } }}
              >
                <TableCell sx={{ borderColor: COLORS.border, ...TYPE.bodyMd, fontWeight: 700 }}>{inv.invoiceNumber}</TableCell>
                <TableCell sx={{ borderColor: COLORS.border }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 11, fontWeight: 700, bgcolor: COLORS.surfaceContainer, color: COLORS.secondary }}>
                      {initials}
                    </Avatar>
                    <Box>
                      <T variant="bodyMd" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{inv.customerName}</T>
                      <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none', fontSize: 10 }}>
                        {CUSTOMER_TYPE_LABEL[inv.customerType] || inv.customerType}
                      </T>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ borderColor: COLORS.border, ...TYPE.bodyMd, color: COLORS.secondary }}>{inv.tableNumber || '—'}</TableCell>
                <TableCell sx={{ borderColor: COLORS.border, ...TYPE.bodyMd, color: COLORS.secondary }}>{dateStr}</TableCell>
                <TableCell sx={{ borderColor: COLORS.border, ...TYPE.bodyMd, fontWeight: 700 }}>{currency(inv.totalAmount)}</TableCell>

                {/*
                <TableCell sx={{ borderColor: COLORS.border }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: COLORS.secondary }}>
                    {MethodIcon && <MethodIcon sx={{ fontSize: 18 }} />}
                    <T variant="bodyMd" sx={{ textTransform: 'capitalize' }}>{inv.paymentMethod}</T>
                  </Box>
                </TableCell>
                */}

                <TableCell sx={{ borderColor: COLORS.border }}>
                  <Chip
                    label={status.label}
                    size="small"
                    sx={{ bgcolor: `${status.bg}1A`, color: status.bg, fontWeight: 700, fontFamily: FONT, textTransform: 'uppercase' }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ borderColor: COLORS.border }}>
                  <RowActionsMenu invoice={inv} onMarkPaid={onMarkPaid} onMarkOverdue={onMarkOverdue} onCancel={onCancel} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>

    {/* Pagination footer */}
    <Box sx={{ p: 3, borderTop: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
      <T variant="bodyMd" sx={{ color: COLORS.secondary }}>Showing page {page} of {pages}</T>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <IconButton size="small" disabled={page <= 1} onClick={() => onPageChange(page - 1)} sx={{ border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '8px' }}>
          <ChevronLeftIcon sx={{ fontSize: 20 }} />
        </IconButton>
        {buildPageList(page, pages).map((p, i) =>
          p === '…' ? (
            <Box key={`ellipsis-${i}`} sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.secondary }}>…</Box>
          ) : (
            <Box
              key={p}
              onClick={() => onPageChange(p)}
              sx={{
                width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontFamily: FONT, fontSize: 14,
                bgcolor: p === page ? COLORS.primary : COLORS.white,
                color: p === page ? COLORS.white : COLORS.secondary,
                border: p === page ? 'none' : `1px solid ${COLORS.outlineVariant}`,
                '&:hover': { bgcolor: p === page ? COLORS.primary : COLORS.surfaceContainerLow },
              }}
            >
              {p}
            </Box>
          )
        )}
        <IconButton size="small" disabled={page >= pages} onClick={() => onPageChange(page + 1)} sx={{ border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '8px' }}>
          <ChevronRightIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
    </Box>
  </Box>
);

export default AllInvoicesTable;