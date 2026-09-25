// =============================================================================
// pages/CustomerBillPage.jsx
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/pages/CustomerBillPage.jsx
//
// PAGE 3 — printable receipt/bill preview.
// Takes an `invoice` prop — the raw object exactly as returned by either
// POST /api/billing/invoices (just created) or GET /api/billing/invoices/:id
// (opened from a table row) — and maps it into display fields using
// mapApiInvoiceToBill() from billHelpers.js.
//
// Also has a "Mark as Paid" button (only shown while the invoice is
// still pending/overdue) which calls POST /api/billing/invoices/:id/payment
// — this is the natural place for it since you're already looking at
// the specific invoice.
//
// Print behaviour is unchanged: clicking "Print Receipt" opens the
// browser print dialog, and the 'afterprint' event (fires once that
// dialog closes, whether printed or cancelled) automatically navigates
// back to the dashboard.
// =============================================================================
import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Grid } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { COLORS, T, TYPE, currency } from '../theme';
import { mapApiInvoiceToBill } from '../billHelpers';
import * as billingApi from '../billingapi';
import PrintReceipt from '../../../components/PrintReceipt';

const CustomerBillPage = ({ invoice, onBack }) => {
  const [markingPaid, setMarkingPaid] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(invoice);

  useEffect(() => setCurrentInvoice(invoice), [invoice]);

  // Auto-return to the dashboard once the print dialog closes
  useEffect(() => {
    const handleAfterPrint = () => onBack();
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [onBack]);

  // Inject a print rule that hides EVERYTHING on the page except the
  // receipt card itself — this is what stops AdminDashboard's sidebar
  // and top navbar (which live outside this component entirely) from
  // showing up in the printout. The old ".no-print { display:none }"
  // approach only hid elements *inside* BillingView, not the app shell
  // around it, so the sidebar was still printing before this.
  useEffect(() => {
    const styleId = 'lumiere-bill-print-isolate';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        #print-receipt, #print-receipt * { visibility: visible !important; }
        #print-receipt {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  if (!currentInvoice) return null;
  const bill = mapApiInvoiceToBill(currentInvoice);
  const dateStr = bill.date.toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' });
  const timeStr = bill.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const canMarkPaid = bill.status === 'pending' || bill.status === 'overdue';

  const handlePrint = async () => {
    if (canMarkPaid && !markingPaid) {
      setMarkingPaid(true);
      try {
        const updated = await billingApi.addPayment(bill._id, { paymentMethod: bill.method || 'cash', tipAmount: 0 });
        setCurrentInvoice(updated);
      } catch (err) {
        console.error('Failed to auto-mark as paid on print:', err);
      } finally {
        setMarkingPaid(false);
      }
    }
    window.print();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        <Box
          className="no-print"
          onClick={onBack}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2, color: COLORS.primary, cursor: 'pointer', width: 'fit-content' }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
          <T variant="labelSm" sx={{ color: COLORS.primary, textTransform: 'none', fontWeight: 700 }}>Back to Billing</T>
        </Box>

        {/* className="printable-bill" — this exact box is the only thing
            left visible on the page when Print Receipt is clicked */}
        <Box className="printable-bill" sx={{ bgcolor: COLORS.white, borderRadius: '16px', border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Box sx={{ height: 8, bgcolor: bill.status === 'paid' ? COLORS.statusReady : `${COLORS.primary}1A`, width: '100%' }} />
          <Box sx={{ px: 4, pb: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3, mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <Box sx={{ width: 64, height: 64, bgcolor: COLORS.surfaceHighlight, borderRadius: '50%', border: `1px solid ${COLORS.outlineVariant}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RestaurantIcon sx={{ color: COLORS.primary, fontSize: 32 }} />
                </Box>
              </Box>
              <T variant="headlineLg" sx={{ color: COLORS.primary }}>{bill.restaurantName}</T>
              <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'uppercase', letterSpacing: '0.15em', mt: 0.5 }}>Receipt</T>
              {bill.status === 'paid' && (
                <Box sx={{ mt: 1, display: 'inline-block', px: 2, py: 0.5, bgcolor: `${COLORS.statusReady}15`, color: COLORS.statusReady, borderRadius: '999px', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  ✓ PAID RECEIPT
                </Box>
              )}
            </Box>

            <Box sx={{ borderTop: `1px dashed ${COLORS.outlineVariant}`, borderBottom: `1px dashed ${COLORS.outlineVariant}`, py: 2, mb: 3 }}>
              <Grid container rowSpacing={1.5}>
                <Grid size={6}>
                  <T variant="labelSm" sx={{ color: COLORS.secondary }}>Bill No.</T>
                  <T variant="bodyMd" sx={{ fontWeight: 700 }}>#{bill.billNo}</T>
                </Grid>
                <Grid size={6} sx={{ textAlign: 'right' }}>
                  <T variant="labelSm" sx={{ color: COLORS.secondary }}>Table</T>
                  <T variant="bodyMd" sx={{ fontWeight: 700 }}>{bill.table}</T>
                </Grid>
                <Grid size={6}>
                  <T variant="labelSm" sx={{ color: COLORS.secondary }}>Date & Time</T>
                  <T variant="bodyMd">{dateStr} | {timeStr}</T>
                </Grid>
                <Grid size={6} sx={{ textAlign: 'right' }}>
                  <T variant="labelSm" sx={{ color: COLORS.secondary }}>Customer</T>
                  <T variant="bodyMd">{bill.customer}</T>
                </Grid>
              </Grid>
            </Box>

            <Table size="small" sx={{ mb: 3 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...TYPE.labelSm, color: COLORS.secondary, border: 0, px: 0 }}>Items</TableCell>
                  <TableCell align="right" sx={{ ...TYPE.labelSm, color: COLORS.secondary, border: 0, px: 0 }}>Qty</TableCell>
                  <TableCell align="right" sx={{ ...TYPE.labelSm, color: COLORS.secondary, border: 0, px: 0 }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bill.items.map((it, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ borderColor: COLORS.surfaceContainerHigh, px: 0, ...TYPE.bodyMd, fontWeight: 600 }}>{it.name}</TableCell>
                    <TableCell align="right" sx={{ borderColor: COLORS.surfaceContainerHigh, px: 0, ...TYPE.bodyMd }}>{it.qty}</TableCell>
                    <TableCell align="right" sx={{ borderColor: COLORS.surfaceContainerHigh, px: 0, ...TYPE.bodyMd, fontWeight: 600 }}>{currency(it.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box sx={{ bgcolor: COLORS.surfaceContainerLow, borderRadius: '12px', p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <T variant="bodyMd" sx={{ color: COLORS.secondary }}>Subtotal</T>
                <T variant="bodyMd" sx={{ fontWeight: 600 }}>{currency(bill.subtotal)}</T>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <T variant="bodyMd" sx={{ color: COLORS.secondary }}>GST ({bill.gstRate}%)</T>
                <T variant="bodyMd" sx={{ fontWeight: 600 }}>{currency(bill.gstAmount)}</T>
              </Box>
              {bill.discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pb: 1, borderBottom: `1px solid ${COLORS.outlineVariant}` }}>
                  <T variant="bodyMd" sx={{ color: COLORS.accentOrange }}>Discount ({bill.discountRate}%)</T>
                  <T variant="bodyMd" sx={{ fontWeight: 600, color: COLORS.accentOrange }}>-{currency(bill.discountAmount)}</T>
                </Box>
              )}
              {bill.tipAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pb: 1, borderBottom: `1px solid ${COLORS.outlineVariant}` }}>
                  <T variant="bodyMd" sx={{ color: COLORS.secondary }}>Tip</T>
                  <T variant="bodyMd" sx={{ fontWeight: 600 }}>{currency(bill.tipAmount)}</T>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <T variant="titleMd" sx={{ color: COLORS.primary }}>Grand Total</T>
                <T variant="headlineLg" sx={{ color: COLORS.primary }}>{currency(bill.total)}</T>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <T variant="bodyMd" sx={{ fontStyle: 'italic' }}>"Thank you for dining with us!"</T>
            </Box>
          </Box>
        </Box>


        <Box
          className="no-print"
          onClick={handlePrint}
          sx={{
            mt: 2, py: 1.25, textAlign: 'center', borderRadius: '999px', fontWeight: 700, cursor: markingPaid ? 'wait' : 'pointer',
            bgcolor: COLORS.accentOrange, color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
            transition: 'transform 0.1s', '&:active': { transform: 'scale(0.97)' },
          }}
        >
          <PrintIcon sx={{ fontSize: 18 }} /> Print Receipt & Mark Paid
        </Box>
      </Box>

      {/* Hidden print-only receipt component. Automatically styled for 72mm thermal printers */}
      <PrintReceipt order={currentInvoice} restaurantName={bill.restaurantName} />
    </Box>
  );
};

export default CustomerBillPage;