import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { T } from './inventory/inventoryShared';
import { COLORS, TYPE, FONT } from './inventory/inventoryTokens';
import { OverviewTab, IngredientsTab, SuppliersTab, PurchasesTab, RecipesTab, ReportsTab } from './inventory/InventoryTabs';
import { SidePanel, IngredientDrawerContent, SupplierDrawerContent, PODrawerContent } from './inventory/InventoryDrawers';
import {
  Toast, IngredientFormModal, SupplierFormModal,
  POFormModal, ReceivePOModal, RecipeFormModal,
} from './inventory/InventoryModals';
// NOTE: AdjustStockModal is NOT imported — it was removed (its Quantity +
// Type fields now live inside IngredientFormModal). The old
// `modal?.type === 'adjust'` block that rendered <AdjustStockModal /> further
// down this file has been removed too — it was referencing a component that
// no longer exists, which would have thrown a ReferenceError the moment
// anything tried to open it.

const TABS = ['Overview', 'Suppliers', 'Ingredients', 'Purchases', 'Recipes', 'Reports'];

const DRAWER_ENDPOINT = {
  ingredient: (id) => `/api/inventory/ingredients/${id}`,
  supplier: (id) => `/api/inventory/suppliers/${id}`,
  po: (id) => `/api/inventory/purchase-orders/${id}`,
};

