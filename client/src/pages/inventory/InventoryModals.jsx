import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../../api';
import { T } from './inventoryShared';
import { COLORS, TYPE, FONT, fieldSx, fmtMoney } from './inventoryTokens';
// NOTE: `ADJUST_TYPES` is no longer imported here — it was only used by
// AdjustStockModal, which has been removed (its two fields, Quantity and
// Type, now live inside IngredientFormModal instead). If you still use
// ADJUST_TYPES elsewhere in inventoryTokens.js, no need to touch that file;
// this module just doesn't need it anymore.

//IngrediatLIne editor

export function IngredientLineEditor({ ingredients, lines, onChange, withUnitCost }) {
  const updateLine = (idx, patch) => onChange(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const addLine = () => onChange([...lines, { ingredientId: '', quantity: '', unitCost: '' }]);
  const removeLine = (idx) => onChange(lines.filter((_, i) => i !== idx));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <T variant="labelSm" sx={{ color: COLORS.secondary }}>Ingredients</T>
      {lines.length === 0 && (
        <T variant="bodyMd" sx={{ color: COLORS.secondary }}>No ingredients added yet.</T>
      )}
      {lines.map((line, idx) => {
        const ing = ingredients.find((i) => i._id === line.ingredientId);
        return (
          <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <TextField
              select size="small" label="Ingredient" value={line.ingredientId}
              sx={{ ...fieldSx, flex: 2, minWidth: 160 }}
              onChange={(e) => {
                const chosen = ingredients.find((i) => i._id === e.target.value);
                updateLine(idx, { ingredientId: e.target.value, ...(withUnitCost && chosen ? { unitCost: chosen.unitCost } : {}) });
              }}
            >
              {ingredients.map((i) => (
                <MenuItem key={i._id} value={i._id}>{i.name} ({i.unit})</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small" label={`Qty${ing ? ` (${ing.unit})` : ''}`} type="number" value={line.quantity}
              sx={{ ...fieldSx, flex: 1, minWidth: 90 }}
              onChange={(e) => updateLine(idx, { quantity: e.target.value })}
            />
            {withUnitCost && (
              <TextField
                size="small" label="Unit Cost" type="number" value={line.unitCost}
                sx={{ ...fieldSx, flex: 1, minWidth: 100 }}
                onChange={(e) => updateLine(idx, { unitCost: e.target.value })}
              />
            )}
            <IconButton onClick={() => removeLine(idx)} size="small" sx={{ mt: 0.5, color: COLORS.error }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      })}
      <Box
        onClick={addLine}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: COLORS.primary, ...TYPE.labelSm, textTransform: 'none', width: 'fit-content' }}
      >
        <AddIcon sx={{ fontSize: 16 }} /> Add Ingredient
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Toast — lightweight success/error notice, used by every mutation below.
// ---------------------------------------------------------------------------
export function Toast({ toast, onClose }) {
  return (
    <Snackbar
      open={!!toast}
      autoHideDuration={3500}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={toast?.severity || 'success'}
        variant="filled"
        sx={{ fontFamily: FONT, fontWeight: 600 }}
      >
        {toast?.message}
      </Alert>
    </Snackbar>
  );
}

// ---------------------------------------------------------------------------
// Generic modal shell used by every form below
// ---------------------------------------------------------------------------
function FormModal({ open, title, onClose, onSubmit, submitLabel, submitting, error, children, maxWidth = 'sm' }) {
  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{ sx: { borderRadius: '20px', fontFamily: FONT } }}
    >
      <DialogTitle sx={{ ...TYPE.titleMd, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
        {title}
        <IconButton onClick={onClose} size="small" disabled={submitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 3, borderColor: COLORS.border }}>
        {children}
        {error && <T variant="bodyMd" sx={{ color: COLORS.error, fontWeight: 600 }}>{error}</T>}
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ ...TYPE.bodyMd, textTransform: 'none', color: COLORS.secondary, fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          variant="contained"
          sx={{
            ...TYPE.bodyMd, textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 3,
            bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryContainer },
          }}
        >
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// Ingredient — create / edit
// -----------------------------------------------------------------------------
// CHANGES:
//   1. "Category" field removed entirely (field, validation, and payload key).
//   2. "Unit" is now a dropdown (Kg / g / L / ml / Piece) instead of free text.
//   3. "Current Stock" is now ALWAYS read-only (both Add and Edit mode) —
//      it's never typed in directly anymore.
//   4. The separate AdjustStockModal has been removed — its two fields
//      (Quantity, Type) now live at the bottom of this same form, under
//      "Adjust Stock (optional)". Leaving Quantity blank saves the
//      ingredient with no stock movement.
//   5. "Status (Active/Inactive)" now shows in BOTH Add and Edit mode
//      (previously it only showed while editing), and is now included in
//      the create payload too.
//
// STOCK MOVEMENT SEMANTICS: this now calls the SAME endpoint the old
// AdjustStockModal used — POST /api/inventory/ingredients/:id/adjust with
// a SIGNED { quantityChange, type, reason } body (positive = add stock,
// negative = remove stock) — instead of an invented, unsigned endpoint.
// Since the merged UI only exposes a plain (unsigned) "Quantity" field +
// a Type dropdown, the sign is inferred from the type here:
//   - "Wastage"           -> always subtracts from stock
//   - "Purchase" / "Manual Adjustment" -> always adds to stock
// If you need "Manual Adjustment" to also support subtracting, swap the
// single Quantity field for a +/- toggle — flagged here rather than
// guessed at, since your AdjustStockModal took a signed number directly.
//
// ASSUMPTION: "Purchase" as a type value may not exist in your backend's
// adjustment-type enum yet (purchases normally arrive via PO receiving —
// see ReceivePOModal below). Check your `/adjust` endpoint accepts
// type: "purchase", or swap the value to whatever your backend expects
// for a manual stock increase.
// =============================================================================
// FIX: your backend still validates `category` as a required field on
// ingredients ("name, category, unit and unitCost are required"), even
// though the UI no longer has a Category input. Rather than reintroducing
// the field, we just send this fixed value on every create/update so the
// backend's validation passes — the user never sees or picks it.
// If you'd rather remove the requirement properly, drop `category` from
// the `required` list in your backend's ingredient schema/validator
// instead, and then this constant + the two payload lines using it can
// be deleted.
const DEFAULT_INGREDIENT_CATEGORY = 'General';

const UNIT_OPTIONS = ['Kg', 'g', 'L', 'ml', 'Piece'];
const ADJUSTMENT_TYPE_OPTIONS = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'waste', label: 'Wastage' },
  { value: 'adjustment', label: 'Manual Adjustment' },
];

export function IngredientFormModal({ target, suppliers, onClose, onSaved }) {
  const editing = !!target;
  const [form, setForm] = useState(() => ({
    name: target?.name || '',
    unit: target?.unit || UNIT_OPTIONS[0],
    unitCost: target ? String(target.unitCost) : '',
    reorderThreshold: target ? String(target.reorderThreshold ?? 0) : '0',
    primarySupplierId: target?.primarySupplierId?._id || target?.primarySupplierId || '',
    image: target?.image || '',
    isActive: target?.isActive !== undefined ? target.isActive : true,
    // merged-in stock adjustment — optional; blank quantity = no stock movement
    adjustQuantity: '',
    adjustType: 'purchase',
  }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((p) => ({ ...p, image: data.imageUrl }));
    } catch {
      setError('Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.unit.trim() || form.unitCost === '') {
      setError('Name, unit and unit cost are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let ingredientId = target?._id;

      if (editing) {
        await api.put(`/api/inventory/ingredients/${target._id}`, {
          name: form.name, category: DEFAULT_INGREDIENT_CATEGORY, unit: form.unit,
          unitCost: Number(form.unitCost), reorderThreshold: Number(form.reorderThreshold) || 0,
          primarySupplierId: form.primarySupplierId || null, image: form.image, isActive: form.isActive,
        });
      } else {
        const { data } = await api.post('/api/inventory/ingredients', {
          name: form.name, category: DEFAULT_INGREDIENT_CATEGORY, unit: form.unit,
          unitCost: Number(form.unitCost),
          reorderThreshold: Number(form.reorderThreshold) || 0,
          primarySupplierId: form.primarySupplierId || undefined, image: form.image, isActive: form.isActive,
        });
        ingredientId = data._id;
      }

      // ---- Adjust Stock (merged in) — reuses the real /adjust endpoint ----
      const rawQty = Number(form.adjustQuantity);
      const hasAdjustment = form.adjustQuantity !== '' && rawQty !== 0;
      if (hasAdjustment && ingredientId) {
        const signedQuantity = form.adjustType === 'waste' ? -Math.abs(rawQty) : Math.abs(rawQty);
        await api.post(`/api/inventory/ingredients/${ingredientId}/adjust`, {
          quantityChange: signedQuantity,
          type: form.adjustType,
          reason: '',
        });
      }

      onSaved(editing ? 'Ingredient updated' : 'Ingredient added');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save ingredient.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal
      open title={editing ? 'Edit Ingredient' : 'Add New Ingredient'} onClose={onClose} onSubmit={handleSubmit}
      submitLabel={editing ? 'Save Changes' : 'Add Ingredient'} submitting={saving} error={error}
    >
      <TextField label="Name *" size="small" fullWidth sx={fieldSx} value={form.name} onChange={set('name')} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField select label="Unit *" size="small" fullWidth sx={fieldSx} value={form.unit} onChange={set('unit')}>
          {UNIT_OPTIONS.map((u) => (
            <MenuItem key={u} value={u}>{u}</MenuItem>
          ))}
        </TextField>
        <TextField label="Unit Cost *" type="number" size="small" fullWidth sx={fieldSx} value={form.unitCost} onChange={set('unitCost')} />
        <TextField label="Reorder Level" type="number" size="small" fullWidth sx={fieldSx} value={form.reorderThreshold} onChange={set('reorderThreshold')} />
      </Box>

      {/* Current Stock — always read-only now, in both Add and Edit mode.
          Starting/changing stock happens only via the "Adjust Stock" section below. */}
      <T variant="bodyMd" sx={{ color: COLORS.secondary, mt: -1 }}>
        {editing
          ? `Current stock: ${target.currentStock} ${target.unit} — only changed via Adjust Stock below.`
          : 'New ingredients start at 0 stock — use Adjust Stock below to set an opening quantity.'}
      </T>

      <TextField
        select label="Primary Supplier" size="small" fullWidth sx={fieldSx}
        value={form.primarySupplierId} onChange={set('primarySupplierId')}
      >
        <MenuItem value="">— None —</MenuItem>
        {suppliers.map((s) => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
      </TextField>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button component="label" disabled={uploading} sx={{ ...TYPE.bodyMd, textTransform: 'none', fontWeight: 700, color: COLORS.primary }}>
          {uploading ? 'Uploading…' : form.image ? 'Replace Image' : 'Upload Image'}
          <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
        </Button>
        {form.image && <Box component="img" src={form.image} sx={{ width: 40, height: 40, borderRadius: '8px', objectFit: 'cover' }} />}
      </Box>

      {/* Status now shows in both Add and Edit mode */}
      <FormControlLabel
        control={<Switch checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />}
        label={<T variant="bodyMd" sx={{ fontWeight: 600 }}>{form.isActive ? 'Active' : 'Inactive'}</T>}
      />

      {/* ---- Adjust Stock — merged in from the removed AdjustStockModal ---- */}
      <Box sx={{ borderTop: `1px solid ${COLORS.outlineVariant}`, pt: 2, mt: 1 }}>
        <T variant="bodyMd" sx={{ fontWeight: 700, mb: 1 }}>Adjust Stock (optional)</T>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label={`Quantity (${form.unit})`} type="number" size="small" fullWidth sx={fieldSx}
            value={form.adjustQuantity} onChange={set('adjustQuantity')}
          />
          <TextField select label="Type" size="small" fullWidth sx={fieldSx} value={form.adjustType} onChange={set('adjustType')}>
            {ADJUSTMENT_TYPE_OPTIONS.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>
    </FormModal>
  );
}

// ---------------------------------------------------------------------------
// Supplier — create / edit
// ---------------------------------------------------------------------------
// CHANGES: trimmed down to exactly 4 fields — Supplier Name, Contact Person,
// Phone, Address. Category, Email, Outstanding Payment, and the
// Active/Inactive switch have all been removed (field + payload key).
export function SupplierFormModal({ target, onClose, onSaved }) {
  const editing = !!target;
  const [form, setForm] = useState(() => ({
    name: target?.name || '',
    contactPerson: target?.contactPerson || '',
    phone: target?.phone || '',
    address: target?.address || '',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError('Supplier name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editing) await api.put(`/api/inventory/suppliers/${target._id}`, form);
      else await api.post('/api/inventory/suppliers', form);
      onSaved(editing ? 'Supplier updated' : 'Supplier added');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save supplier.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal
      open title={editing ? 'Edit Supplier' : 'Add New Supplier'} onClose={onClose} onSubmit={handleSubmit}
      submitLabel={editing ? 'Save Changes' : 'Add Supplier'} submitting={saving} error={error}
    >
      <TextField label="Supplier Name *" size="small" fullWidth sx={fieldSx} value={form.name} onChange={set('name')} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Contact Person" size="small" fullWidth sx={fieldSx} value={form.contactPerson} onChange={set('contactPerson')} />
        <TextField label="Phone" size="small" fullWidth sx={fieldSx} value={form.phone} onChange={set('phone')} />
      </Box>
      <TextField label="Address" size="small" fullWidth multiline minRows={2} sx={fieldSx} value={form.address} onChange={set('address')} />
    </FormModal>
  );
}

// ---------------------------------------------------------------------------
// (AdjustStockModal removed — its Quantity + Type fields now live inside
// IngredientFormModal above, under "Adjust Stock (optional)". Any code that
// used to render <AdjustStockModal ingredient={...} onClose={...} onSaved={...} />
// should instead just open IngredientFormModal in edit mode for that ingredient.)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Purchase Order — create / edit
// ---------------------------------------------------------------------------
export function POFormModal({ target, suppliers, ingredients, onClose, onSaved }) {
  const editing = !!target;
  const [supplierId, setSupplierId] = useState(target?.supplierId?._id || target?.supplierId || '');
  const [lines, setLines] = useState(() =>
    target ? target.items.map((i) => ({ ingredientId: i.ingredientId, quantity: String(i.quantity), unitCost: String(i.unitCost) })) : []
  );
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(target?.estimatedDeliveryDate ? target.estimatedDeliveryDate.slice(0, 10) : '');
  const [notes, setNotes] = useState(target?.notes || '');
  const [status, setStatus] = useState('ordered');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const total = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitCost) || 0), 0);

  async function handleSubmit() {
    if (!supplierId) { setError('Select a supplier.'); return; }
    if (lines.length === 0 || lines.some((l) => !l.ingredientId || !Number(l.quantity) || Number(l.quantity) <= 0)) {
      setError('Every line needs an ingredient and a positive quantity.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const items = lines.map((l) => ({
        ingredientId: l.ingredientId,
        quantity: Number(l.quantity),
        unitCost: l.unitCost === '' ? undefined : Number(l.unitCost),
      }));
      if (editing) {
        await api.put(`/api/inventory/purchase-orders/${target._id}`, {
          supplierId, items, estimatedDeliveryDate: estimatedDeliveryDate || undefined, notes,
        });
      } else {
        await api.post('/api/inventory/purchase-orders', {
          supplierId, items, estimatedDeliveryDate: estimatedDeliveryDate || undefined, notes, status,
        });
      }
      onSaved(editing ? 'Purchase order updated' : 'Purchase order created');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save purchase order.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal
      open title={editing ? `Edit ${target.poNumber}` : 'Create Purchase Order'} onClose={onClose} onSubmit={handleSubmit}
      submitLabel={editing ? 'Save Changes' : 'Create Order'} submitting={saving} error={error} maxWidth="md"
    >
      <TextField select label="Supplier *" size="small" fullWidth sx={fieldSx} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
        {suppliers.map((s) => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
      </TextField>
      <IngredientLineEditor ingredients={ingredients} lines={lines} onChange={setLines} withUnitCost />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Estimated Delivery" type="date" size="small" fullWidth sx={fieldSx}
          value={estimatedDeliveryDate} onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        {!editing && (
          <TextField select label="Status" size="small" fullWidth sx={fieldSx} value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="ordered">Ordered</MenuItem>
          </TextField>
        )}
      </Box>
      <TextField label="Notes" size="small" fullWidth multiline minRows={2} sx={fieldSx} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <T variant="bodyLg" sx={{ fontWeight: 700, textAlign: 'right' }}>
        Total: {fmtMoney(total)}
      </T>
    </FormModal>
  );
}

// ---------------------------------------------------------------------------
// Receive Purchase Order
// ---------------------------------------------------------------------------
export function ReceivePOModal({ po, onClose, onSaved }) {
  const [quantities, setQuantities] = useState(() => {
    const map = {};
    po.items.forEach((i) => { map[i.ingredientId] = String(i.quantity); });
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (Object.values(quantities).some((v) => v === '' || Number(v) < 0)) {
      setError('Received quantities must be zero or more.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const items = po.items.map((i) => ({ ingredientId: i.ingredientId, receivedQuantity: Number(quantities[i.ingredientId]) }));
      await api.post(`/api/inventory/purchase-orders/${po._id}/receive`, { items });
      onSaved('Purchase order received — stock updated');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to receive purchase order.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal open title={`Receive ${po.poNumber}`} onClose={onClose} onSubmit={handleSubmit} submitLabel="Confirm Receipt" submitting={saving} error={error}>
      <T variant="bodyMd" sx={{ color: COLORS.secondary }}>Confirm delivered quantities for each item. Stock is updated immediately.</T>
      {po.items.map((i) => (
        <Box key={i.ingredientId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <T variant="bodyMd" sx={{ fontWeight: 600, flex: 1 }}>{i.name}</T>
          <T variant="bodyMd" sx={{ color: COLORS.secondary, minWidth: 90 }}>Ordered: {i.quantity} {i.unit}</T>
          <TextField
            size="small" type="number" label="Received" sx={{ ...fieldSx, width: 120 }}
            value={quantities[i.ingredientId]}
            onChange={(e) => setQuantities((p) => ({ ...p, [i.ingredientId]: e.target.value }))}
          />
        </Box>
      ))}
    </FormModal>
  );
}

// ---------------------------------------------------------------------------
// Recipe — create / edit
// ---------------------------------------------------------------------------
export function RecipeFormModal({ target, ingredients, menuItems, onClose, onSaved }) {
  const editing = !!target;
  const [name, setName] = useState(target?.name || '');
  const [menuItemId, setMenuItemId] = useState(target?.menuItemId || '');
  const [yieldPortions, setYieldPortions] = useState(target ? String(target.yieldPortions ?? 1) : '1');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(target ? String(target.prepTimeMinutes ?? 0) : '0');
  const [sellingPrice, setSellingPrice] = useState(target ? String(target.sellingPrice ?? '') : '');
  const [lines, setLines] = useState(() =>
    target ? target.ingredients.map((i) => ({ ingredientId: i.ingredientId, quantity: String(i.quantity) })) : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!name.trim() || sellingPrice === '') { setError('Name and selling price are required.'); return; }
    if (lines.length === 0 || lines.some((l) => !l.ingredientId || !Number(l.quantity) || Number(l.quantity) <= 0)) {
      setError('Every ingredient line needs a positive quantity.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name, menuItemId: menuItemId || undefined,
        yieldPortions: Number(yieldPortions) || 1, prepTimeMinutes: Number(prepTimeMinutes) || 0,
        sellingPrice: Number(sellingPrice),
        ingredients: lines.map((l) => ({ ingredientId: l.ingredientId, quantity: Number(l.quantity) })),
      };
      if (editing) await api.put(`/api/inventory/recipes/${target._id}`, payload);
      else await api.post('/api/inventory/recipes', payload);
      onSaved(editing ? 'Recipe updated' : 'Recipe added');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save recipe.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal
      open title={editing ? 'Edit Recipe' : 'Add New Recipe'} onClose={onClose} onSubmit={handleSubmit}
      submitLabel={editing ? 'Save Changes' : 'Add Recipe'} submitting={saving} error={error} maxWidth="md"
    >
      <TextField label="Recipe Name *" size="small" fullWidth sx={fieldSx} value={name} onChange={(e) => setName(e.target.value)} />
      <TextField select label="Linked Menu Item" size="small" fullWidth sx={fieldSx} value={menuItemId} onChange={(e) => setMenuItemId(e.target.value)}>
        <MenuItem value="">— None —</MenuItem>
        {menuItems.map((m) => <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>)}
      </TextField>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Yield (portions)" type="number" size="small" fullWidth sx={fieldSx} value={yieldPortions} onChange={(e) => setYieldPortions(e.target.value)} />
        <TextField label="Prep Time (mins)" type="number" size="small" fullWidth sx={fieldSx} value={prepTimeMinutes} onChange={(e) => setPrepTimeMinutes(e.target.value)} />
        <TextField label="Selling Price *" type="number" size="small" fullWidth sx={fieldSx} value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
      </Box>
      <IngredientLineEditor ingredients={ingredients} lines={lines} onChange={setLines} withUnitCost={false} />
    </FormModal>
  );
}
