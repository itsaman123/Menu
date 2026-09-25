import React from 'react';
import {
  Box, Grid, Table, TableBody, TableCell, TableHead, TableRow, Avatar,
  TextField, InputAdornment, Chip, MenuItem,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory2';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { T, LoadingBlock, EmptyState } from './inventoryShared';
import {
  COLORS, TYPE, FONT, cardSx, fieldSx, initialsOf,
  INGREDIENT_STATUS_META, PO_STATUS_META,
  fmtMoney, fmtDate, fmtDateTime,
} from './inventoryTokens';

const TXN_META = {
  'purchase-received': { icon: CheckCircleIcon, color: COLORS.statusReady, verb: 'received' },
  waste: { icon: WarningAmberIcon, color: COLORS.error, verb: 'wasted' },
  adjustment: { icon: EditIcon, color: COLORS.statusPending, verb: 'adjusted' },
  audit: { icon: InventoryIcon, color: COLORS.secondary, verb: 'audited' },
  usage: { icon: TrendingDownIcon, color: COLORS.accentOrange, verb: 'used' },
};

const INGREDIENT_STATUS_CHIPS = [
  { value: '', label: 'All' },
  { value: 'optimal', label: 'Optimal' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
];

const PO_STATUS_CHIPS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'in-transit', label: 'In Transit' },
  { value: 'received', label: 'Received' },
  { value: 'cancelled', label: 'Cancelled' },
];

const FilterChip = ({ active, label, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      px: 2, py: 0.75, borderRadius: '999px', cursor: 'pointer', ...TYPE.labelSm, textTransform: 'none',
      bgcolor: active ? COLORS.primary : COLORS.surfaceContainerLow,
      color: active ? COLORS.white : COLORS.secondary,
      transition: 'all 0.15s',
    }}
  >
    {label}
  </Box>
);

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------
const KpiCard = ({ label, value, trendIcon: Icon, trendText, trendColor, subText, alert }) => (
  <Box sx={{ ...cardSx, height: '100%', ...(alert ? { bgcolor: `${COLORS.statusPreparing}1A`, border: `1px solid ${COLORS.statusPreparing}33`, boxShadow: 'none' } : {}) }}>
    <T variant="labelSm" sx={{ color: alert ? COLORS.statusPreparing : COLORS.secondary, mb: 1 }}>{label}</T>
    <T variant="headlineLg" sx={{ color: alert ? COLORS.primary : COLORS.onSurface }}>{value}</T>
    {trendText && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, color: trendColor }}>
        {Icon && <Icon sx={{ fontSize: 18 }} />}
        <T variant="bodyMd" sx={{ color: trendColor }}>{trendText}</T>
      </Box>
    )}
    {subText && <T variant="bodyMd" sx={{ color: COLORS.secondary, mt: 1 }}>{subText}</T>}
  </Box>
);

