// =============================================================================
// pages/CreateInvoicePage.jsx
// ---------------------------------------------------------------------------
// FILE LOCATION: src/pages/billing/pages/CreateInvoicePage.jsx
//
// Modern Item-Centric POS Billing Interface
// 1. Select Items (Category tabs, Live search, Quick + / - qty, Running Cart)
// 2. Review Order Details (Table, Order Type, Optional Customer Details, GST, Discount, Notes)
// 3. Generate Invoice & Bill -> proceeds to CustomerBillPage
// =============================================================================
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Grid, TextField, MenuItem, IconButton, Divider, Chip, Tooltip, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import ClearIcon from '@mui/icons-material/Clear';
import TuneIcon from '@mui/icons-material/Tune';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { COLORS, T, TYPE, cardSx, inputSx, currency } from '../theme';
import { GST_OPTIONS, QUICK_ADD_ITEMS } from '../mockData';
import * as billingApi from '../billingapi';

const MANUAL_ENTRY = '__manual__';

const ORDER_TYPES = [
  { label: 'Dine-In', value: 'dine-in', icon: LocalDiningIcon },
  { label: 'Takeaway', value: 'takeaway', icon: ShoppingBagIcon },
  { label: 'Delivery', value: 'delivery', icon: DeliveryDiningIcon },
];

