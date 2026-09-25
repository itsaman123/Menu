// ---------------------------------------------------------------------------
// Design tokens (from Lumiere design system) — shared across all inventory
// sub-components so everything stays visually consistent.
//
// Constants/helpers only (no components) so Vite Fast Refresh can treat
// inventoryShared.jsx as a component-only module. See inventoryShared.jsx
// for the shared T/LoadingBlock/EmptyState components.
// ---------------------------------------------------------------------------
export const COLORS = {
  background: '#fdf9f4',
  surfaceContainerLow: '#f7f3ee',
  surfaceContainerHigh: '#ebe8e3',
  onSurface: '#1c1c19',
  onSurfaceVariant: '#564339',
  secondary: '#5e5e5e',
  outlineVariant: '#ddc1b4',
  border: '#e5e7eb',
  primary: '#783100',
  primaryContainer: '#9d4300',
  accentOrange: '#f97316',
  surfaceHighlight: '#FFF3E8',
  statusReady: '#16a34a',
  statusPreparing: '#ea580c',
  statusPending: '#2563eb',
  error: '#ba1a1a',
  white: '#ffffff',
};

export const FONT = '"Be Vietnam Pro", "Roboto", sans-serif';

export const TYPE = {
  displayLg: { fontFamily: FONT, fontSize: 32, fontWeight: 600, lineHeight: '40px', letterSpacing: '-0.02em' },
  headlineLg: { fontFamily: FONT, fontSize: 28, fontWeight: 600, lineHeight: '36px', letterSpacing: '-0.02em' },
  titleMd: { fontFamily: FONT, fontSize: 20, fontWeight: 600, lineHeight: '28px' },
  navLg: { fontFamily: FONT, fontSize: 16, fontWeight: 500, lineHeight: '24px', textTransform: 'none' },
  bodyLg: { fontFamily: FONT, fontSize: 16, fontWeight: 400, lineHeight: '24px' },
  bodyMd: { fontFamily: FONT, fontSize: 14, fontWeight: 400, lineHeight: '20px' },
  labelSm: { fontFamily: FONT, fontSize: 12, fontWeight: 600, lineHeight: '16px', letterSpacing: '0.04em', textTransform: 'uppercase' },
};

export const cardSx = {
  bgcolor: COLORS.white,
  borderRadius: '16px',
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  p: 3,
};

// Shared MUI TextField styling override so inputs match the Lumiere look
export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontFamily: FONT,
    bgcolor: COLORS.surfaceContainerLow,
    '& fieldset': { borderColor: `${COLORS.outlineVariant}55` },
    '&:hover fieldset': { borderColor: COLORS.primary },
    '&.Mui-focused fieldset': { borderColor: COLORS.primary },
  },
  '& .MuiInputLabel-root': { fontFamily: FONT },
  '& .MuiInputBase-input': { fontFamily: FONT },
};

// ---------------------------------------------------------------------------
// Status / type metadata
// ---------------------------------------------------------------------------
export const INGREDIENT_STATUS_META = {
  optimal: { label: 'Optimal', color: COLORS.statusReady },
  'low-stock': { label: 'Low Stock', color: COLORS.statusPreparing },
  'out-of-stock': { label: 'Out of Stock', color: COLORS.error },
};

export const PO_STATUS_META = {
  draft: { label: 'Draft', color: COLORS.secondary, progress: 8 },
  ordered: { label: 'Ordered', color: COLORS.statusPending, progress: 35 },
  'in-transit': { label: 'In Transit', color: COLORS.accentOrange, progress: 70 },
  received: { label: 'Received', color: COLORS.statusReady, progress: 100 },
  cancelled: { label: 'Cancelled', color: COLORS.error, progress: 0 },
};

export const PO_STATUSES = ['draft', 'ordered', 'in-transit', 'received', 'cancelled'];
export const OPEN_PO_STATUSES = ['draft', 'ordered', 'in-transit'];
export const ADJUST_TYPES = ['adjustment', 'waste', 'audit'];

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
const CURRENCY = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
export const fmtMoney = (n) => CURRENCY.format(Number(n) || 0);
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—');

export const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
