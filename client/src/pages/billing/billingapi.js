// =============================================================================
// billingApi.js
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/billingApi.js
//
// Every network call the billing module makes lives here — nothing else
// in this folder talks to axios directly. Keeping this in one file means:
//   - Pages/components only ever call things like billingApi.getOverview()
//   - If a URL or param ever changes, you only edit this one file
//
// ASSUMPTION: your project already has a shared axios instance at
// "src/api.js" (this is the same "api" object AdminDashboard.js already
// imports as `import api from '../api'`). It's expected to already have
// the admin JWT attached via an interceptor (Authorization: Bearer <token>),
// exactly like every other /api/... call in the app. If your axios
// instance lives somewhere else, just fix the import path below.
// =============================================================================
import api from '../../api';

const BASE = '/api/billing';

// ---- 1. Dashboard KPI cards ------------------------------------------------
// GET /api/billing/overview
export const getOverview = () => api.get(`${BASE}/overview`).then((res) => res.data);

// ---- 2. Revenue chart -------------------------------------------------------
// GET /api/billing/revenue-trend?weeks=4
export const getRevenueTrend = (weeks = 4) =>
  api.get(`${BASE}/revenue-trend`, { params: { weeks } }).then((res) => res.data);

// ---- 3. Recent Invoices table -----------------------------------------------
// GET /api/billing/invoices?status=&search=&page=1&limit=20&dateFrom=&dateTo=
//
// ⚠️ dateFrom/dateTo (YYYY-MM-DD) are NOT documented in BILLING_API.pdf —
// they're sent here because the All Invoices page's date-range picker
// needs a way to filter by createdAt. If the backend doesn't read these
// query params yet, they'll just be silently ignored and every page will
// come back unfiltered. Ask your backend to add support for them on
// GET /api/billing/invoices (and ideally /invoices/export too) if this
// filter doesn't seem to do anything.
export const getInvoices = ({ status = '', search = '', page = 1, limit = 20, dateFrom = '', dateTo = '' } = {}) =>
  api.get(`${BASE}/invoices`, { params: { status, search, page, limit, dateFrom, dateTo } }).then((res) => res.data);

// GET /api/billing/invoices/export?status=&search=&dateFrom=&dateTo=  -> CSV file (blob)
export const exportInvoicesCsv = ({ status = '', search = '', dateFrom = '', dateTo = '' } = {}) =>
  api
    .get(`${BASE}/invoices/export`, { params: { status, search, dateFrom, dateTo }, responseType: 'blob' })
    .then((res) => res.data);

// GET /api/billing/invoices/:id  -> full invoice detail (used for the bill preview)
export const getInvoiceById = (id) => api.get(`${BASE}/invoices/${id}`).then((res) => res.data);

// ---- 4. Table Selection picker & Catalog (Create Invoice screen) ------------
// GET /api/billing/orders/unbilled
export const getUnbilledOrders = () => api.get(`${BASE}/orders/unbilled`).then((res) => res.data);

// GET /api/categories & GET /api/menu-items for POS catalog
export const getCategories = () => api.get('/api/categories').then((res) => res.data);
export const getMenuItems = () => api.get('/api/menu-items').then((res) => res.data);

// ---- 5. Create Invoice -------------------------------------------------------
// POST /api/billing/invoices
export const createInvoice = (payload) => api.post(`${BASE}/invoices`, payload).then((res) => res.data);

// ---- 6. Edit an invoice -------------------------------------------------------
// PUT /api/billing/invoices/:id  (only allowed while status is draft or pending)
export const updateInvoice = (id, payload) => api.put(`${BASE}/invoices/${id}`, payload).then((res) => res.data);

// ---- 7. Add Payment -----------------------------------------------------------
// POST /api/billing/invoices/:id/payment
export const addPayment = (id, { paymentMethod, tipAmount = 0 }) =>
  api.post(`${BASE}/invoices/${id}/payment`, { paymentMethod, tipAmount }).then((res) => res.data);

// ---- 8. Change status -----------------------------------------------------------
// PUT /api/billing/invoices/:id/status
export const changeInvoiceStatus = (id, status) =>
  api.put(`${BASE}/invoices/${id}/status`, { status }).then((res) => res.data);

// ---- 9. Menu Item Ordering (Drag & Drop) ----------------------------------------
// GET /api/billing/menu-item-order -> [{ itemId, position }]
export const getMenuItemOrder = () => api.get(`${BASE}/menu-item-order`).then((res) => res.data);

// PUT /api/billing/menu-item-order  -> save new ordering
export const saveMenuItemOrder = (items) =>
  api.put(`${BASE}/menu-item-order`, { items }).then((res) => res.data);

// ---- Small browser helper: turn the CSV blob from exportInvoicesCsv() into
// an actual file download, since the API just hands back raw blob data ----
export const downloadCsvBlob = (blob, filename = 'invoices.csv') => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};