const MenuItemCard = ({ item, isManual, inCart, onAdd, reorderMode, dragListeners }) => {
  const [qty, setQty] = useState(0);
  return (
    <Box sx={{
      p: 1.5, borderRadius: '16px', border: `1px solid ${inCart ? COLORS.primary : COLORS.outlineVariant}60`,
      bgcolor: inCart ? `${COLORS.primary}08` : COLORS.white,
      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
      transition: 'all 0.2s', display: 'flex', flexDirection: 'column', height: '100%',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(0,0,0,0.06)' }
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          {reorderMode && dragListeners && (
            <Box
              {...dragListeners}
              sx={{
                cursor: 'grab', p: 0.25, borderRadius: '6px',
                bgcolor: `${COLORS.accentOrange}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                '&:active': { cursor: 'grabbing' },
                mt: 0.25
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: 16, color: COLORS.accentOrange }} />
            </Box>
          )}
          <T variant="bodyMd" sx={{ fontWeight: 700, color: COLORS.primary, lineHeight: 1.3, pr: 1 }}>
            {item.name}
          </T>
        </Box>
        <Box sx={{ 
          bgcolor: `${COLORS.accentOrange}15`, p: 0.5, px: 0.75, borderRadius: '8px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <RestaurantIcon sx={{ color: COLORS.accentOrange, fontSize: 16 }} />
        </Box>
      </Box>

      <Divider sx={{ my: 1.5, borderColor: `${COLORS.outlineVariant}40` }} />

      <T variant="titleMd" sx={{ color: COLORS.accentOrange, fontWeight: 800, mb: 1.5 }}>
        {currency(item.price)}
      </T>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
        <Box sx={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          bgcolor: `${COLORS.accentOrange}15`, borderRadius: '8px', p: 0.5, flex: 1
        }}>
          <IconButton size="small" onClick={() => setQty(Math.max(0, qty - 1))} sx={{ color: COLORS.accentOrange, p: 0.25 }}>
            <RemoveIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <T variant="bodyMd" sx={{ fontWeight: 700, color: COLORS.accentOrange }}>{qty}</T>
          <IconButton size="small" onClick={() => setQty(qty + 1)} sx={{ color: COLORS.accentOrange, p: 0.25 }}>
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        <Box
          onClick={() => {
            if (!isManual || qty === 0) return;
            onAdd(item, qty);
            setQty(0);
          }}
          sx={{
            flex: 1.2, py: 0.75, textAlign: 'center', borderRadius: '8px',
            bgcolor: isManual ? COLORS.accentOrange : COLORS.surfaceContainerHigh,
            color: isManual ? COLORS.white : COLORS.secondary,
            fontWeight: 700, fontSize: 14, cursor: (isManual && qty > 0) ? 'pointer' : 'not-allowed',
            opacity: (isManual && qty > 0) ? 1 : 0.6,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
            '&:hover': (isManual && qty > 0) ? { opacity: 0.9 } : {}
          }}
        >
          + Add
        </Box>
      </Box>
    </Box>
  );
};

// Sortable wrapper for MenuItemCard — adds drag handle + transform
const SortableMenuItemCard = ({ id, item, isManual, inCart, onAdd, reorderMode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
    position: 'relative',
    height: '100%',
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <MenuItemCard 
        item={item} 
        isManual={isManual} 
        inCart={inCart} 
        onAdd={onAdd} 
        reorderMode={reorderMode}
        dragListeners={{...attributes, ...listeners}}
      />
    </Box>
  );
};

const CreateInvoicePage = ({ onBack, onGenerate }) => {
  // ----- Data Loading (Unbilled orders + Categories + Menu Items) -----
  const [unbilledOrders, setUnbilledOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      billingApi.getUnbilledOrders().catch(() => []),
      billingApi.getCategories().catch(() => []),
      billingApi.getMenuItems().catch(() => []),
      billingApi.getMenuItemOrder().catch(() => []),
    ]).then(([ordersRes, catsRes, itemsRes, orderRes]) => {
      setUnbilledOrders(ordersRes || []);
      setCategories(catsRes || []);
      const items = itemsRes && itemsRes.length > 0 ? itemsRes : QUICK_ADD_ITEMS;

      // Apply saved ordering if it exists
      if (orderRes && orderRes.length > 0) {
        const posMap = {};
        orderRes.forEach((o) => { posMap[o.itemId] = o.position; });
        items.sort((a, b) => {
          const aId = a._id || a.id || a.name;
          const bId = b._id || b.id || b.name;
          const aPos = posMap[aId] != null ? posMap[aId] : 9999;
          const bPos = posMap[bId] != null ? posMap[bId] : 9999;
          return aPos - bPos;
        });
      }
      setMenuItems(items);
    }).finally(() => setLoadingData(false));
  }, []);

  // ----- POS State -----
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [reorderMode, setReorderMode] = useState(false);

  // DnD sensor config — distance of 5px before drag starts (avoids accidental drags)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const saveTimeoutRef = useRef(null);

  // ----- Order Review & Metadata -----
  const [selectedOrderId, setSelectedOrderId] = useState(MANUAL_ENTRY);
  const [orderType, setOrderType] = useState('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [gstRate, setGstRate] = useState(5);
  const [discountRate, setDiscountRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  // Custom Item state for off-menu items
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedOrder = unbilledOrders.find((o) => o.orderId === selectedOrderId) || null;
  const isManual = selectedOrderId === MANUAL_ENTRY;

  // Auto-fill details if an existing unbilled table order is selected
  useEffect(() => {
    if (selectedOrder) {
      setPhone(selectedOrder.customerPhone || '');
      setTableNumber(selectedOrder.tableNumber ? String(selectedOrder.tableNumber) : '');
      if (selectedOrder.customerName) setCustomerName(selectedOrder.customerName);
    }
  }, [selectedOrder]);

  // Helper to resolve Category Name properly (handles IDs vs Objects)
  const getCategoryName = (item) => {
    if (!item.category) return '';
    if (typeof item.category === 'object') return item.category.name || '';
    const found = categories.find(c => c._id === item.category || c.id === item.category);
    return found ? found.name : item.category;
  };

  // Derived Category List
  const categoryNames = useMemo(() => {
    const names = new Set(['All']);
    categories.forEach((c) => { if (c.name) names.add(c.name); });
    menuItems.forEach((i) => {
      const cName = getCategoryName(i);
      if (cName) names.add(cName);
    });
    return Array.from(names);
  }, [categories, menuItems]);

  // Filtered Menu Items — preserves the custom order from menuItems state
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const catName = getCategoryName(item);
      const matchesCat = selectedCategory === 'All' || catName === selectedCategory;
      const matchesSearch = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCat && matchesSearch;
    });
  }, [menuItems, categories, selectedCategory, searchQuery]);

  // Stable list of sortable IDs for @dnd-kit
  const sortableIds = useMemo(() =>
    filteredMenuItems.map((item) => item._id || item.id || item.name),
    [filteredMenuItems]
  );

  // Drag end handler — reorder menuItems in state + persist to DB
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find indices in the filtered list
    const oldIndex = filteredMenuItems.findIndex((i) => (i._id || i.id || i.name) === active.id);
    const newIndex = filteredMenuItems.findIndex((i) => (i._id || i.id || i.name) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the full menuItems array
    const reorderedFiltered = arrayMove(filteredMenuItems, oldIndex, newIndex);
    const isFiltered = selectedCategory !== 'All' || searchQuery.trim();

    let newMenuItems;
    if (!isFiltered) {
      newMenuItems = reorderedFiltered;
    } else {
      // When filtered, only reorder within the visible subset
      const filteredSet = new Set(filteredMenuItems.map((i) => i._id || i.id || i.name));
      newMenuItems = [];
      let filteredIdx = 0;
      for (const item of menuItems) {
        const id = item._id || item.id || item.name;
        if (filteredSet.has(id)) {
          newMenuItems.push(reorderedFiltered[filteredIdx++]);
        } else {
          newMenuItems.push(item);
        }
      }
    }
    setMenuItems(newMenuItems);

    // Debounced save to DB
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const orderPayload = newMenuItems.map((item, idx) => ({
        itemId: item._id || item.id,
        position: idx,
      })).filter((o) => o.itemId);
      billingApi.saveMenuItemOrder(orderPayload).catch(console.error);
    }, 600);
  }, [filteredMenuItems, menuItems, selectedCategory, searchQuery]);

  const addToCart = (item, qtyToAdd = 1) => {
    const itemPrice = item.price || 0;
    const itemId = item._id || item.id || item.name;
    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => (c.itemId && c.itemId === itemId) || c.name === item.name);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], qty: updated[existingIndex].qty + qtyToAdd };
        return updated;
      }
      return [...prev, { id: `${itemId}-${Date.now()}`, itemId, name: item.name, price: itemPrice, qty: qtyToAdd }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const addCustomItem = () => {
    if (!customName.trim() || !customPrice || isNaN(Number(customPrice))) return;
    setCart((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name: customName.trim(), price: Number(customPrice), qty: 1 },
    ]);
    setCustomName('');
    setCustomPrice('');
  };

  // Preview Totals Calculation
  const previewItems = isManual ? cart : (selectedOrder?.items || []).map((it) => ({ name: it.name, price: it.price, qty: it.quantity }));
  const subtotal = useMemo(() => previewItems.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0), [previewItems]);
  const gstAmount = subtotal * (gstRate / 100);
  const discountAmount = subtotal * (discountRate / 100);
  const total = subtotal + gstAmount - discountAmount;

  const canSubmit = isManual ? cart.length > 0 : !!selectedOrder;

  const submit = (saveAsDraft) => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      customerName: customerName.trim() || 'Walk-in Guest',
      customerPhone: phone.trim(),
      customerType: orderType,
      gstRatePct: gstRate,
      discountPct: discountRate,
      notes: notes.trim(),
      dueDate: null,
      saveAsDraft,
    };

    if (isManual) {
      payload.items = cart.map((it) => ({ name: it.name, price: it.price, quantity: it.qty }));
      if (tableNumber.trim()) payload.tableNumber = tableNumber.trim();
    } else {
      payload.orderId = selectedOrder.orderId;
    }

    billingApi
      .createInvoice(payload)
      .then((invoice) => onGenerate(invoice))
      .catch((err) => setErrorMsg(err?.response?.data?.message || 'Failed to generate invoice'))
      .finally(() => setSubmitting(false));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: COLORS.background }}>
      {/* ===== Header Bar ===== */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: { xs: 1, md: 1.5 }, py: 1, borderBottom: `1px solid ${COLORS.outlineVariant}4D`,
        bgcolor: COLORS.white, flexWrap: 'wrap', gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={onBack} size="small" sx={{ bgcolor: COLORS.surfaceContainerLow }}>
            <ArrowBackIcon sx={{ color: COLORS.primary, fontSize: 20 }} />
          </IconButton>
          <Box>
            <T variant="titleMd" sx={{ color: COLORS.primary, fontWeight: 800 }}>Create New Invoice</T>
            <T variant="labelSm" sx={{ color: COLORS.secondary }}>Fast Item-Centric POS Billing</T>
          </Box>
        </Box>

        {/* Unbilled Order Selector (Optional table order integration) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 260 }}>
          <TextField
            select size="small" fullWidth
            value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}
            sx={{ ...inputSx, bgcolor: COLORS.surfaceContainerLow }}
            disabled={loadingData}
          >
            <MenuItem value={MANUAL_ENTRY}>✨ Manual POS Billing (New Order)</MenuItem>
            {unbilledOrders.map((o) => (
              <MenuItem key={o.orderId} value={o.orderId}>
                🍽️ Table {o.tableNumber || '?'} — {o.items.length} items ({currency(o.totalAmount)})
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* ===== Main Split View ===== */}
      <Grid container spacing={2} sx={{ p: { xs: 1, md: 1.5 }, flex: 1 }}>
        {/* ================= LEFT 65%: ITEM CATALOG & SEARCH ================= */}
        <Grid size={{ xs: 12, lg: 7.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
            
            {/* Search and Category Bar */}
            <Box sx={{ ...cardSx, p: 1.5 }}>
              <Grid container spacing={1.5} alignItems="center">
                {/* Search Bar */}
                <Grid size={12}>
                  <TextField
                    placeholder="Search menu items..."
                    fullWidth size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: COLORS.secondary, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchQuery('')}>
                            <ClearIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </InputAdornment>
                      ) : null
                    }}
                    sx={inputSx}
                  />
                </Grid>

                {/* Category Chips Scrollable */}
                <Grid size={12}>
                  <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5, '::-webkit-scrollbar': { height: 4 } }}>
                    {categoryNames.map((cat) => {
                      const isSel = selectedCategory === cat;
                      return (
                        <Chip
                          key={cat}
                          label={cat}
                          clickable
                          onClick={() => setSelectedCategory(cat)}
                          sx={{
                            fontWeight: isSel ? 700 : 500,
                            bgcolor: isSel ? COLORS.primary : COLORS.surfaceContainerLow,
                            color: isSel ? COLORS.white : COLORS.primary,
                            '&:hover': { bgcolor: isSel ? COLORS.primary : COLORS.surfaceContainer },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Menu Items Grid */}
            <Box sx={{ ...cardSx, flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <T variant="titleMd" sx={{ color: COLORS.primary, fontWeight: 700 }}>
                  Menu Catalog ({filteredMenuItems.length})
                </T>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {!isManual && (
                    <Chip
                      label="Loaded from Table Order"
                      size="small"
                      color="warning"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  <Tooltip title={reorderMode ? 'Exit reorder mode' : 'Reorder items (drag & drop)'}>
                    <Box
                      onClick={() => setReorderMode(!reorderMode)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5,
                        borderRadius: '8px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        bgcolor: reorderMode ? COLORS.accentOrange : COLORS.surfaceContainerLow,
                        color: reorderMode ? COLORS.white : COLORS.primary,
                        border: `1px solid ${reorderMode ? COLORS.accentOrange : COLORS.outlineVariant}`,
                        transition: 'all 0.2s',
                        '&:hover': { opacity: 0.85 }
                      }}
                    >
                      <SwapVertIcon sx={{ fontSize: 16 }} />
                      {reorderMode ? 'Done' : 'Reorder'}
                    </Box>
                  </Tooltip>
                </Box>
              </Box>

              {/* Grid of Items — with DnD support */}
              <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
                    <Grid container spacing={2}>
                      {filteredMenuItems.map((item) => {
                        const itemId = item._id || item.id || item.name;
                        const inCart = cart.find((c) => (c.itemId && c.itemId === itemId) || c.name === item.name);
                        
                        return (
                          <Grid key={itemId} size={{ xs: 12, sm: 6, md: 4 }}>
                            <SortableMenuItemCard
                              id={itemId}
                              item={item}
                              isManual={isManual}
                              inCart={!!inCart}
                              onAdd={addToCart}
                              reorderMode={reorderMode}
                            />
                          </Grid>
                        );
                      })}

                      {filteredMenuItems.length === 0 && (
                        <Grid size={12}>
                          <Box sx={{ py: 6, textAlign: 'center' }}>
                            <RestaurantMenuIcon sx={{ fontSize: 48, color: COLORS.secondary, mb: 1, opacity: 0.5 }} />
                            <T variant="bodyLg" sx={{ color: COLORS.secondary, fontWeight: 600 }}>No items found matching filter.</T>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </SortableContext>
                </DndContext>
              </Box>

              {/* Custom Off-Menu Item Entry */}
              {isManual && (
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${COLORS.outlineVariant}` }}>
                  <T variant="labelSm" sx={{ color: COLORS.secondary, mb: 1, display: 'block' }}>+ Add Custom Off-Menu Item</T>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField placeholder="Item Name" size="small" value={customName} onChange={(e) => setCustomName(e.target.value)} sx={{ flex: 2, ...inputSx }} />
                    <TextField placeholder="Price ₹" type="number" size="small" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} sx={{ flex: 1, ...inputSx }} />
                    <Box
                      onClick={addCustomItem}
                      sx={{
                        px: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: COLORS.accentOrange, color: COLORS.white, borderRadius: '12px', fontWeight: 700,
                        cursor: customName.trim() && customPrice ? 'pointer' : 'not-allowed',
                        opacity: customName.trim() && customPrice ? 1 : 0.6,
                      }}
                    >
                      <AddIcon />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>

        {/* ================= RIGHT 35%: CART & ORDER REVIEW ================= */}
        <Grid size={{ xs: 12, lg: 4.5 }}>
          <Box sx={{ ...cardSx, p: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            
            {/* Header */}
            <Box sx={{ p: 1.5, bgcolor: COLORS.surfaceHighlight, borderBottom: `1px solid ${COLORS.outlineVariant}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <T variant="titleMd" sx={{ color: COLORS.primary, fontWeight: 800 }}>Order Cart</T>
                <Chip label={`${previewItems.reduce((s, i) => s + (i.qty || 1), 0)} Items`} size="small" color="primary" sx={{ fontWeight: 700 }} />
              </Box>
            </Box>

            {/* Scrollable Middle Section: Cart Items + Order Review */}
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {/* Cart Items List */}
              <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {previewItems.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <RestaurantIcon sx={{ fontSize: 40, color: COLORS.secondary, opacity: 0.4, mb: 1 }} />
                  <T variant="bodyMd" sx={{ color: COLORS.secondary, fontWeight: 500 }}>
                    Cart is empty. Select items from the catalog.
                  </T>
                </Box>
              ) : (
                previewItems.map((it, idx) => (
                  <Box key={it.id || idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px', bgcolor: COLORS.surfaceContainerLow }}>
                    <Box sx={{ flex: 1 }}>
                      <T variant="bodyMd" sx={{ fontWeight: 700, color: COLORS.primary }}>{it.name}</T>
                      <T variant="labelSm" sx={{ color: COLORS.secondary }}>{currency(it.price)} each</T>
                    </Box>
                    
                    {isManual ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton size="small" onClick={() => updateCartQty(it.id, -1)}>
                          <RemoveIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <T variant="bodyMd" sx={{ fontWeight: 800, minWidth: 18, textAlign: 'center' }}>{it.qty}</T>
                        <IconButton size="small" onClick={() => updateCartQty(it.id, 1)}>
                          <AddIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => removeFromCart(it.id)}>
                          <DeleteOutlineIcon sx={{ fontSize: 16, color: COLORS.error }} />
                        </IconButton>
                      </Box>
                    ) : (
                      <T variant="bodyMd" sx={{ fontWeight: 700 }}>× {it.qty}</T>
                    )}

                    <T variant="bodyMd" sx={{ fontWeight: 800, minWidth: 60, textAlign: 'right', color: COLORS.primary }}>
                      {currency(it.price * it.qty)}
                    </T>
                  </Box>
                ))
              )}
            </Box>

            <Divider sx={{ borderColor: COLORS.outlineVariant }} />

            {/* Order Review Details & Metadata */}
            <Box sx={{ p: 1.5, bgcolor: COLORS.white, display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              {/* Order Type Chips */}
              <Box>
                <T variant="labelSm" sx={{ color: COLORS.secondary, mb: 1, display: 'block' }}>Order Type</T>
                <Grid container spacing={1}>
                  {ORDER_TYPES.map((t) => {
                    const IconComp = t.icon;
                    const isSel = orderType === t.value;
                    return (
                      <Grid key={t.value} size={4}>
                        <Box
                          onClick={() => setOrderType(t.value)}
                          sx={{
                            py: 1, px: 1, borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                            border: `1.5px solid ${isSel ? COLORS.primary : COLORS.outlineVariant}`,
                            bgcolor: isSel ? `${COLORS.primary}0D` : COLORS.white,
                            color: isSel ? COLORS.primary : COLORS.secondary,
                            fontWeight: isSel ? 700 : 500, fontSize: 12,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5
                          }}
                        >
                          <IconComp sx={{ fontSize: 18 }} />
                          {t.label}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {/* Table & Optional Customer Toggle */}
              <Grid container spacing={1.5}>
                <Grid size={6}>
                  <TextField
                    label="Table No." placeholder="e.g. T-04" size="small" fullWidth
                    value={tableNumber} onChange={(e) => setTableNumber(e.target.value)}
                    sx={inputSx}
                  />
                </Grid>
                <Grid size={6}>
                  <Box
                    onClick={() => setShowCustomerDetails(!showCustomerDetails)}
                    sx={{
                      height: 40, border: `1px solid ${COLORS.outlineVariant}`, borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                      cursor: 'pointer', color: COLORS.primary, fontWeight: 600, fontSize: 13,
                      bgcolor: showCustomerDetails ? `${COLORS.primary}0D` : COLORS.white
                    }}
                  >
                    <PersonAddIcon sx={{ fontSize: 16 }} />
                    {showCustomerDetails ? 'Hide Info' : '+ Customer (Opt)'}
                  </Box>
                </Grid>
              </Grid>

              {/* Collapsible Customer Details (Optional) */}
              {showCustomerDetails && (
                <Grid container spacing={1.5}>
                  <Grid size={6}>
                    <TextField label="Customer Name" size="small" fullWidth value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in Guest" sx={inputSx} />
                  </Grid>
                  <Grid size={6}>
                    <TextField label="Phone Number" size="small" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 00000 00000" sx={inputSx} />
                  </Grid>
                </Grid>
              )}

              {/* Adjustments: GST & Discount */}
              <Grid container spacing={1.5}>
                <Grid size={6}>
                  <TextField select label="GST (%)" size="small" fullWidth value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} sx={inputSx}>
                    {GST_OPTIONS.map((g) => (
                      <MenuItem key={g} value={g}>{g}% GST</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={6}>
                  <TextField label="Discount (%)" type="number" size="small" fullWidth value={discountRate} onChange={(e) => setDiscountRate(Number(e.target.value) || 0)} placeholder="0" sx={inputSx} />
                </Grid>
              </Grid>

              <TextField label="Notes / Kitchen Instructions" size="small" fullWidth value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Extra spicy, less oil" sx={inputSx} />

              {errorMsg && <T variant="bodyMd" sx={{ color: COLORS.error, fontSize: 13 }}>{errorMsg}</T>}
            </Box>

            {/* Totals & Submit Footer */}
            <Box sx={{ p: 1.5, bgcolor: COLORS.surfaceContainerLow, borderTop: `1px solid ${COLORS.outlineVariant}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <T variant="labelSm" sx={{ color: COLORS.secondary }}>Subtotal</T>
                <T variant="bodyMd" sx={{ fontWeight: 600 }}>{currency(subtotal)}</T>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <T variant="labelSm" sx={{ color: COLORS.secondary }}>GST ({gstRate}%)</T>
                <T variant="bodyMd" sx={{ fontWeight: 600, color: COLORS.statusReady }}>+ {currency(gstAmount)}</T>
              </Box>
              {discountRate > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <T variant="labelSm" sx={{ color: COLORS.secondary }}>Discount ({discountRate}%)</T>
                  <T variant="bodyMd" sx={{ fontWeight: 600, color: COLORS.accentOrange }}>− {currency(discountAmount)}</T>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${COLORS.outlineVariant}`, mb: 2 }}>
                <T variant="titleMd" sx={{ color: COLORS.primary, fontWeight: 800 }}>Grand Total</T>
                <T variant="headlineLg" sx={{ color: COLORS.primary, fontWeight: 900 }}>{currency(total)}</T>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Box
                  onClick={() => submit(false)}
                  sx={{
                    flex: 1, py: 1.25, textAlign: 'center', borderRadius: '14px', fontWeight: 700, fontSize: 14,
                    bgcolor: canSubmit ? COLORS.primary : COLORS.surfaceContainerHigh,
                    color: canSubmit ? COLORS.white : COLORS.secondary,
                    cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s', '&:active': canSubmit ? { transform: 'scale(0.98)' } : {},
                    '&:hover': canSubmit ? { bgcolor: COLORS.accentOrange } : {},
                  }}
                >
                  {submitting ? 'Generating…' : 'Generate Invoice & Bill'}
                </Box>
                <Box
                  onClick={() => submit(true)}
                  sx={{
                    px: 2.5, py: 1.25, textAlign: 'center', borderRadius: '14px', fontWeight: 700, fontSize: 14,
                    border: `1.5px solid ${COLORS.outlineVariant}`, color: COLORS.primary,
                    cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
                    '&:hover': { bgcolor: COLORS.surfaceContainerLow },
                  }}
                >
                  Draft
                </Box>
              </Box>
            </Box>
          </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateInvoicePage;