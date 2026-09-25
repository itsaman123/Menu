// =============================================================================
// BillingView.jsx  (ROOT COMPONENT)
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/BillingView.jsx
// (Lives directly in "pages/", one level ABOVE "billing/" — every import
// below is prefixed with "./billing/...")
//
// import BillingView from './pages/BillingView';
// {activeNav === 'Billing & Invoicing' && <BillingView />}
//
// Same 3-page navigation as before (dashboard -> create-invoice -> bill
// -> auto-back-to-dashboard after print), but the data flowing between
// pages is now real API data instead of locally-built mock objects:
//
//   - Row click on the dashboard table only gives us a SUMMARY invoice
//     (no `items` array — see BILLING_API.pdf section 3). So before
//     switching to the bill page, we fetch the full detail via
//     GET /api/billing/invoices/:id.
//   - When CreateInvoicePage successfully creates an invoice, the API's
//     create response already has full item/total data, so we can go
//     straight to the bill page with no extra fetch.
// =============================================================================
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, FONT } from './billing/theme';
import * as billingApi from './billing/billingapi';
import BillingDashboardPage from './billing/pages/BillingDashboardPage';
import CreateInvoicePage from './billing/pages/CreateInvoicePage';
import CustomerBillPage from './billing/pages/CustomerBillPage';
import AllInvoicesPage from './billing/pages/AllInvoicesPage';

const BillingView = () => {
  const [page, setPage] = useState('dashboard'); // 'dashboard' | 'all-invoices' | 'create-invoice' | 'bill'
  const [activeInvoice, setActiveInvoice] = useState(null); // raw API invoice object
  const [loadingBill, setLoadingBill] = useState(false);

  const goToDashboard = () => {
    setActiveInvoice(null);
    setPage('dashboard');
  };

  // A table row was clicked -> the row only has summary fields, so fetch
  // the full invoice (with items) before showing the bill page
  const handleRowClick = (invoiceSummary) => {
    setLoadingBill(true);
    billingApi
      .getInvoiceById(invoiceSummary._id)
      .then((full) => {
        setActiveInvoice(full);
        setPage('bill');
      })
      .catch(() => { })
      .finally(() => setLoadingBill(false));
  };

  // CreateInvoicePage already gives us the full created invoice object —
  // no extra fetch needed, just show the bill page with it
  const handleGenerateInvoice = (createdInvoice) => {
    setActiveInvoice(createdInvoice);
    setPage('bill');
  };

  return (
    <Box sx={{ bgcolor: COLORS.background, minHeight: '100%', fontFamily: FONT, position: 'relative' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {page === 'dashboard' && (
            <BillingDashboardPage
              onCreateInvoice={() => setPage('create-invoice')}
              onRowClick={handleRowClick}
              onViewAll={() => setPage('all-invoices')}
            />
          )}

          {page === 'all-invoices' && (
            <AllInvoicesPage
              onBack={goToDashboard}
              onCreateInvoice={() => setPage('create-invoice')}
              onRowClick={handleRowClick}
            />
          )}

          {page === 'create-invoice' && (
            <CreateInvoicePage onBack={goToDashboard} onGenerate={handleGenerateInvoice} />
          )}

          {page === 'bill' && (
            <CustomerBillPage invoice={activeInvoice} onBack={goToDashboard} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Tiny loading overlay while fetching an invoice's full detail */}
      {loadingBill && (
        <Box
          sx={{
            position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
          }}
        >
          <Box sx={{ bgcolor: COLORS.white, borderRadius: '12px', px: 3, py: 2, fontFamily: FONT }}>
            Loading invoice…
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BillingView;