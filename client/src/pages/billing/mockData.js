// =============================================================================
// mockData.js
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/mockData.js
//
// This file used to hold fake/demo numbers (KPI cards, invoice list,
// menu items, etc). Now that BillingDashboardPage/CreateInvoicePage pull
// real data from billingApi.js, this file only keeps STATIC UI LOOKUP
// MAPS — things that translate an API enum value (e.g. "paid") into a
// color/icon/label. These never come from the server, they're just
// front-end presentation config, so they still belong here.
// =============================================================================
import PaymentsIcon from '@mui/icons-material/Payments';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ContactlessIcon from '@mui/icons-material/Contactless';
import { COLORS } from './theme';

// Table "Method" column icon, keyed by the API's paymentMethod enum
// (cash | card | upi)
export const PAYMENT_ICON = {
  cash: PaymentsIcon,
  card: CreditCardIcon,
  upi: ContactlessIcon,
};

// Status chip color + label, keyed by the API's status enum
// (draft | pending | paid | overdue | cancelled)
export const STATUS_STYLE = {
  draft: { bg: COLORS.secondary, label: 'Draft' },
  pending: { bg: COLORS.statusPending, label: 'Pending' },
  paid: { bg: COLORS.statusReady, label: 'Paid' },
  overdue: { bg: COLORS.error, label: 'Overdue' },
  cancelled: { bg: COLORS.secondary, label: 'Cancelled' },
};

// Customer-type display label, keyed by the API's customerType enum
// (walk-in | reservation | corporate)
export const CUSTOMER_TYPE_LABEL = {
  'walk-in': 'Walk-in Customer',
  reservation: 'Reserved Table',
  corporate: 'Corporate Account',
};

// Options for the dashboard's status-filter dropdown
export const STATUS_FILTER_OPTIONS = ['', 'draft', 'pending', 'paid', 'overdue', 'cancelled'];

// Options for the GST % field on the Create Invoice page
export const GST_OPTIONS = [18, 5, 0];

// Quick-add catalog shown on the Create Invoice page (manual/walk-in mode)
// so the admin has some common items to tap instead of typing every one
// from scratch. There's no "menu catalog" endpoint in BILLING_API.pdf, so
// this stays as a small static list — feel free to extend it, or swap it
// for a real menu-items API call later if one becomes available.
export const QUICK_ADD_ITEMS = [
  { id: 'risotto', name: 'Truffle Risotto', price: 24.0 },
  { id: 'steak', name: 'Steak Frites', price: 28.5 },
  { id: 'wine', name: 'Chardonnay (Bottle)', price: 32.0 },
  { id: 'water', name: 'Sparkling Water', price: 9.0 },
];