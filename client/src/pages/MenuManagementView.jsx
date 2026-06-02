import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useTokens } from '../ThemeContext';
import api from '../api';

const M = motion.create(Box);

const EMPTY_FORM = {
  name: '', description: '', price: '', categoryId: '', isVeg: true, isAvailable: true, image: '',
};

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  const T = useTokens();
  return (
    <Box>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</Typography>
      <Box
        component="input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        sx={{
          width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`,
          borderRadius: '0.5rem', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text,
          outline: 'none', boxSizing: 'border-box', '&:focus': { borderColor: '#5341cd' },
        }}
      />
    </Box>
  );
}

export default function MenuManagementView() {
  const T = useTokens();

  const [categories, setCategories]   = useState([]);
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [activeCat, setActiveCat]     = useState('all');

  const [showForm, setShowForm]       = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [formErr, setFormErr]         = useState('');
  const [uploading, setUploading]     = useState(false);

  // Category management
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat]           = useState(null);
  const [catName, setCatName]           = useState('');
  const [catSaving, setCatSaving]       = useState(false);
  const [catErr, setCatErr]             = useState('');

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, itemRes] = await Promise.all([
        api.get('/api/categories'),
        api.get('/api/menu-items'),
      ]);
      setCategories(catRes.data);
      setItems(itemRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Filter ── */
  const filtered = items.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = activeCat === 'all' || item.categoryId === activeCat || item.categoryId?._id === activeCat;
    return matchSearch && matchCat;
  });

  /* ── Category name lookup ── */
  function getCatName(id) {
    const c = categories.find(c => c._id === id || c._id === id?._id);
    return c?.name || '';
  }

  /* ── Toggle availability ── */
  async function toggleAvailability(item) {
    try {
      const { data } = await api.put(`/api/menu-items/${item._id}`, { isAvailable: !item.isAvailable });
      setItems(prev => prev.map(i => i._id === data._id ? data : i));
    } catch {
      // silent
    }
  }

  /* ── Delete ── */
  async function handleDelete(id) {
    if (!window.confirm('Delete this menu item permanently?')) return;
    try {
      await api.delete(`/api/menu-items/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch {
      // silent
    }
  }

  /* ── Form open ── */
  function openAdd() {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?._id || '' });
    setFormErr('');
    setShowForm(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      name:        item.name,
      description: item.description || '',
      price:       String(item.price),
      categoryId:  item.categoryId?._id || item.categoryId || '',
      isVeg:       item.isVeg !== false,
      isAvailable: item.isAvailable !== false,
      image:       item.image || '',
    });
    setFormErr('');
    setShowForm(true);
  }

  /* ── Category CRUD ── */
  function openAddCat() {
    setEditCat(null);
    setCatName('');
    setCatErr('');
    setShowCatModal(true);
  }

  function openEditCat(cat) {
    setEditCat(cat);
    setCatName(cat.name);
    setCatErr('');
    setShowCatModal(true);
  }

  async function handleSaveCat() {
    if (!catName.trim()) { setCatErr('Category name is required.'); return; }
    setCatSaving(true);
    setCatErr('');
    try {
      if (editCat) {
        await api.put(`/api/categories/${editCat._id}`, { name: catName.trim() });
      } else {
        await api.post('/api/categories', { name: catName.trim() });
      }
      await fetchAll();
      setShowCatModal(false);
    } catch (e) {
      setCatErr(e?.response?.data?.message || 'Save failed.');
    } finally {
      setCatSaving(false);
    }
  }

  async function handleDeleteCat(cat) {
    if (!window.confirm(`Delete category "${cat.name}"? Items in this category will lose their category.`)) return;
    try {
      await api.delete(`/api/categories/${cat._id}`);
      if (activeCat === cat._id) setActiveCat('all');
      await fetchAll();
    } catch {
      // silent
    }
  }

  /* ── Image upload ── */
  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(p => ({ ...p, image: data.imageUrl }));
    } catch {
      setFormErr('Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  /* ── Save ── */
  async function handleSave() {
    if (!form.name.trim() || !form.price || !form.categoryId) {
      setFormErr('Name, price, and category are required.');
      return;
    }
    setSaving(true);
    setFormErr('');
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editItem) {
        await api.put(`/api/menu-items/${editItem._id}`, payload);
      } else {
        await api.post('/api/menu-items', payload);
      }
      await fetchAll();
      setShowForm(false);
    } catch (e) {
      setFormErr(e?.response?.data?.message || 'Save failed. Try again.');
    } finally {
      setSaving(false);
    }
  }

  /* ─────────── RENDER ─────────── */
  return (
    <M
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ display: 'flex', flexDirection: 'column', color: T.text }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-end' }, justifyContent: 'space-between', gap: 3, mb: 5 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#5341cd', mb: 1 }}>Administration</Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 900, color: T.text, letterSpacing: '-0.05em', lineHeight: 1 }}>Menu Management</Typography>
          <Typography sx={{ color: T.textSub, mt: 1.5, fontSize: '1rem' }}>
            Curate your digital culinary experience — manage items, update pricing, and control availability.
          </Typography>
        </Box>
        <Box
          component="button"
          onClick={openAdd}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, alignSelf: { xs: 'flex-start', md: 'auto' },
            background: 'linear-gradient(135deg, #5341CD, #6C5CE7)', color: '#fff',
            px: 3, py: 1.5, borderRadius: '9999px', fontWeight: 700, border: 'none',
            cursor: 'pointer', boxShadow: '0 10px 20px rgba(83,65,205,0.2)',
            fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
            '&:hover': { opacity: 0.9 }, transition: 'opacity 0.2s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
          Add New Item
        </Box>
      </Box>

      {/* Search + Category filter */}
      <Box sx={{ bgcolor: T.surfaceAlt, borderRadius: '0.75rem', p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 5 }}>
        <Box sx={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 18 }}>search</span>
          <Box
            component="input"
            placeholder="Search dish name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{
              width: '100%', bgcolor: T.surface, border: 'none', height: 44, pl: '44px', pr: 3,
              borderRadius: '9999px', outline: 'none', color: T.text, fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem', boxSizing: 'border-box',
              '&:focus': { boxShadow: '0 0 0 2px rgba(83,65,205,0.2)' },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* All Items pill */}
          <Box
            component="button"
            onClick={() => setActiveCat('all')}
            sx={{
              px: 3, py: 0.75, borderRadius: '9999px', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.15s',
              bgcolor: activeCat === 'all' ? '#5341cd' : T.surface,
              color:   activeCat === 'all' ? '#fff'    : T.textSub,
              boxShadow: activeCat === 'all' ? '0 4px 6px rgba(83,65,205,0.2)' : 'none',
            }}
          >
            All Items
          </Box>

          {/* Category pills with edit/delete */}
          {categories.map(cat => (
            <Box
              key={cat._id}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                bgcolor: activeCat === cat._id ? '#5341cd' : T.surface,
                borderRadius: '9999px', transition: 'all 0.15s',
                boxShadow: activeCat === cat._id ? '0 4px 6px rgba(83,65,205,0.2)' : 'none',
                '&:hover .cat-actions': { opacity: 1 },
              }}
            >
              <Box
                component="button"
                onClick={() => setActiveCat(cat._id)}
                sx={{
                  px: 2.5, py: 0.75, borderRadius: '9999px', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700,
                  bgcolor: 'transparent',
                  color: activeCat === cat._id ? '#fff' : T.textSub,
                }}
              >
                {cat.name}
              </Box>
              <Box className="cat-actions" sx={{ display: 'flex', opacity: 0, transition: 'opacity 0.15s', pr: 0.5, gap: 0.25 }}>
                <Box
                  component="button"
                  onClick={(e) => { e.stopPropagation(); openEditCat(cat); }}
                  title="Edit category"
                  sx={{
                    p: '3px', bgcolor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '50%',
                    color: activeCat === cat._id ? 'rgba(255,255,255,0.7)' : T.textMuted,
                    display: 'flex', '&:hover': { color: activeCat === cat._id ? '#fff' : '#5341cd' },
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                </Box>
                <Box
                  component="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteCat(cat); }}
                  title="Delete category"
                  sx={{
                    p: '3px', bgcolor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '50%',
                    color: activeCat === cat._id ? 'rgba(255,255,255,0.7)' : T.textMuted,
                    display: 'flex', '&:hover': { color: '#ba1a1a' },
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
                </Box>
              </Box>
            </Box>
          ))}

          {/* Add category button */}
          <Box
            component="button"
            onClick={openAddCat}
            sx={{
              px: 2.5, py: 0.75, borderRadius: '9999px', border: `1.5px dashed ${T.surfaceHigh}`,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700,
              bgcolor: 'transparent', color: T.textMuted, display: 'flex', alignItems: 'center', gap: 0.5,
              transition: 'all 0.15s',
              '&:hover': { borderColor: '#5341cd', color: '#5341cd', bgcolor: 'rgba(83,65,205,0.05)' },
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
            Category
          </Box>
        </Box>
      </Box>

      {/* Items grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#5341cd' }} />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 4 }}>
          {filtered.map(item => (
            <Box key={item._id} sx={{
              bgcolor: T.surface, borderRadius: '0.75rem', overflow: 'hidden',
              transition: 'all 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: T.shadowHov },
              boxShadow: T.shadow,
            }}>
              {/* Image */}
              <Box sx={{ height: 220, position: 'relative', overflow: 'hidden', bgcolor: T.surfaceAlt }}>
                {item.image ? (
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: T.textMuted }}>restaurant</span>
                  </Box>
                )}
                <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
                  <Box component="span" sx={{
                    bgcolor: item.isVeg !== false ? '#6cf8bb' : 'rgba(186,26,26,0.9)',
                    color:   item.isVeg !== false ? '#00714d' : '#fff',
                    px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '10px', fontWeight: 900,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {item.isVeg !== false ? 'Veg' : 'Non-Veg'}
                  </Box>
                  {getCatName(item.categoryId) && (
                    <Box component="span" sx={{
                      bgcolor: 'rgba(83,65,205,0.88)', color: '#fff',
                      px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '10px', fontWeight: 900,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      {getCatName(item.categoryId)}
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Info */}
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: T.text, lineHeight: 1.25, pr: 1 }}>{item.name}</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#5341cd', flexShrink: 0 }}>₹{item.price}</Typography>
                </Box>
                {item.description && (
                  <Typography sx={{ color: T.textSub, fontSize: '0.875rem', mb: 2, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </Typography>
                )}

                {/* Footer */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2, borderTop: `1px solid ${T.surfaceHigh}` }}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                    onClick={() => toggleAvailability(item)}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textSub }}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </Typography>
                    <Box sx={{
                      width: 44, height: 22, borderRadius: '9999px', p: '3px', position: 'relative',
                      bgcolor: item.isAvailable ? '#6cf8bb' : T.surfaceHigh, transition: 'background-color 0.2s',
                    }}>
                      <Box sx={{
                        width: 16, height: 16, bgcolor: '#fff', borderRadius: '50%',
                        position: 'absolute', transition: 'left 0.2s',
                        left: item.isAvailable ? 'calc(100% - 19px)' : '3px',
                      }} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Box component="button" onClick={() => openEdit(item)} sx={{
                      p: 1, bgcolor: T.surfaceAlt, border: 'none', cursor: 'pointer', borderRadius: '0.5rem',
                      color: T.textSub, display: 'flex', '&:hover': { bgcolor: T.surfaceHigh, color: '#5341cd' },
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                    </Box>
                    <Box component="button" onClick={() => handleDelete(item._id)} sx={{
                      p: 1, bgcolor: T.surfaceAlt, border: 'none', cursor: 'pointer', borderRadius: '0.5rem',
                      color: T.textSub, display: 'flex', '&:hover': { bgcolor: '#ffd6d6', color: '#ba1a1a' },
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}

          {/* Add placeholder */}
          <Box
            onClick={openAdd}
            sx={{
              border: `2px dashed ${T.surfaceHigh}`, borderRadius: '0.75rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', textAlign: 'center', p: 5, cursor: 'pointer',
              transition: 'all 0.2s', minHeight: 280,
              '&:hover': { borderColor: 'rgba(83,65,205,0.4)', bgcolor: 'rgba(83,65,205,0.04)' },
            }}
          >
            <Box sx={{ width: 72, height: 72, bgcolor: T.surfaceAlt, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: T.textMuted }}>add_circle</span>
            </Box>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: T.text }}>Add New Selection</Typography>
            <Typography sx={{ color: T.textSub, fontSize: '0.875rem', mt: 0.5 }}>Expand your menu with a new dish.</Typography>
          </Box>
        </Box>
      )}

      {/* ── Category Modal ── */}
      {showCatModal && (
        <Box
          sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.55)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
          onClick={() => setShowCatModal(false)}
        >
          <Box
            sx={{ bgcolor: T.surface, borderRadius: '1.25rem', p: 4, maxWidth: 400, width: '100%', boxShadow: '0 32px 64px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 900, color: T.text }}>
                {editCat ? 'Edit Category' : 'Add Category'}
              </Typography>
              <Box component="button" onClick={() => setShowCatModal(false)} sx={{ p: 1, bgcolor: 'transparent', border: 'none', cursor: 'pointer', color: T.textSub, display: 'flex' }}>
                <span className="material-symbols-outlined">close</span>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Category Name *</Typography>
                <Box
                  component="input"
                  type="text"
                  autoFocus
                  placeholder="e.g. Starters, Mains, Desserts…"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveCat(); }}
                  sx={{
                    width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`,
                    borderRadius: '0.5rem', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text,
                    outline: 'none', boxSizing: 'border-box', '&:focus': { borderColor: '#5341cd' },
                  }}
                />
              </Box>
              {catErr && <Typography sx={{ fontSize: '0.8rem', color: '#ba1a1a', fontWeight: 600 }}>{catErr}</Typography>}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Box component="button" onClick={() => setShowCatModal(false)} sx={{
                flex: 1, py: 1.5, bgcolor: T.surfaceAlt, color: T.textSub, border: 'none',
                cursor: 'pointer', borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700,
              }}>Cancel</Box>
              <Box component="button" onClick={handleSaveCat} disabled={catSaving} sx={{
                flex: 2, py: 1.5, bgcolor: catSaving ? T.surfaceHigh : '#5341cd', color: catSaving ? T.textMuted : '#fff',
                border: 'none', cursor: catSaving ? 'not-allowed' : 'pointer',
                borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700,
                transition: 'background-color 0.2s',
              }}>
                {catSaving ? 'Saving…' : (editCat ? 'Update' : 'Add Category')}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <Box
          sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.55)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
          onClick={() => setShowForm(false)}
        >
          <Box
            sx={{ bgcolor: T.surface, borderRadius: '1.25rem', p: { xs: 3, sm: 4 }, maxWidth: 520, width: '100%', boxShadow: '0 32px 64px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: T.text }}>
                {editItem ? 'Edit Item' : 'Add Menu Item'}
              </Typography>
              <Box component="button" onClick={() => setShowForm(false)} sx={{ p: 1, bgcolor: 'transparent', border: 'none', cursor: 'pointer', color: T.textSub, display: 'flex' }}>
                <span className="material-symbols-outlined">close</span>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Field label="Item Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Butter Chicken" />
              <Field label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description…" />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Field label="Price (₹) *" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 350" />
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Category *</Typography>
                  <Box
                    component="select"
                    value={form.categoryId}
                    onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                    sx={{
                      width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`,
                      borderRadius: '0.5rem', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text,
                      outline: 'none', cursor: 'pointer', '&:focus': { borderColor: '#5341cd' },
                    }}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Image upload */}
              <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Image</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {form.image && (
                    <Box component="img" src={form.image} alt="" sx={{ width: 64, height: 64, borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <Box component="label" sx={{
                    flex: 1, px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px dashed ${T.surfaceHigh}`,
                    borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                    '&:hover': { borderColor: '#5341cd' },
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.textMuted }}>
                      {uploading ? 'hourglass_empty' : 'upload'}
                    </span>
                    <Typography sx={{ fontSize: '0.875rem', color: T.textSub, fontWeight: 600 }}>
                      {uploading ? 'Uploading…' : 'Upload Image'}
                    </Typography>
                    <Box component="input" type="file" accept="image/*" onChange={handleImageUpload} sx={{ display: 'none' }} />
                  </Box>
                </Box>
              </Box>

              {/* Toggles */}
              <Box sx={{ display: 'flex', gap: 3 }}>
                {[
                  { label: 'Veg',       field: 'isVeg',       on: '#6cf8bb', onText: '#00714d' },
                  { label: 'Available', field: 'isAvailable', on: '#6cf8bb', onText: '#00714d' },
                ].map(t => (
                  <Box key={t.field} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => setForm(p => ({ ...p, [t.field]: !p[t.field] }))}>
                    <Box sx={{
                      width: 44, height: 22, borderRadius: '9999px', p: '3px', position: 'relative',
                      bgcolor: form[t.field] ? t.on : T.surfaceHigh, transition: 'background-color 0.2s',
                    }}>
                      <Box sx={{ width: 16, height: 16, bgcolor: '#fff', borderRadius: '50%', position: 'absolute', transition: 'left 0.2s', left: form[t.field] ? 'calc(100% - 19px)' : '3px' }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.textSub }}>{t.label}</Typography>
                  </Box>
                ))}
              </Box>

              {formErr && <Typography sx={{ fontSize: '0.8rem', color: '#ba1a1a', fontWeight: 600 }}>{formErr}</Typography>}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Box component="button" onClick={() => setShowForm(false)} sx={{
                flex: 1, py: 1.5, bgcolor: T.surfaceAlt, color: T.textSub, border: 'none',
                cursor: 'pointer', borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700,
              }}>Cancel</Box>
              <Box component="button" onClick={handleSave} disabled={saving} sx={{
                flex: 2, py: 1.5, bgcolor: saving ? T.surfaceHigh : '#5341cd', color: saving ? T.textMuted : '#fff',
                border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700,
                transition: 'background-color 0.2s',
              }}>
                {saving ? 'Saving…' : (editItem ? 'Update Item' : 'Add Item')}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </M>
  );
}
