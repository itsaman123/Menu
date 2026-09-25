// =============================================================================
// billHelpers.js
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/billHelpers.js
//
// Before this file did local subtotal/GST/discount math on the frontend.
// That's no longer needed — per BILLING_API.pdf, "the server always
// recalculates subtotal / gstAmount / discountAmount / totalAmount from
// items + the rate/discount percentages — it never trusts totals sent
// from the frontend." So every number we need already arrives fully
// computed from the API.
//
// The only job left here is RESHAPING: the API's invoice object uses
// field names like invoiceNumber/customerName/tableNumber/totalAmount,
// but CustomerBillPage was built around shorter names (billNo/customer/
// table/total). This function is the single place that translates
// between the two, so nothing else needs to know both shapes.
// =============================================================================
import { CUSTOMER_TYPE_LABEL } from './mockData';

// Takes a raw invoice object exactly as returned by:
//   - POST /api/billing/invoices        (create response)
//   - GET  /api/billing/invoices/:id    (detail response)
// and returns the shape CustomerBillPage.jsx expects.
export const mapApiInvoiceToBill = (inv) => ({
  _id: inv._id,
  billNo: inv.invoiceNumber ? inv.invoiceNumber.replace('INV-', '') : inv._id,
  customer: inv.customerName || 'Guest',
  customerTypeLabel: CUSTOMER_TYPE_LABEL[inv.customerType] || 'Walk-in Customer',
  table: inv.tableNumber ? `Table ${inv.tableNumber}` : 'Takeaway',
  server: 'Admin Manager',
  date: inv.createdAt ? new Date(inv.createdAt) : new Date(),
  // Bill preview shows each line's total (unit price * quantity)
  items: (inv.items || []).map((it) => ({
    name: it.name,
    qty: it.quantity,
    price: it.price * it.quantity,
  })),
  subtotal: inv.subtotal || 0,
  gstRate: inv.gstRatePct || 0,
  gstAmount: inv.gstAmount || 0,
  discountRate: inv.discountPct || 0,
  discountAmount: inv.discountAmount || 0,
  total: inv.totalAmount || 0,
  tipAmount: inv.tipAmount || 0,
  method: inv.paymentMethod,
  status: inv.status, // draft | pending | paid | overdue | cancelled
  restaurantName: inv.restaurantName || 'Restaurant',
});