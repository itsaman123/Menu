import React from 'react';
import { Box, Drawer, IconButton, Chip, TextField, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InventoryIcon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TuneIcon from '@mui/icons-material/Tune';
import { T, LoadingBlock } from './inventoryShared';
import {
  COLORS, TYPE, FONT, fieldSx,
  INGREDIENT_STATUS_META, PO_STATUS_META, PO_STATUSES,
  fmtMoney, fmtDate,
} from './inventoryTokens';
// NOTE: removed `import { StatRow, ActionBtn } from './shared';` that used to
// be here — StatRow and ActionBtn are DEFINED further down in this very file
// (see "Shared side-panel shell" section below), so importing them from
// './shared' as well was a duplicate declaration and would throw
// "Identifier 'StatRow' has already been declared" at build time.

// ---------------------------------------------------------------------------
// Ingredient detail
// ---------------------------------------------------------------------------
// CHANGES:
//   - Category chip/line removed (ingredients no longer have a category)
//   - Standalone "Adjust Stock" action button removed — that action now
//     lives inside the Edit form (see IngredientFormModal), so the `onAdjust`
//     prop this component used to take is gone too. Drop `onAdjust` from
//     wherever this component gets rendered.
export function IngredientDrawerContent({ data, onEdit, onDelete }) {
  const meta = INGREDIENT_STATUS_META[data.status] || INGREDIENT_STATUS_META.optimal;
  const supplier = data.primarySupplierId;

  return (
    <>
      <Box sx={{ height: 160, width: '100%', borderRadius: '16px', bgcolor: COLORS.surfaceContainerLow, border: `1px solid ${COLORS.outlineVariant}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {data.image ? (
          <Box component="img" src={data.image} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <InventoryIcon sx={{ fontSize: 48, color: COLORS.outlineVariant }} />
        )}
      </Box>

      <Box>
        <Chip label={meta.label} size="small" sx={{ bgcolor: `${meta.color}1A`, color: meta.color, fontWeight: 700, fontFamily: FONT, mb: 1.5, borderRadius: '999px' }} />
        <T variant="headlineLg">{data.name}</T>
        {/* Category line removed — ingredients no longer have a category */}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Box sx={{ p: 2, bgcolor: COLORS.surfaceContainerLow, borderRadius: '12px' }}>
          <T variant="labelSm" sx={{ color: COLORS.secondary }}>Current Stock</T>
          <T variant="titleMd" sx={{ fontWeight: 700 }}>{data.currentStock} {data.unit}</T>
        </Box>
        <Box sx={{ p: 2, bgcolor: COLORS.surfaceContainerLow, borderRadius: '12px' }}>
          <T variant="labelSm" sx={{ color: COLORS.secondary }}>Unit Cost</T>
          <T variant="titleMd" sx={{ fontWeight: 700 }}>{fmtMoney(data.unitCost)}</T>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <T variant="bodyLg" sx={{ fontWeight: 700, borderBottom: `1px solid ${COLORS.outlineVariant}`, pb: 1 }}>Details</T>
        <StatRow label="Reorder Level" value={`${data.reorderThreshold} ${data.unit}`} />
        <StatRow label="Total Value" value={fmtMoney(data.currentStock * data.unitCost)} />
        <StatRow label="Primary Supplier" value={supplier?.name || '—'} />
        {supplier?.phone && <StatRow label="Supplier Phone" value={supplier.phone} />}
        <StatRow label="Status" value={data.isActive ? 'Active' : 'Inactive'} valueColor={data.isActive ? COLORS.statusReady : COLORS.secondary} />
      </Box>

      {/* Adjust Stock button removed — that action now lives inside Edit */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <ActionBtn onClick={onEdit}><EditIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />Edit</ActionBtn>
        <ActionBtn danger onClick={onDelete}><DeleteOutlineIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />Delete</ActionBtn>
      </Box>
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared side-panel shell
// ---------------------------------------------------------------------------
export function SidePanel({ open, onClose, title, loading, children, footer }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, bgcolor: COLORS.white, fontFamily: FONT } }}
    >
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <T variant="titleMd">{title}</T>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {loading ? <LoadingBlock height={300} /> : children}
        </Box>
        {!loading && footer && <Box sx={{ pt: 3, mt: 'auto', display: 'flex', gap: 2 }}>{footer}</Box>}
      </Box>
    </Drawer>
  );
}

const StatRow = ({ label, value, valueColor }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <T variant="bodyMd" sx={{ color: COLORS.secondary }}>{label}</T>
    <T variant="bodyMd" sx={{ fontWeight: 600, color: valueColor }}>{value}</T>
  </Box>
);

const ActionBtn = ({ children, primary, danger, onClick, disabled }) => (
  <Box
    onClick={disabled ? undefined : onClick}
    sx={{
      flex: 1, py: 1.4, textAlign: 'center', borderRadius: '14px', fontWeight: 700, ...TYPE.bodyMd,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      transition: 'transform 0.1s', '&:active': disabled ? {} : { transform: 'scale(0.97)' },
      ...(primary
        ? { bgcolor: COLORS.primary, color: COLORS.white }
        : danger
          ? { bgcolor: `${COLORS.error}14`, color: COLORS.error }
          : { border: `1px solid ${COLORS.outlineVariant}`, color: COLORS.onSurface, '&:hover': { bgcolor: COLORS.surfaceContainerLow } }),
    }}
  >
    {children}
  </Box>
);

// ---------------------------------------------------------------------------
// Supplier detail
// ---------------------------------------------------------------------------
// CHANGES: trimmed to match the 4-field form — Name, Contact Person, Phone,
// Address. Category chip, Outstanding Payment / Active POs stat cards,
// Email, and Status have all been removed (none of them are captured by
// the form anymore, so showing them here would just be stale/empty data).
export function SupplierDrawerContent({ data, onEdit, onDelete }) {
  return (
    <>
      <Box>
        <T variant="headlineLg">{data.name}</T>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <T variant="bodyLg" sx={{ fontWeight: 700, borderBottom: `1px solid ${COLORS.outlineVariant}`, pb: 1 }}>Contact</T>
        <StatRow label="Contact Person" value={data.contactPerson || '—'} />
        <StatRow label="Phone" value={data.phone || '—'} />
        <StatRow label="Address" value={data.address || '—'} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <ActionBtn onClick={onEdit}><EditIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />Edit</ActionBtn>
        <ActionBtn danger onClick={onDelete}><DeleteOutlineIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />Delete</ActionBtn>
      </Box>
    </>
  );
}

// ---------------------------------------------------------------------------
// Purchase Order detail
// ---------------------------------------------------------------------------
export function PODrawerContent({ data, onEdit, onDelete, onReceive, onStatusChange, statusChanging }) {
  const meta = PO_STATUS_META[data.status] || PO_STATUS_META.draft;
  const isOpen = ['draft', 'ordered', 'in-transit'].includes(data.status);
  const supplier = data.supplierId;
  return (
    <>
      <Box>
        <Chip label={meta.label} size="small" sx={{ bgcolor: `${meta.color}1A`, color: meta.color, fontWeight: 700, fontFamily: FONT, mb: 1.5, borderRadius: '999px' }} />
        <T variant="headlineLg">{data.poNumber}</T>
        <T variant="bodyMd" sx={{ color: COLORS.secondary, mt: 0.5 }}>{supplier?.name}</T>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Box sx={{ p: 2, bgcolor: COLORS.surfaceContainerLow, borderRadius: '12px' }}>
          <T variant="labelSm" sx={{ color: COLORS.secondary }}>Total Amount</T>
          <T variant="titleMd" sx={{ fontWeight: 700 }}>{fmtMoney(data.totalAmount)}</T>
        </Box>
        <Box sx={{ p: 2, bgcolor: COLORS.surfaceContainerLow, borderRadius: '12px' }}>
          <T variant="labelSm" sx={{ color: COLORS.secondary }}>Est. Delivery</T>
          <T variant="titleMd" sx={{ fontWeight: 700 }}>{fmtDate(data.estimatedDeliveryDate)}</T>
        </Box>
      </Box>

      {isOpen && (
        <TextField
          select label="Status" size="small" fullWidth sx={fieldSx} value={data.status} disabled={statusChanging}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {PO_STATUSES.filter((s) => s !== 'received').map((s) => (
            <MenuItem key={s} value={s}>{PO_STATUS_META[s].label}</MenuItem>
          ))}
        </TextField>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <T variant="bodyLg" sx={{ fontWeight: 700, borderBottom: `1px solid ${COLORS.outlineVariant}`, pb: 1 }}>Items</T>
        {data.items.map((item, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: COLORS.surfaceContainerLow, borderRadius: '8px' }}>
            <Box>
              <T variant="bodyMd" sx={{ fontWeight: 600 }}>{item.name}</T>
              <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>
                {item.quantity} {item.unit} @ {fmtMoney(item.unitCost)}
                {item.receivedQuantity != null && ` · received ${item.receivedQuantity} ${item.unit}`}
              </T>
            </Box>
            <T variant="bodyMd" sx={{ fontWeight: 700 }}>{fmtMoney(item.quantity * item.unitCost)}</T>
          </Box>
        ))}
      </Box>

      {data.notes && (
        <Box>
          <T variant="labelSm" sx={{ color: COLORS.secondary, mb: 0.5 }}>Notes</T>
          <T variant="bodyMd">{data.notes}</T>
        </Box>
      )}

      {isOpen && (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <ActionBtn primary onClick={onReceive}><LocalShippingIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />Receive Order</ActionBtn>
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {isOpen && <ActionBtn onClick={onEdit}><EditIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />Edit</ActionBtn>}
        {data.status === 'draft' && <ActionBtn danger onClick={onDelete}><DeleteOutlineIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />Delete</ActionBtn>}
      </Box>
    </>
  );
}