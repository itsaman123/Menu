// =============================================================================
// components/InvoicesTable.jsx
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/components/InvoicesTable.jsx
//
// Renders the list returned by GET /api/billing/invoices. Field names
// now match the API exactly (invoiceNumber, customerName, customerType,
// tableNumber, totalAmount, paymentMethod, status) instead of the old
// shortened mock field names.
//
// The "..." menu on each row is where the POST/PUT actions live now
// that the dashboard's standalone "Add Payment" button is gone:
//   - Mark as Paid   -> POST /api/billing/invoices/:id/payment
//   - Mark Overdue   -> PUT  /api/billing/invoices/:id/status
//   - Cancel Invoice -> PUT  /api/billing/invoices/:id/status
// These three handlers are passed down as props from
// BillingDashboardPage.jsx, which owns the invoices list and knows how
// to refresh it after an action succeeds.
//
// CHANGE: the "Method" column (header + body cell) is commented out per
// request — the table no longer shows the payment method. colSpan on the
// loading/empty rows dropped from 7 to 6 to match the now-6-column table.
// To bring it back later, just uncomment the two blocks marked below and
// bump colSpan back to 7.
// =============================================================================
import React, { useState } from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Avatar, Chip, IconButton, Menu, MenuItem, ListItemIcon } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CancelIcon from '@mui/icons-material/Cancel';
import { COLORS, FONT, T, TYPE, cardSx } from '../theme';
import { PAYMENT_ICON, STATUS_STYLE, CUSTOMER_TYPE_LABEL } from '../mockData';

// Small "..." action menu, kept inside this file since it's only used here
const RowActionsMenu = ({ invoice, onMarkPaid, onMarkOverdue, onCancel }) => {
  const [anchorEl, setAnchorEl] = useState(null);
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
      <Menu anchorEl={anchorEl} open={open} onClose={(e) => { setAnchorEl(null); }} onClick={(e) => e.stopPropagation()}>
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

const InvoicesTable = ({
  invoices,
  loading,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
  onExportCsv,
  onRowClick,
  onMarkPaid,
  onMarkOverdue,
  onCancel,
  compact = false,
  onViewAll,
}) => (
  <Box sx={{ ...cardSx, p: 0, overflow: 'hidden' }}>
    {/* Header row: title + (full mode only) status filter + search + export */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: `1px solid ${COLORS.border}`, flexWrap: 'wrap', gap: 2 }}>
      <T variant="titleMd">Recent Invoices</T>
      {!compact && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box
            component="input"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search invoice / customer / table..."
            sx={{
              px: 2, py: 1, border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '10px',
              fontFamily: FONT, fontSize: 13, outline: 'none', width: 220,
              '&:focus': { borderColor: COLORS.primary },
            }}
          />
          <Box
            component="select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            sx={{
              px: 1.5, py: 1, border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '10px',
              fontFamily: FONT, fontSize: 13, outline: 'none', bgcolor: COLORS.white, cursor: 'pointer',
            }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </Box>
          <Box
            onClick={onExportCsv}
            sx={{
              px: 2, py: 1, border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '10px',
              ...TYPE.labelSm, textTransform: 'none', cursor: 'pointer',
              '&:hover': { bgcolor: COLORS.surfaceContainerLow },
            }}
          >
            Export CSV
          </Box>
        </Box>
      )}
    </Box>

    <Table>
      <TableHead>
        <TableRow sx={{ bgcolor: COLORS.surfaceContainerLow }}>
          {/* 'Method' removed from this header list — was here between 'Amount' and 'Status' */}
          {['Invoice #', 'Customer', 'Table', 'Amount', 'Status', ''].map((h) => (
            <TableCell key={h} sx={{ ...TYPE.labelSm, color: COLORS.secondary, border: 'none' }}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {loading && (
          <TableRow>
            {/* colSpan dropped from 7 to 6 — one less column now that Method is gone */}
            <TableCell colSpan={6} sx={{ border: 'none', py: 4, textAlign: 'center' }}>
              <T variant="bodyMd" sx={{ color: COLORS.secondary }}>Loading invoices…</T>
            </TableCell>
          </TableRow>
        )}

        {!loading && invoices.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} sx={{ border: 'none', py: 4, textAlign: 'center' }}>
              <T variant="bodyMd" sx={{ color: COLORS.secondary }}>No invoices found</T>
            </TableCell>
          </TableRow>
        )}

        {!loading && invoices.map((inv) => {
          const MethodIcon = PAYMENT_ICON[inv.paymentMethod];
          const status = STATUS_STYLE[inv.status] || STATUS_STYLE.pending;
          const initials = (inv.customerName || '?').slice(0, 2).toUpperCase();

          return (
            <TableRow
              key={inv._id}
              onClick={() => onRowClick(inv)}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: COLORS.surfaceContainerLow }, '&:last-child td': { borderBottom: 0 } }}
            >
              <TableCell sx={{ borderColor: COLORS.border, ...TYPE.bodyMd, fontWeight: 600 }}>{inv.invoiceNumber}</TableCell>

              <TableCell sx={{ borderColor: COLORS.border }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 11, fontWeight: 700, bgcolor: `${COLORS.primary}1A`, color: COLORS.primary }}>
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

              <TableCell align="center" sx={{ borderColor: COLORS.border, ...TYPE.bodyMd }}>{inv.tableNumber || '—'}</TableCell>
              <TableCell sx={{ borderColor: COLORS.border, ...TYPE.bodyMd, fontWeight: 700 }}>₹{inv.totalAmount.toLocaleString('en-IN')}</TableCell>

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

    <Box sx={{ display: 'flex', justifyContent: compact ? 'center' : 'space-between', alignItems: 'center', px: 3, py: 2, borderTop: `1px solid ${COLORS.border}` }}>
      {compact ? (
        <Box
          onClick={onViewAll}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer',
            color: COLORS.primary, fontWeight: 700, ...TYPE.bodyMd,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          View All Invoices →
        </Box>
      ) : (
        <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>Showing {invoices.length} invoice(s)</T>
      )}
    </Box>
  </Box>
);

export default InvoicesTable;