export default function InventoryView() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [toast, setToast] = useState(null);
  const [featureDisabled, setFeatureDisabled] = useState(null);

  // ── Reference data (loaded eagerly — needed by selects across tabs) ──
  const [ingredients, setIngredients] = useState([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);
  // CHANGE: `categoryOptions` state removed entirely. It used to be built
  // from `[...new Set(data.map((i) => i.category))]`, but ingredients no
  // longer have a `category` field at all — that line was silently
  // producing a `[undefined]` array, which is exactly what was showing up
  // as "category not defined" wherever it got rendered.
  const [filters, setFilters] = useState({ search: '', status: '' }); // `category` key removed
  const didMountFilters = useRef(false);

  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);

  // ── Purchase orders (lazy) ──
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poLoading, setPoLoading] = useState(false);
  const [poStatusFilter, setPoStatusFilter] = useState('');
  const poVisited = useRef(false);

  // ── Recipes (lazy) ──
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const recipesVisited = useRef(false);

  // ── Overview / Reports ──
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [reports, setReports] = useState({ valuationTrend: [], topCostDrivers: [], wasteByCategory: [] });
  const [reportsLoading, setReportsLoading] = useState(false);

  // ── Drawer (read-only detail panel) ──
  const [drawer, setDrawer] = useState(null); // { type, id }
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  // ── Modal (create/edit/receive forms) ──
  const [modal, setModal] = useState(null); // { type, target }

  const showToast = (message, severity = 'success') => setToast({ message, severity });

  // ---------------------------------------------------------------------
  // Fetchers
  // ---------------------------------------------------------------------
  async function fetchIngredients(f = filters) {
    setIngredientsLoading(true);
    try {
      const params = {};
      if (f.search) params.search = f.search;
      if (f.status) params.status = f.status;
      // `category` param removed — the backend no longer needs/accepts it
      const { data } = await api.get('/api/inventory/ingredients', { params });
      setIngredients(data);
      return data;
    } catch (e) {
      if (e?.response?.status === 403) setFeatureDisabled(e.response.data?.message);
      return [];
    } finally {
      setIngredientsLoading(false);
    }
  }

  async function fetchSuppliers() {
    setSuppliersLoading(true);
    try {
      const { data } = await api.get('/api/inventory/suppliers');
      setSuppliers(data);
      return data;
    } catch (e) {
      if (e?.response?.status === 403) setFeatureDisabled(e.response.data?.message);
      return [];
    } finally {
      setSuppliersLoading(false);
    }
  }

  async function fetchPurchaseOrders(status = poStatusFilter) {
    setPoLoading(true);
    try {
      const params = status ? { status } : {};
      const { data } = await api.get('/api/inventory/purchase-orders', { params });
      setPurchaseOrders(data);
    } catch { /* silent */ } finally {
      setPoLoading(false);
    }
  }

  async function fetchRecipes() {
    setRecipesLoading(true);
    try {
      const { data } = await api.get('/api/inventory/recipes');
      setRecipes(data);
    } catch { /* silent */ } finally {
      setRecipesLoading(false);
    }
  }

  async function fetchMenuItems() {
    try {
      const { data } = await api.get('/api/menu-items');
      setMenuItems(data);
    } catch { /* menu feature may be disabled — ignore */ }
  }

  async function fetchOverview() {
    setOverviewLoading(true);
    try {
      const { data } = await api.get('/api/inventory/dashboard/overview');
      setOverview(data);
    } catch { /* silent */ } finally {
      setOverviewLoading(false);
    }
  }

  async function fetchReports() {
    setReportsLoading(true);
    try {
      const [trendRes, driversRes, wasteRes] = await Promise.all([
        api.get('/api/inventory/dashboard/reports/valuation-trend', { params: { days: 30 } }),
        api.get('/api/inventory/dashboard/reports/top-cost-drivers', { params: { limit: 5 } }),
        api.get('/api/inventory/dashboard/reports/waste-by-category', { params: { days: 30 } }),
      ]);
      setReports({ valuationTrend: trendRes.data, topCostDrivers: driversRes.data, wasteByCategory: wasteRes.data });
    } catch { /* silent */ } finally {
      setReportsLoading(false);
    }
  }

  // ---------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------
  useEffect(() => {
    const id = 'lumiere-font-link';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    // `category` removed from the initial filter object, and the
    // categoryOptions-building line that followed this call is gone
    fetchIngredients({ search: '', status: '' });
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (!didMountFilters.current) { didMountFilters.current = true; return; }
    if (featureDisabled) return;
    const t = setTimeout(() => { fetchIngredients(); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status]);

  useEffect(() => {
    if (featureDisabled) return;
    if (activeTab === 'Purchases' && !poVisited.current) { poVisited.current = true; fetchPurchaseOrders(''); }
    if (activeTab === 'Recipes' && !recipesVisited.current) { recipesVisited.current = true; fetchRecipes(); fetchMenuItems(); }
    if (activeTab === 'Overview') fetchOverview();
    if (activeTab === 'Reports') fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, featureDisabled]);

  useEffect(() => {
    if (!poVisited.current) return;
    fetchPurchaseOrders(poStatusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poStatusFilter]);

  useEffect(() => {
    if (!selectedRecipeId && recipes.length > 0) setSelectedRecipeId(recipes[0]._id);
  }, [recipes, selectedRecipeId]);

  const selectedRecipe = useMemo(() => recipes.find((r) => r._id === selectedRecipeId) || null, [recipes, selectedRecipeId]);

  // ---------------------------------------------------------------------
  // Drawer helpers
  // ---------------------------------------------------------------------
  async function openDrawer(type, id) {
    setDrawer({ type, id });
    setDrawerData(null);
    setDrawerLoading(true);
    try {
      const { data } = await api.get(DRAWER_ENDPOINT[type](id));
      setDrawerData(data);
    } catch {
      showToast('Failed to load details', 'error');
      setDrawer(null);
    } finally {
      setDrawerLoading(false);
    }
  }
  function closeDrawer() { setDrawer(null); setDrawerData(null); }

  async function refreshDrawerData() {
    if (!drawer) return;
    try {
      const { data } = await api.get(DRAWER_ENDPOINT[drawer.type](drawer.id));
      setDrawerData(data);
    } catch { /* silent */ }
  }

  async function handleStatusChange(newStatus) {
    setStatusChanging(true);
    try {
      await api.put(`/api/inventory/purchase-orders/${drawerData._id}/status`, { status: newStatus });
      await Promise.all([refreshDrawerData(), fetchPurchaseOrders(poStatusFilter)]);
      showToast('Status updated');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setStatusChanging(false);
    }
  }

  // ---------------------------------------------------------------------
  // Delete handlers
  // ---------------------------------------------------------------------
  async function handleDeleteIngredient(ingredient) {
    if (!window.confirm(`Delete "${ingredient.name}" permanently?`)) return;
    try {
      await api.delete(`/api/inventory/ingredients/${ingredient._id}`);
      fetchIngredients();
      closeDrawer();
      showToast('Ingredient deleted');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to delete ingredient', 'error');
    }
  }

  async function handleDeleteSupplier(supplier) {
    if (!window.confirm(`Delete "${supplier.name}" permanently?`)) return;
    try {
      await api.delete(`/api/inventory/suppliers/${supplier._id}`);
      fetchSuppliers();
      closeDrawer();
      showToast('Supplier deleted');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to delete supplier', 'error');
    }
  }

  async function handleDeletePO(po) {
    if (!window.confirm(`Delete draft order ${po.poNumber}?`)) return;
    try {
      await api.delete(`/api/inventory/purchase-orders/${po._id}`);
      fetchPurchaseOrders(poStatusFilter);
      closeDrawer();
      showToast('Purchase order deleted');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to delete purchase order', 'error');
    }
  }

  async function handleDeleteRecipe(recipe) {
    if (!window.confirm(`Delete recipe "${recipe.name}"?`)) return;
    try {
      await api.delete(`/api/inventory/recipes/${recipe._id}`);
      if (selectedRecipeId === recipe._id) setSelectedRecipeId(null);
      fetchRecipes();
      showToast('Recipe deleted');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to delete recipe', 'error');
    }
  }

  // ---------------------------------------------------------------------
  // Modal save callbacks
  // ---------------------------------------------------------------------
  function onIngredientSaved(msg) { fetchIngredients(); setModal(null); closeDrawer(); showToast(msg); }
  function onSupplierSaved(msg) { fetchSuppliers(); setModal(null); closeDrawer(); showToast(msg); }
  // NOTE: `onAdjustSaved` removed — it only existed for the old AdjustStockModal.
  // IngredientFormModal now handles its own save (including any stock
  // adjustment) through `onIngredientSaved` above.
  function onPOSaved(msg) { fetchPurchaseOrders(poStatusFilter); setModal(null); closeDrawer(); showToast(msg); }
  function onReceiveSaved(msg) { fetchPurchaseOrders(poStatusFilter); fetchIngredients(); setModal(null); closeDrawer(); showToast(msg); }
  function onRecipeSaved(msg) { fetchRecipes(); setModal(null); showToast(msg); }

  // ---------------------------------------------------------------------
  // FAB
  // ---------------------------------------------------------------------
  const FAB_ACTIONS = {
    Ingredients: () => setModal({ type: 'ingredient-form', target: null }),
    Suppliers: () => setModal({ type: 'supplier-form', target: null }),
    Purchases: () => setModal({ type: 'po-form', target: null }),
    Recipes: () => setModal({ type: 'recipe-form', target: null }),
  };

  const TAB_CONTENT = {
    Overview: () => <OverviewTab data={overview} loading={overviewLoading} />,
    Ingredients: () => (
      // `categories` prop removed — IngredientsTab no longer accepts/uses it
      <IngredientsTab
        ingredients={ingredients} loading={ingredientsLoading} filters={filters} setFilters={setFilters}
        onRowClick={(row) => openDrawer('ingredient', row._id)}
      />
    ),
    Suppliers: () => (
      <SuppliersTab suppliers={suppliers} loading={suppliersLoading} onCardClick={(s) => openDrawer('supplier', s._id)} />
    ),
    Purchases: () => (
      <PurchasesTab
        orders={purchaseOrders} loading={poLoading} statusFilter={poStatusFilter} setStatusFilter={setPoStatusFilter}
        onCreateClick={() => setModal({ type: 'po-form', target: null })}
        onDetailsClick={(po) => openDrawer('po', po._id)}
      />
    ),
    Recipes: () => (
      <RecipesTab
        recipes={recipes} loading={recipesLoading} search={recipeSearch} setSearch={setRecipeSearch}
        selected={selectedRecipe} onSelect={(r) => setSelectedRecipeId(r._id)}
        onAdd={() => setModal({ type: 'recipe-form', target: null })}
        onEdit={(r) => setModal({ type: 'recipe-form', target: r })}
        onDelete={handleDeleteRecipe}
      />
    ),
    Reports: () => (
      <ReportsTab
        valuationTrend={reports.valuationTrend} topCostDrivers={reports.topCostDrivers}
        wasteByCategory={reports.wasteByCategory} loading={reportsLoading}
      />
    ),
  };
  const ActiveContent = TAB_CONTENT[activeTab];

  if (featureDisabled) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, textAlign: 'center', p: 4 }}>
        <Box>
          <LockIcon sx={{ fontSize: 48, color: COLORS.outlineVariant, mb: 2 }} />
          <T variant="titleMd" sx={{ mb: 1 }}>Inventory is unavailable</T>
          <T variant="bodyMd" sx={{ color: COLORS.secondary, maxWidth: 420 }}>{featureDisabled}</T>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: COLORS.background, minHeight: '100%', fontFamily: FONT, position: 'relative' }}>
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{ style: { backgroundColor: COLORS.primary, height: 2 } }}
        sx={{ px: 3, borderBottom: `1px solid ${COLORS.outlineVariant}4D`, minHeight: 56, '& .MuiTabs-flexContainer': { gap: 4 } }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab} label={tab} value={tab} disableRipple
            sx={{ ...TYPE.navLg, minHeight: 56, px: 0, color: COLORS.secondary, '&.Mui-selected': { color: COLORS.primary, fontWeight: 600 } }}
          />
        ))}
      </Tabs>

      <Box sx={{ p: 3, pb: 12 }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
            <ActiveContent />
          </motion.div>
        </AnimatePresence>
      </Box>

      {FAB_ACTIONS[activeTab] && (
        <Box
          onClick={FAB_ACTIONS[activeTab]}
          sx={{
            position: 'fixed', bottom: 32, right: 32, width: 56, height: 56, borderRadius: '50%',
            bgcolor: COLORS.primary, color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.18)', transition: 'transform 0.15s, box-shadow 0.15s', zIndex: 20,
            '&:hover': { transform: 'scale(1.05)', boxShadow: '0 10px 24px rgba(0,0,0,0.22)' },
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </Box>
      )}

      {/* ── Detail drawer ── */}
      <SidePanel
        open={!!drawer} onClose={closeDrawer} loading={drawerLoading}
        title={drawer?.type === 'ingredient' ? 'Ingredient Details' : drawer?.type === 'supplier' ? 'Supplier Profile' : drawer?.type === 'po' ? 'Purchase Order' : ''}
      >
        {drawerData && drawer?.type === 'ingredient' && (
          // `onAdjust` prop removed — IngredientDrawerContent no longer accepts it
          <IngredientDrawerContent
            data={drawerData}
            onEdit={() => setModal({ type: 'ingredient-form', target: drawerData })}
            onDelete={() => handleDeleteIngredient(drawerData)}
          />
        )}
        {drawerData && drawer?.type === 'supplier' && (
          <SupplierDrawerContent
            data={drawerData}
            onEdit={() => setModal({ type: 'supplier-form', target: drawerData })}
            onDelete={() => handleDeleteSupplier(drawerData)}
          />
        )}
        {drawerData && drawer?.type === 'po' && (
          <PODrawerContent
            data={drawerData}
            onEdit={() => setModal({ type: 'po-form', target: drawerData })}
            onDelete={() => handleDeletePO(drawerData)}
            onReceive={() => setModal({ type: 'receive', target: drawerData })}
            onStatusChange={handleStatusChange}
            statusChanging={statusChanging}
          />
        )}
      </SidePanel>

      {/* ── Forms ── */}
      {modal?.type === 'ingredient-form' && (
        <IngredientFormModal target={modal.target} suppliers={suppliers} onClose={() => setModal(null)} onSaved={onIngredientSaved} />
      )}
      {modal?.type === 'supplier-form' && (
        <SupplierFormModal target={modal.target} onClose={() => setModal(null)} onSaved={onSupplierSaved} />
      )}
      {/* `modal?.type === 'adjust'` block removed — AdjustStockModal no longer exists */}
      {modal?.type === 'po-form' && (
        <POFormModal target={modal.target} suppliers={suppliers} ingredients={ingredients} onClose={() => setModal(null)} onSaved={onPOSaved} />
      )}
      {modal?.type === 'receive' && (
        <ReceivePOModal po={modal.target} onClose={() => setModal(null)} onSaved={onReceiveSaved} />
      )}
      {modal?.type === 'recipe-form' && (
        <RecipeFormModal target={modal.target} ingredients={ingredients} menuItems={menuItems} onClose={() => setModal(null)} onSaved={onRecipeSaved} />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </Box>
  );
}