export function OverviewTab({ data, loading }) {
  if (loading) return <LoadingBlock height={400} />;
  if (!data) return <EmptyState icon={InventoryIcon} title="No data yet" subtitle="Start adding ingredients to see your overview." />;

  const maxDay = Math.max(1, ...data.trend.map((d) => d.stockIn + d.usageOut));

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard label="Total Valuation" value={fmtMoney(data.totalValuation)} trendIcon={TrendingUpIcon} trendText="Across active ingredients" trendColor={COLORS.statusReady} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard label="Low Stock Alerts" value={String(data.lowStockCount)} subText={data.lowStockCount > 0 ? 'Requires attention' : 'All good'} alert={data.lowStockCount > 0} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard label="Waste Percentage" value={`${data.wastePercentage}%`} trendIcon={TrendingDownIcon} trendText="Trailing 30 days" trendColor={COLORS.statusReady} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard label="Open Orders" value={String(data.openOrdersCount).padStart(2, '0')} subText="Draft, ordered or in transit" />
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Box sx={{ ...cardSx, height: 400, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <T variant="titleMd">Inventory & Consumption Trend</T>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS.primary }} />
                <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>Stock In</T>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS.accentOrange }} />
                <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>Usage/Waste</T>
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', gap: 1.5, pb: 1 }}>
            {data.trend.map((d, i) => (
              <Box key={i} sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column-reverse', gap: '2px' }}>
                <Box sx={{ height: `${(d.stockIn / maxDay) * 100}%`, minHeight: d.stockIn > 0 ? 4 : 0, bgcolor: COLORS.primary, borderRadius: '4px 4px 0 0', opacity: 0.85 }} title={`Stock in: ${fmtMoney(d.stockIn)}`} />
                <Box sx={{ height: `${(d.usageOut / maxDay) * 100}%`, minHeight: d.usageOut > 0 ? 4 : 0, bgcolor: COLORS.accentOrange, borderRadius: '4px 4px 0 0', opacity: 0.7 }} title={`Usage/waste: ${fmtMoney(d.usageOut)}`} />
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
            {data.trend.map((d, i) => (
              <T key={i} variant="labelSm" sx={{ flex: 1, textAlign: 'center', color: COLORS.secondary, textTransform: 'none' }}>
                {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </T>
            ))}
          </Box>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Box sx={{ ...cardSx, height: 400, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <T variant="titleMd" sx={{ mb: 3 }}>Recent Activity</T>
          {data.recentActivity.length === 0 ? (
            <T variant="bodyMd" sx={{ color: COLORS.secondary }}>No activity yet.</T>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, overflowY: 'auto' }}>
              {data.recentActivity.map((item) => {
                const meta = TXN_META[item.type] || TXN_META.adjustment;
                const Icon = meta.icon;
                return (
                  <Box key={item._id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: `${meta.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon sx={{ color: meta.color, fontSize: 18 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <T variant="bodyMd" sx={{ fontWeight: 600, color: COLORS.onSurface }}>
                        {item.ingredientName} {meta.verb} ({item.quantityChange > 0 ? '+' : ''}{item.quantityChange})
                      </T>
                      <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>{fmtDateTime(item.createdAt)}</T>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}

// ---------------------------------------------------------------------------
// Ingredients
// ---------------------------------------------------------------------------
// CHANGES:
//   - Category filter dropdown removed (ingredients no longer have a category)
//   - "Category" column removed from the table header
//   - `categories` prop is no longer used by this tab — you can stop
//     passing it in from the parent page, or just leave it unused, your call
export function IngredientsTab({ ingredients, loading, filters, setFilters, onRowClick }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small" placeholder="Search ingredients…" value={filters.search}
          onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: COLORS.secondary, fontSize: 20 }} /></InputAdornment> }}
          sx={{ ...fieldSx, minWidth: 220, flex: 1, maxWidth: 320 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {INGREDIENT_STATUS_CHIPS.map((c) => (
            <FilterChip key={c.value} label={c.label} active={filters.status === c.value} onClick={() => setFilters((p) => ({ ...p, status: c.value }))} />
          ))}
        </Box>
      </Box>

      {loading ? (
        <LoadingBlock />
      ) : ingredients.length === 0 ? (
        <EmptyState icon={InventoryIcon} title="No ingredients found" subtitle="Try adjusting filters, or add your first ingredient with the + button." />
      ) : (
        <Box sx={{ ...cardSx, p: 0, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: COLORS.surfaceContainerLow }}>
                {['Ingredient', 'In Stock', 'Unit Cost', 'Status', ''].map((h) => (
                  <TableCell key={h} sx={{ ...TYPE.labelSm, color: COLORS.secondary, border: 'none' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {ingredients.map((row) => {
                const meta = INGREDIENT_STATUS_META[row.status] || INGREDIENT_STATUS_META.optimal;
                return (
                  <TableRow
                    key={row._id}
                    onClick={() => onRowClick(row)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: COLORS.surfaceContainerLow }, '&:last-child td': { borderBottom: 0 } }}
                  >
                    <TableCell sx={{ borderColor: COLORS.border }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar variant="rounded" src={row.image || undefined} sx={{ bgcolor: COLORS.surfaceContainerHigh, width: 40, height: 40 }} />
                        <T variant="bodyMd" sx={{ fontWeight: 600 }}>{row.name}</T>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderColor: COLORS.border, ...TYPE.bodyMd }}>{row.currentStock} {row.unit}</TableCell>
                    <TableCell sx={{ borderColor: COLORS.border, ...TYPE.bodyMd }}>{fmtMoney(row.unitCost)}/{row.unit}</TableCell>
                    <TableCell sx={{ borderColor: COLORS.border }}>
                      <Chip label={meta.label} size="small" sx={{ bgcolor: `${meta.color}1A`, color: meta.color, fontWeight: 600, fontFamily: FONT }} />
                    </TableCell>
                    <TableCell align="right" sx={{ borderColor: COLORS.border }}>
                      <ChevronRightIcon sx={{ color: COLORS.secondary }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Suppliers
// ---------------------------------------------------------------------------
// CHANGES: card now matches the trimmed 4-field supplier model — Name,
// Contact Person (subtitle, replaces the old Category subtitle), Phone and
// Address (replaces the old Outstanding Payment / Phone stat rows).
export function SuppliersTab({ suppliers, loading, onCardClick }) {
  if (loading) return <LoadingBlock />;
  if (suppliers.length === 0) {
    return <EmptyState icon={GroupsIcon} title="No suppliers yet" subtitle="Add your first supplier with the + button." />;
  }
  return (
    <Grid container spacing={3}>
      {suppliers.map((s) => (
        <Grid key={s._id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Box onClick={() => onCardClick(s)} sx={{ ...cardSx, cursor: 'pointer', transition: 'border-color 0.2s', '&:hover': { borderColor: COLORS.primary } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: `${COLORS.primary}0D`, color: COLORS.primary, fontWeight: 700, width: 48, height: 48 }}>
                {initialsOf(s.name)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <T variant="bodyLg" sx={{ fontWeight: 700 }}>{s.name}</T>
                <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>{s.contactPerson || '—'}</T>
              </Box>
            </Box>
            <Box sx={{ pt: 2, borderTop: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>Phone</T>
                <T variant="labelSm" sx={{ fontWeight: 700, textTransform: 'none' }}>{s.phone || '—'}</T>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none', flexShrink: 0 }}>Address</T>
                <T variant="labelSm" sx={{ fontWeight: 700, textTransform: 'none', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.address || '—'}</T>
              </Box>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

// ---------------------------------------------------------------------------
// Purchases
// ---------------------------------------------------------------------------
export function PurchasesTab({ orders, loading, statusFilter, setStatusFilter, onCreateClick, onDetailsClick }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {PO_STATUS_CHIPS.map((c) => (
            <FilterChip key={c.value} label={c.label} active={statusFilter === c.value} onClick={() => setStatusFilter(c.value)} />
          ))}
        </Box>
        <Box
          onClick={onCreateClick}
          sx={{ px: 3, py: 1, bgcolor: COLORS.primary, color: COLORS.white, borderRadius: '999px', ...TYPE.labelSm, textTransform: 'none', cursor: 'pointer', '&:hover': { bgcolor: COLORS.primaryContainer } }}
        >
          + Create PO
        </Box>
      </Box>

      {loading ? (
        <LoadingBlock />
      ) : orders.length === 0 ? (
        <EmptyState icon={ReceiptLongIcon} title="No purchase orders" subtitle="Create your first purchase order to start tracking deliveries." />
      ) : (
        orders.map((po) => {
          const meta = PO_STATUS_META[po.status] || PO_STATUS_META.draft;
          return (
            <Box key={po._id} sx={{ ...cardSx, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 160 }}>
                <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>{po.poNumber}</T>
                <T variant="bodyLg" sx={{ fontWeight: 700 }}>{po.supplierId?.name || '—'}</T>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center', minWidth: 140 }}>
                <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>Estimated Arrival</T>
                <T variant="bodyMd" sx={{ fontWeight: 600 }}>{fmtDate(po.estimatedDeliveryDate)}</T>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center', minWidth: 120 }}>
                <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>Total</T>
                <T variant="bodyMd" sx={{ fontWeight: 600 }}>{fmtMoney(po.totalAmount)}</T>
              </Box>
              <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', gap: 2, minWidth: 180 }}>
                <Box sx={{ flex: 1, height: 8, bgcolor: COLORS.surfaceContainerHigh, borderRadius: '999px', overflow: 'hidden' }}>
                  <Box sx={{ width: `${meta.progress}%`, height: '100%', bgcolor: meta.color }} />
                </Box>
                <T variant="labelSm" sx={{ color: meta.color, fontWeight: 700, textTransform: 'none' }}>{meta.label}</T>
              </Box>
              <Box
                onClick={() => onDetailsClick(po)}
                sx={{ px: 2, py: 1, border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '999px', ...TYPE.labelSm, textTransform: 'none', cursor: 'pointer', '&:hover': { bgcolor: COLORS.surfaceContainerLow } }}
              >
                Details
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------
export function RecipesTab({ recipes, loading, search, setSearch, selected, onSelect, onAdd, onEdit, onDelete }) {
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Box sx={{ ...cardSx, height: 560, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField
              size="small" placeholder="Filter recipes…" fullWidth value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: COLORS.secondary, fontSize: 20 }} /></InputAdornment> }}
              sx={{ ...fieldSx }}
            />
            <Box onClick={onAdd} sx={{ flexShrink: 0, width: 40, height: 40, borderRadius: '10px', bgcolor: COLORS.primary, color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: COLORS.primaryContainer } }}>
              <AddIcon fontSize="small" />
            </Box>
          </Box>
          {loading ? (
            <LoadingBlock height={200} />
          ) : filtered.length === 0 ? (
            <T variant="bodyMd" sx={{ color: COLORS.secondary }}>No recipes found.</T>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
              {filtered.map((r) => {
                const active = selected?._id === r._id;
                return (
                  <Box
                    key={r._id} onClick={() => onSelect(r)}
                    sx={{
                      p: 1.5, borderRadius: '8px', cursor: 'pointer',
                      bgcolor: active ? COLORS.surfaceHighlight : 'transparent',
                      borderLeft: active ? `4px solid ${COLORS.primary}` : '4px solid transparent',
                      '&:hover': { bgcolor: active ? COLORS.surfaceHighlight : COLORS.surfaceContainerLow },
                    }}
                  >
                    <T variant="bodyMd" sx={{ fontWeight: 700 }}>{r.name}</T>
                    <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>
                      {fmtMoney(r.totalCost)} cost · {r.foodCostPercentage != null ? `${r.foodCostPercentage}% food cost` : 'no price set'}
                    </T>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        {!selected ? (
          <EmptyState icon={MenuBookIcon} title="No recipe selected" subtitle="Pick a recipe on the left, or add a new one." />
        ) : (
          <Box sx={{ ...cardSx }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <T variant="displayLg" sx={{ mb: 1 }}>{selected.name}</T>
                <T variant="bodyLg" sx={{ color: COLORS.secondary }}>Yield: {selected.yieldPortions} portions · Prep Time: {selected.prepTimeMinutes} mins · Sells for {fmtMoney(selected.sellingPrice)}</T>
              </Box>
              <Box sx={{ bgcolor: `${COLORS.primary}0D`, borderRadius: '12px', px: 3, py: 2, textAlign: 'center' }}>
                <T variant="labelSm" sx={{ color: COLORS.primary }}>Food Cost %</T>
                <T variant="headlineLg" sx={{ color: COLORS.primary }}>{selected.foodCostPercentage != null ? `${selected.foodCostPercentage}%` : '—'}</T>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <T variant="bodyLg" sx={{ fontWeight: 700 }}>Ingredients Mapping</T>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box onClick={() => onEdit(selected)} sx={{ p: 1, borderRadius: '8px', cursor: 'pointer', color: COLORS.secondary, '&:hover': { bgcolor: COLORS.surfaceContainerLow, color: COLORS.primary } }}>
                  <EditIcon fontSize="small" />
                </Box>
                <Box onClick={() => onDelete(selected)} sx={{ p: 1, borderRadius: '8px', cursor: 'pointer', color: COLORS.secondary, '&:hover': { bgcolor: `${COLORS.error}14`, color: COLORS.error } }}>
                  <DeleteOutlineIcon fontSize="small" />
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {selected.ingredients.map((ing, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: COLORS.surfaceContainerLow, borderRadius: '8px' }}>
                  <T variant="bodyMd" sx={{ fontWeight: 600 }}>{ing.name}</T>
                  <Box sx={{ display: 'flex', gap: 4 }}>
                    <T variant="bodyMd">{ing.quantity} {ing.unit}</T>
                    <T variant="bodyMd" sx={{ fontWeight: 700 }}>{fmtMoney(ing.cost)}</T>
                  </Box>
                </Box>
              ))}
            </Box>
            <T variant="bodyLg" sx={{ fontWeight: 700, textAlign: 'right', mt: 2 }}>Total Cost: {fmtMoney(selected.totalCost)}</T>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------
const DONUT_PALETTE = [COLORS.primary, COLORS.accentOrange, COLORS.statusPending, COLORS.error, COLORS.statusReady, COLORS.secondary];

export function ReportsTab({ valuationTrend, topCostDrivers, wasteByCategory, loading }) {
  if (loading) return <LoadingBlock height={400} />;

  const maxDay = Math.max(1, ...valuationTrend.map((d) => d.stockInValue + d.usageValue + d.wasteValue));
  const maxDriver = Math.max(1, ...topCostDrivers.map((d) => d.percentageOfTotal));

  let cumulative = 0;
  const gradientStops = wasteByCategory.map((d, i) => {
    const start = cumulative;
    cumulative += d.percentageOfWaste;
    return `${DONUT_PALETTE[i % DONUT_PALETTE.length]} ${start}% ${cumulative}%`;
  });
  if (cumulative < 100) gradientStops.push(`${COLORS.surfaceContainerHigh} ${cumulative}% 100%`);
  const donutGradient = `conic-gradient(${gradientStops.join(', ')})`;
  const topWaste = wasteByCategory[0];

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Box sx={{ ...cardSx }}>
          <T variant="titleMd" sx={{ mb: 3 }}>Inventory Valuation & Waste Over Time</T>
          {valuationTrend.length === 0 ? (
            <T variant="bodyMd" sx={{ color: COLORS.secondary }}>No transactions in this period yet.</T>
          ) : (
            <Box sx={{ height: 220, display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
              {valuationTrend.map((d, i) => (
                <Box key={i} sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column-reverse', gap: '1px' }} title={`${d.date}: in ${fmtMoney(d.stockInValue)}, used ${fmtMoney(d.usageValue)}, wasted ${fmtMoney(d.wasteValue)}`}>
                  <Box sx={{ height: `${(d.stockInValue / maxDay) * 100}%`, bgcolor: COLORS.primary, opacity: 0.85 }} />
                  <Box sx={{ height: `${(d.usageValue / maxDay) * 100}%`, bgcolor: COLORS.statusPending, opacity: 0.8 }} />
                  <Box sx={{ height: `${(d.wasteValue / maxDay) * 100}%`, bgcolor: COLORS.error, opacity: 0.8, borderRadius: '2px 2px 0 0' }} />
                </Box>
              ))}
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
            {[['Stock In', COLORS.primary], ['Usage', COLORS.statusPending], ['Waste', COLORS.error]].map(([label, color]) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>{label}</T>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Box sx={{ ...cardSx }}>
          <T variant="bodyLg" sx={{ fontWeight: 700, mb: 2 }}>Top Cost Drivers</T>
          {topCostDrivers.length === 0 ? (
            <T variant="bodyMd" sx={{ color: COLORS.secondary }}>No ingredients yet.</T>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {topCostDrivers.map((d) => (
                <Box key={d.ingredientId}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <T variant="bodyMd">{d.name}</T>
                    <T variant="bodyMd" sx={{ fontWeight: 700, color: COLORS.error }}>{fmtMoney(d.value)} ({d.percentageOfTotal}%)</T>
                  </Box>
                  <Box sx={{ height: 6, bgcolor: COLORS.surfaceContainerHigh, borderRadius: '999px', overflow: 'hidden' }}>
                    <Box sx={{ width: `${(d.percentageOfTotal / maxDriver) * 100}%`, height: '100%', bgcolor: COLORS.error }} />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
          <T variant="bodyLg" sx={{ fontWeight: 700, mb: 2 }}>Waste Analysis by Category</T>
          {wasteByCategory.length === 0 ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <T variant="bodyMd" sx={{ color: COLORS.secondary }}>No waste recorded in this period.</T>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ width: 160, height: 160, borderRadius: '50%', background: donutGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: COLORS.white, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <T variant="titleMd" sx={{ fontWeight: 700 }}>{topWaste?.percentageOfWaste}%</T>
                  <T variant="labelSm" sx={{ color: COLORS.secondary, textTransform: 'none' }}>{topWaste?.category}</T>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 140 }}>
                {wasteByCategory.map((d, i) => (
                  <Box key={d.category} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: DONUT_PALETTE[i % DONUT_PALETTE.length], flexShrink: 0 }} />
                      <T variant="bodyMd" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.category}</T>
                    </Box>
                    <T variant="bodyMd" sx={{ fontWeight: 700 }}>{d.percentageOfWaste}%</T>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}