import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useTokens } from '../ThemeContext';
import api from '../api';

const M = motion.create(Box);

const EMPTY_FORM = {
  name: '', description: '', price: '', categoryId: '', isVeg: true, isAvailable: true, image: '',
};

/* ─── CSV helpers ─── */
function parseCSVLine(line) {
  const cols = []; let cur = ''; let inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  cols.push(cur.trim());
  return cols;
}

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''));
  return lines.slice(1).map((line, i) => {
    const vals = parseCSVLine(line);
    const row = { _row: i + 2 };
    header.forEach((h, j) => { row[h] = (vals[j] || '').replace(/"/g, '').trim(); });
    return row;
  });
}

/* ─── JSON helper ─── */
function parseJSON(text) {
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) return null;
    return data.map((item, i) => ({
      _row: i + 2,
      name: String(item.name ?? '').trim(),
      description: String(item.description ?? '').trim(),
      price: String(item.price ?? ''),
      category: String(item.category ?? '').trim(),
      isveg: String(item.isVeg ?? item.isveg ?? 'true'),
      isavailable: String(item.isAvailable ?? item.isavailable ?? 'true'),
    }));
  } catch {
    return null;
  }
}

/* ─── Validation ─── */
function validateBulkRow(row) {
  if (!row.name) return 'Name required';
  const p = Number(row.price);
  if (!row.price || isNaN(p) || p <= 0) return 'Invalid price';
  if (!row.category) return 'Category required';
  return null;
}

/* ─── Template downloads ─── */
function downloadCSVTemplate() {
  const csv = [
    'name,description,price,category,isVeg,isAvailable',
    'Butter Chicken,"Creamy tomato curry with butter and cream",280,Main Course,false,true',
    'Paneer Tikka,Grilled cottage cheese with bell peppers,220,Starters,true,true',
    'Dal Makhani,"Rich black lentils slow cooked overnight",180,Main Course,true,true',
    'Chicken Biryani,Fragrant basmati rice with spiced chicken,320,Rice & Biryani,false,true',
    'Gulab Jamun,Soft milk dumplings in sugar syrup,80,Desserts,true,true',
  ].join('\n');
  triggerDownload(new Blob([csv], { type: 'text/csv' }), 'menu_bulk_template.csv');
}

function downloadJSONTemplate() {
  const json = JSON.stringify([
    { name: 'Butter Chicken', description: 'Creamy tomato curry with butter and cream', price: 280, category: 'Main Course', isVeg: false, isAvailable: true },
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese with bell peppers', price: 220, category: 'Starters', isVeg: true, isAvailable: true },
    { name: 'Dal Makhani', description: 'Rich black lentils slow cooked overnight', price: 180, category: 'Main Course', isVeg: true, isAvailable: true },
    { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 320, category: 'Rice & Biryani', isVeg: false, isAvailable: true },
    { name: 'Gulab Jamun', description: 'Soft milk dumplings in sugar syrup', price: 80, category: 'Desserts', isVeg: true, isAvailable: true },
  ], null, 2);
  triggerDownload(new Blob([json], { type: 'application/json' }), 'menu_bulk_template.json');
}

function triggerDownload(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

/* ─── Field component ─── */
function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  const T = useTokens();
  return (
    <Box>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</Typography>
      <Box component="input" type={type} placeholder={placeholder} value={value} onChange={onChange}
        sx={{ width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text, outline: 'none', boxSizing: 'border-box', '&:focus': { borderColor: '#f97316' } }} />
    </Box>
  );
}

export default function MenuManagementView() {
  const T = useTokens();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [uploading, setUploading] = useState(false);

  // Category management
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catName, setCatName] = useState('');
  const [catSaving, setCatSaving] = useState(false);
  const [catErr, setCatErr] = useState('');

  // Bulk upload
  const [showBulk, setShowBulk] = useState(false);
  const [bulkStep, setBulkStep] = useState('upload'); // 'upload' | 'preview' | 'result'
  const [bulkMode, setBulkMode] = useState('csv');    // 'csv' | 'json'
  const [jsonText, setJsonText] = useState('');
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkErr, setBulkErr] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, itemRes] = await Promise.all([api.get('/api/categories'), api.get('/api/menu-items')]);
      setCategories(catRes.data);
      setItems(itemRes.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = items.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === 'all' || item.categoryId === activeCat || item.categoryId?._id === activeCat;
    return matchSearch && matchCat;
  });

  function getCatName(id) {
    const c = categories.find(c => c._id === id || c._id === id?._id);
    return c?.name || '';
  }

  async function toggleAvailability(item) {
    try {
      const { data } = await api.put(`/api/menu-items/${item._id}`, { isAvailable: !item.isAvailable });
      setItems(prev => prev.map(i => i._id === data._id ? data : i));
    } catch { /* silent */ }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this menu item permanently?')) return;
    try {
      await api.delete(`/api/menu-items/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch { /* silent */ }
  }

  function openAdd() {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?._id || '' });
    setFormErr('');
    setShowForm(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', price: String(item.price), categoryId: item.categoryId?._id || item.categoryId || '', isVeg: item.isVeg !== false, isAvailable: item.isAvailable !== false, image: item.image || '' });
    setFormErr('');
    setShowForm(true);
  }

  /* ── Category CRUD ── */
  function openAddCat() { setEditCat(null); setCatName(''); setCatErr(''); setShowCatModal(true); }
  function openEditCat(cat) { setEditCat(cat); setCatName(cat.name); setCatErr(''); setShowCatModal(true); }

  async function handleSaveCat() {
    if (!catName.trim()) { setCatErr('Category name is required.'); return; }
    setCatSaving(true); setCatErr('');
    try {
      if (editCat) {
        await api.put(`/api/categories/${editCat._id}`, { name: catName.trim() });
      } else {
        const names = catName.split(',').map(n => n.trim()).filter(Boolean);
        await Promise.all(names.map(name => api.post('/api/categories', { name })));
      }
      await fetchAll();
      setShowCatModal(false);
    } catch (e) {
      setCatErr(e?.response?.data?.message || 'Save failed.');
    } finally { setCatSaving(false); }
  }

  async function handleDeleteCat(cat) {
    if (!window.confirm(`Delete category "${cat.name}"? Items in this category will lose their category.`)) return;
    try {
      await api.delete(`/api/categories/${cat._id}`);
      if (activeCat === cat._id) setActiveCat('all');
      await fetchAll();
    } catch { /* silent */ }
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
    } finally { setUploading(false); }
  }

  /* ── Save single ── */
  async function handleSave() {
    if (!form.name.trim() || !form.price || !form.categoryId) { setFormErr('Name, price, and category are required.'); return; }
    setSaving(true); setFormErr('');
    try {
      const payload = { ...form, price: Number(form.price) };
      editItem ? await api.put(`/api/menu-items/${editItem._id}`, payload) : await api.post('/api/menu-items', payload);
      await fetchAll();
      setShowForm(false);
    } catch (e) {
      setFormErr(e?.response?.data?.message || 'Save failed. Try again.');
    } finally { setSaving(false); }
  }

  /* ── Bulk upload ── */
  function openBulk() {
    setBulkStep('upload'); setBulkMode('csv'); setJsonText('');
    setBulkRows([]); setBulkResult(null); setBulkErr('');
    setShowBulk(true);
  }

  function loadRows(rows) {
    if (!rows || rows.length === 0) { setBulkErr('No data found.'); return; }
    setBulkErr(''); setBulkRows(rows); setBulkStep('preview');
  }

  function handleBulkFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.csv') && !name.endsWith('.json')) { setBulkErr('Upload a .csv or .json file.'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target.result;
      loadRows(name.endsWith('.json') ? parseJSON(text) : parseCSV(text));
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleJsonPaste() {
    if (!jsonText.trim()) { setBulkErr('Paste your JSON first.'); return; }
    const rows = parseJSON(jsonText);
    if (!rows) { setBulkErr('Invalid JSON — expected an array of objects.'); return; }
    loadRows(rows);
  }

  async function handleBulkImport() {
    const validRows = bulkRows.filter(r => !validateBulkRow(r));
    if (!validRows.length) return;
    setBulkImporting(true);
    try {
      const payload = validRows.map(r => ({
        name: r.name,
        description: r.description || '',
        price: Number(r.price),
        categoryName: r.category,
        isVeg: String(r.isveg ?? 'true').toLowerCase() !== 'false',
        isAvailable: String(r.isavailable ?? 'true').toLowerCase() !== 'false',
      }));
      const { data } = await api.post('/api/menu-items/bulk', { items: payload });
      setBulkResult(data);
      setBulkStep('result');
      fetchAll();
    } catch (e) {
      setBulkErr(e?.response?.data?.message || 'Import failed. Please try again.');
    } finally { setBulkImporting(false); }
  }

  /* ── Derived ── */
  const validCount = bulkRows.filter(r => !validateBulkRow(r)).length;
  const invalidCount = bulkRows.length - validCount;

  /* ─────────── SHARED MODAL SHELL ─────────── */
  function ModalShell({ children, title, subtitle, wide, onClose }) {
    return (
      <Box
        sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', zIndex: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
        onClick={onClose}
      >
        <Box
          sx={{ bgcolor: T.surface, borderRadius: '1.25rem', width: '100%', maxWidth: wide ? 920 : 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.28)', overflow: 'hidden' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Fixed header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', px: 4, pt: 4, pb: 2.5, flexShrink: 0, borderBottom: `1px solid ${T.surfaceHigh}` }}>
            <Box>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: T.text }}>{title}</Typography>
              {subtitle && <Typography sx={{ fontSize: '0.82rem', color: T.textSub, mt: 0.5 }}>{subtitle}</Typography>}
            </Box>
            <Box component="button" onClick={onClose} sx={{ p: 1, ml: 2, bgcolor: 'transparent', border: 'none', cursor: 'pointer', color: T.textSub, display: 'flex', flexShrink: 0 }}>
              <span className="material-symbols-outlined">close</span>
            </Box>
          </Box>
          {children}
        </Box>
      </Box>
    );
  }

  /* ─────────── RENDER ─────────── */
  return (
    <M initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} sx={{ display: 'flex', flexDirection: 'column', color: T.text }}>

      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-end' }, justifyContent: 'space-between', gap: 3, mb: 5 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#f97316', mb: 1 }}>Administration</Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 900, color: T.text, letterSpacing: '-0.05em', lineHeight: 1 }}>Menu Management</Typography>
          <Typography sx={{ color: T.textSub, mt: 1.5, fontSize: '1rem' }}>Curate your digital culinary experience — manage items, update pricing, and control availability.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignSelf: { xs: 'flex-start', md: 'auto' }, flexWrap: 'wrap' }}>
          <Box component="button" onClick={openBulk}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, background: T.surfaceAlt, color: T.text, border: `1.5px solid ${T.surfaceHigh}`, px: 3, py: 1.5, borderRadius: '9999px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', '&:hover': { borderColor: '#f97316', color: '#f97316', bgcolor: 'rgba(249,115,22,0.05)' }, transition: 'all 0.2s' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload_file</span>
            Bulk Upload
          </Box>
          <Box component="button" onClick={openAdd}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', px: 3, py: 1.5, borderRadius: '9999px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(249,115,22,0.2)', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', '&:hover': { opacity: 0.9 }, transition: 'opacity 0.2s' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
            Add New Item
          </Box>
        </Box>
      </Box>

      {/* Search + Category filter */}
      <Box sx={{ bgcolor: T.surfaceAlt, borderRadius: '0.75rem', p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 5 }}>
        <Box sx={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 18 }}>search</span>
          <Box component="input" placeholder="Search dish name…" value={search} onChange={e => setSearch(e.target.value)}
            sx={{ width: '100%', bgcolor: T.surface, border: 'none', height: 44, pl: '44px', pr: 3, borderRadius: '9999px', outline: 'none', color: T.text, fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', boxSizing: 'border-box', '&:focus': { boxShadow: '0 0 0 2px rgba(249,115,22,0.2)' } }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box component="button" onClick={() => setActiveCat('all')}
            sx={{ px: 3, py: 0.75, borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.15s', bgcolor: activeCat === 'all' ? '#f97316' : T.surface, color: activeCat === 'all' ? '#fff' : T.textSub, boxShadow: activeCat === 'all' ? '0 4px 6px rgba(249,115,22,0.2)' : 'none' }}>
            All Items
          </Box>
          {categories.map(cat => (
            <Box key={cat._id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: activeCat === cat._id ? '#f97316' : T.surface, borderRadius: '9999px', transition: 'all 0.15s', boxShadow: activeCat === cat._id ? '0 4px 6px rgba(249,115,22,0.2)' : 'none', '&:hover .cat-actions': { opacity: 1 } }}>
              <Box component="button" onClick={() => setActiveCat(cat._id)} sx={{ px: 2.5, py: 0.75, borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700, bgcolor: 'transparent', color: activeCat === cat._id ? '#fff' : T.textSub }}>{cat.name}</Box>
              <Box className="cat-actions" sx={{ display: 'flex', opacity: 0, transition: 'opacity 0.15s', pr: 0.5, gap: 0.25 }}>
                <Box component="button" onClick={e => { e.stopPropagation(); openEditCat(cat); }} title="Edit" sx={{ p: '3px', bgcolor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '50%', color: activeCat === cat._id ? 'rgba(255,255,255,0.7)' : T.textMuted, display: 'flex', '&:hover': { color: activeCat === cat._id ? '#fff' : '#f97316' } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                </Box>
                <Box component="button" onClick={e => { e.stopPropagation(); handleDeleteCat(cat); }} title="Delete" sx={{ p: '3px', bgcolor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '50%', color: activeCat === cat._id ? 'rgba(255,255,255,0.7)' : T.textMuted, display: 'flex', '&:hover': { color: '#ba1a1a' } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
                </Box>
              </Box>
            </Box>
          ))}
          <Box component="button" onClick={openAddCat}
            sx={{ px: 2.5, py: 0.75, borderRadius: '9999px', border: `1.5px dashed ${T.surfaceHigh}`, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700, bgcolor: 'transparent', color: T.textMuted, display: 'flex', alignItems: 'center', gap: 0.5, transition: 'all 0.15s', '&:hover': { borderColor: '#f97316', color: '#f97316', bgcolor: 'rgba(249,115,22,0.05)' } }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>Category
          </Box>
        </Box>
      </Box>

      {/* Items grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress sx={{ color: '#f97316' }} /></Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', xl: 'repeat(3,1fr)' }, gap: 4 }}>
          {filtered.map(item => (
            <Box key={item._id} sx={{ bgcolor: T.surface, borderRadius: '0.75rem', overflow: 'hidden', transition: 'all 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: T.shadowHov }, boxShadow: T.shadow }}>
              <Box sx={{ height: 220, position: 'relative', overflow: 'hidden', bgcolor: T.surfaceAlt }}>
                {item.image
                  ? <Box component="img" src={item.image} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 48, color: T.textMuted }}>restaurant</span></Box>
                }
                <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
                  <Box component="span" sx={{ bgcolor: item.isVeg !== false ? '#6cf8bb' : 'rgba(186,26,26,0.9)', color: item.isVeg !== false ? '#00714d' : '#fff', px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {item.isVeg !== false ? 'Veg' : 'Non-Veg'}
                  </Box>
                  {getCatName(item.categoryId) && (
                    <Box component="span" sx={{ bgcolor: 'rgba(249,115,22,0.88)', color: '#fff', px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {getCatName(item.categoryId)}
                    </Box>
                  )}
                </Box>
              </Box>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: T.text, lineHeight: 1.25, pr: 1 }}>{item.name}</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#f97316', flexShrink: 0 }}>₹{item.price}</Typography>
                </Box>
                {item.description && (
                  <Typography sx={{ color: T.textSub, fontSize: '0.875rem', mb: 2, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2, borderTop: `1px solid ${T.surfaceHigh}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => toggleAvailability(item)}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textSub }}>{item.isAvailable ? 'Available' : 'Unavailable'}</Typography>
                    <Box sx={{ width: 44, height: 22, borderRadius: '9999px', p: '3px', position: 'relative', bgcolor: item.isAvailable ? '#6cf8bb' : T.surfaceHigh, transition: 'background-color 0.2s' }}>
                      <Box sx={{ width: 16, height: 16, bgcolor: '#fff', borderRadius: '50%', position: 'absolute', transition: 'left 0.2s', left: item.isAvailable ? 'calc(100% - 19px)' : '3px' }} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Box component="button" onClick={() => openEdit(item)} sx={{ p: 1, bgcolor: T.surfaceAlt, border: 'none', cursor: 'pointer', borderRadius: '0.5rem', color: T.textSub, display: 'flex', '&:hover': { bgcolor: T.surfaceHigh, color: '#f97316' } }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                    </Box>
                    <Box component="button" onClick={() => handleDelete(item._id)} sx={{ p: 1, bgcolor: T.surfaceAlt, border: 'none', cursor: 'pointer', borderRadius: '0.5rem', color: T.textSub, display: 'flex', '&:hover': { bgcolor: '#ffd6d6', color: '#ba1a1a' } }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
          <Box onClick={openAdd} sx={{ border: `2px dashed ${T.surfaceHigh}`, borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 5, cursor: 'pointer', transition: 'all 0.2s', minHeight: 280, '&:hover': { borderColor: 'rgba(249,115,22,0.4)', bgcolor: 'rgba(249,115,22,0.04)' } }}>
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
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.55)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }} onClick={() => setShowCatModal(false)}>
          <Box sx={{ bgcolor: T.surface, borderRadius: '1.25rem', p: 4, maxWidth: 400, width: '100%', boxShadow: '0 32px 64px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 900, color: T.text }}>{editCat ? 'Edit Category' : 'Add Category'}</Typography>
              <Box component="button" onClick={() => setShowCatModal(false)} sx={{ p: 1, bgcolor: 'transparent', border: 'none', cursor: 'pointer', color: T.textSub, display: 'flex' }}><span className="material-symbols-outlined">close</span></Box>
            </Box>
            {(() => {
              const bulkNames = !editCat ? catName.split(',').map(n => n.trim()).filter(Boolean) : [];
              const isMulti = bulkNames.length > 1;
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {editCat ? 'Category Name' : 'Category Name(s)'} *
                    </Typography>
                    <Box component="input" type="text" autoFocus
                      placeholder={editCat ? 'e.g. Main Course' : 'e.g. Starters, Mains, Desserts, Rice & Biryani'}
                      value={catName} onChange={e => setCatName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveCat(); }}
                      sx={{ width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text, outline: 'none', boxSizing: 'border-box', '&:focus': { borderColor: '#f97316' } }} />
                    {!editCat && (
                      <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, mt: 0.75 }}>
                        Separate multiple categories with commas
                      </Typography>
                    )}
                  </Box>

                  {/* Chip preview when multiple names detected */}
                  {isMulti && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {bulkNames.map((n, i) => (
                        <Box key={i} component="span" sx={{ px: 1.75, py: 0.5, bgcolor: 'rgba(249,115,22,0.1)', color: '#f97316', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {n}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {catErr && <Typography sx={{ fontSize: '0.8rem', color: '#ba1a1a', fontWeight: 600 }}>{catErr}</Typography>}
                </Box>
              );
            })()}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Box component="button" onClick={() => setShowCatModal(false)} sx={{ flex: 1, py: 1.5, bgcolor: T.surfaceAlt, color: T.textSub, border: 'none', cursor: 'pointer', borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700 }}>Cancel</Box>
              <Box component="button" onClick={handleSaveCat} disabled={catSaving} sx={{ flex: 2, py: 1.5, bgcolor: catSaving ? T.surfaceHigh : '#f97316', color: catSaving ? T.textMuted : '#fff', border: 'none', cursor: catSaving ? 'not-allowed' : 'pointer', borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700, transition: 'background-color 0.2s' }}>
                {(() => {
                  if (catSaving) return 'Saving…';
                  if (editCat) return 'Update';
                  const n = catName.split(',').map(s => s.trim()).filter(Boolean).length;
                  return n > 1 ? `Add ${n} Categories` : 'Add Category';
                })()}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.55)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }} onClick={() => setShowForm(false)}>
          <Box sx={{ bgcolor: T.surface, borderRadius: '1.25rem', p: { xs: 3, sm: 4 }, maxWidth: 520, width: '100%', boxShadow: '0 32px 64px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: T.text }}>{editItem ? 'Edit Item' : 'Add Menu Item'}</Typography>
              <Box component="button" onClick={() => setShowForm(false)} sx={{ p: 1, bgcolor: 'transparent', border: 'none', cursor: 'pointer', color: T.textSub, display: 'flex' }}><span className="material-symbols-outlined">close</span></Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Field label="Item Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Butter Chicken" />
              <Field label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description…" />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Field label="Price (₹) *" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 350" />
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Category *</Typography>
                  <Box component="select" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} sx={{ width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text, outline: 'none', cursor: 'pointer', '&:focus': { borderColor: '#f97316' } }}>
                    <option value="">Select category</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </Box>
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Image</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {form.image && <Box component="img" src={form.image} alt="" sx={{ width: 64, height: 64, borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }} />}
                  <Box component="label" sx={{ flex: 1, px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px dashed ${T.surfaceHigh}`, borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, '&:hover': { borderColor: '#f97316' } }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.textMuted }}>{uploading ? 'hourglass_empty' : 'upload'}</span>
                    <Typography sx={{ fontSize: '0.875rem', color: T.textSub, fontWeight: 600 }}>{uploading ? 'Uploading…' : 'Upload Image'}</Typography>
                    <Box component="input" type="file" accept="image/*" onChange={handleImageUpload} sx={{ display: 'none' }} />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {[{ label: 'Veg', field: 'isVeg' }, { label: 'Available', field: 'isAvailable' }].map(t => (
                  <Box key={t.field} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => setForm(p => ({ ...p, [t.field]: !p[t.field] }))}>
                    <Box sx={{ width: 44, height: 22, borderRadius: '9999px', p: '3px', position: 'relative', bgcolor: form[t.field] ? '#6cf8bb' : T.surfaceHigh, transition: 'background-color 0.2s' }}>
                      <Box sx={{ width: 16, height: 16, bgcolor: '#fff', borderRadius: '50%', position: 'absolute', transition: 'left 0.2s', left: form[t.field] ? 'calc(100% - 19px)' : '3px' }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.textSub }}>{t.label}</Typography>
                  </Box>
                ))}
              </Box>
              {formErr && <Typography sx={{ fontSize: '0.8rem', color: '#ba1a1a', fontWeight: 600 }}>{formErr}</Typography>}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Box component="button" onClick={() => setShowForm(false)} sx={{ flex: 1, py: 1.5, bgcolor: T.surfaceAlt, color: T.textSub, border: 'none', cursor: 'pointer', borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700 }}>Cancel</Box>
              <Box component="button" onClick={handleSave} disabled={saving} sx={{ flex: 2, py: 1.5, bgcolor: saving ? T.surfaceHigh : '#f97316', color: saving ? T.textMuted : '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700, transition: 'background-color 0.2s' }}>
                {saving ? 'Saving…' : (editItem ? 'Update Item' : 'Add Item')}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ══════════════════════════════════════
          BULK UPLOAD MODAL
      ══════════════════════════════════════ */}
      {showBulk && (
        <ModalShell
          title={bulkStep === 'upload' ? 'Bulk Upload Menu Items' : bulkStep === 'preview' ? `Preview — ${validCount} valid${invalidCount ? `, ${invalidCount} with errors` : ''}` : 'Import Complete'}
          subtitle={bulkStep === 'upload' ? 'Add hundreds of items at once via CSV or JSON.' : undefined}
          wide={bulkStep === 'preview'}
          onClose={() => !bulkImporting && setShowBulk(false)}
        >

          {/* ── Step: Upload ── */}
          {bulkStep === 'upload' && (
            <>
              {/* Scrollable body */}
              <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

                {/* CSV / JSON tab switcher */}
                <Box sx={{ display: 'flex', bgcolor: T.surfaceAlt, borderRadius: '0.75rem', p: 0.5 }}>
                  {[
                    { id: 'csv', icon: 'table_view', label: 'CSV Spreadsheet' },
                    { id: 'json', icon: 'data_object', label: 'JSON' },
                  ].map(tab => (
                    <Box key={tab.id} component="button" onClick={() => { setBulkMode(tab.id); setBulkErr(''); }}
                      sx={{
                        flex: 1, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, border: 'none', cursor: 'pointer', borderRadius: '0.6rem', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.15s',
                        bgcolor: bulkMode === tab.id ? T.surface : 'transparent',
                        color: bulkMode === tab.id ? '#f97316' : T.textSub,
                        boxShadow: bulkMode === tab.id ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                      }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{tab.icon}</span>
                      {tab.label}
                    </Box>
                  ))}
                </Box>

                {/* ── CSV tab ── */}
                {bulkMode === 'csv' && (
                  <>
                    {/* Download template row */}
                    <Box sx={{ bgcolor: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '0.75rem', p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, bgcolor: 'rgba(249,115,22,0.12)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: 20 }}>table_view</span>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: T.text }}>Step 1 — Download template</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: T.textSub, mt: 0.25 }}>Fill in: <strong>name</strong>, description, <strong>price</strong>, <strong>category</strong>, isVeg, isAvailable</Typography>
                      </Box>
                      <Box component="button" onClick={downloadCSVTemplate} sx={{ px: 2.5, py: 0.875, bgcolor: '#f97316', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', flexShrink: 0, '&:hover': { opacity: 0.88 } }}>
                        Download CSV
                      </Box>
                    </Box>

                    {/* Upload dropzone */}
                    <Box component="label" sx={{ border: `2px dashed ${bulkErr ? '#ba1a1a' : T.surfaceHigh}`, borderRadius: '0.75rem', p: 4, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, transition: 'all 0.2s', '&:hover': { borderColor: '#f97316', bgcolor: 'rgba(249,115,22,0.03)' } }}>
                      <Box sx={{ width: 52, height: 52, bgcolor: T.surfaceAlt, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 26, color: T.textMuted }}>upload_file</span>
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9rem' }}>Step 2 — Upload your CSV</Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: T.textSub, mt: 0.25 }}>Click to browse or drag & drop</Typography>
                      </Box>
                      <Box component="input" type="file" accept=".csv" onChange={handleBulkFile} sx={{ display: 'none' }} />
                    </Box>
                  </>
                )}

                {/* ── JSON tab ── */}
                {bulkMode === 'json' && (
                  <>
                    {/* Download JSON template */}
                    <Box sx={{ bgcolor: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '0.75rem', p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, bgcolor: 'rgba(249,115,22,0.12)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: 20 }}>data_object</span>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: T.text }}>Download JSON template</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: T.textSub, mt: 0.25 }}>Array of objects: name, description, price, category, isVeg, isAvailable</Typography>
                      </Box>
                      <Box component="button" onClick={downloadJSONTemplate} sx={{ px: 2.5, py: 0.875, bgcolor: '#f97316', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', flexShrink: 0, '&:hover': { opacity: 0.88 } }}>
                        Download JSON
                      </Box>
                    </Box>

                    {/* Paste textarea */}
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 1, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Paste JSON array</Typography>
                      <Box
                        component="textarea"
                        value={jsonText}
                        onChange={e => setJsonText(e.target.value)}
                        placeholder={'[\n  {\n    "name": "Butter Chicken",\n    "description": "Creamy tomato curry",\n    "price": 280,\n    "category": "Main Course",\n    "isVeg": false,\n    "isAvailable": true\n  }\n]'}
                        rows={9}
                        sx={{ width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem', fontSize: '0.82rem', fontFamily: 'monospace', color: T.text, outline: 'none', resize: 'vertical', boxSizing: 'border-box', '&:focus': { borderColor: '#f97316' } }}
                      />
                    </Box>

                    {/* OR upload file */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1, height: '1px', bgcolor: T.surfaceHigh }} />
                      <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, fontWeight: 600 }}>or upload a .json file</Typography>
                      <Box sx={{ flex: 1, height: '1px', bgcolor: T.surfaceHigh }} />
                    </Box>

                    <Box component="label" sx={{ border: `1.5px dashed ${T.surfaceHigh}`, borderRadius: '0.75rem', p: 2.5, textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, transition: 'all 0.2s', '&:hover': { borderColor: '#f97316', bgcolor: 'rgba(249,115,22,0.03)' } }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: T.textMuted }}>file_open</span>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.textSub }}>Browse .json file</Typography>
                      <Box component="input" type="file" accept=".json" onChange={handleBulkFile} sx={{ display: 'none' }} />
                    </Box>
                  </>
                )}

                {/* Error */}
                {bulkErr && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#ba1a1a' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{bulkErr}</Typography>
                  </Box>
                )}

                {/* Tips */}
                <Box sx={{ bgcolor: T.surfaceAlt, borderRadius: '0.75rem', p: 2.5 }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: T.textSub, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tips</Typography>
                  {[
                    'Categories are created automatically if they don\'t exist yet.',
                    'isVeg / isAvailable accept true or false — default is true.',
                    'Images can be added individually after import.',
                    'Up to 500 items per upload.',
                  ].map(tip => (
                    <Typography key={tip} sx={{ fontSize: '0.8rem', color: T.textSub, display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 0.5 }}>
                      <span style={{ color: '#f97316', flexShrink: 0 }}>•</span>{tip}
                    </Typography>
                  ))}
                </Box>
              </Box>

              {/* Fixed footer */}
              <Box sx={{ flexShrink: 0, px: 4, pb: 4, pt: 2, borderTop: `1px solid ${T.surfaceHigh}`, display: 'flex', gap: 2 }}>
                <Box component="button" onClick={() => setShowBulk(false)} sx={{ flex: 1, py: 1.5, bgcolor: T.surfaceAlt, color: T.textSub, border: 'none', cursor: 'pointer', borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700 }}>Cancel</Box>
                {bulkMode === 'json' && (
                  <Box component="button" onClick={handleJsonPaste} disabled={!jsonText.trim()}
                    sx={{ flex: 2, py: 1.5, bgcolor: !jsonText.trim() ? T.surfaceHigh : '#f97316', color: !jsonText.trim() ? T.textMuted : '#fff', border: 'none', cursor: !jsonText.trim() ? 'not-allowed' : 'pointer', borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700, transition: 'background-color 0.2s' }}>
                    Preview →
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* ── Step: Preview ── */}
          {bulkStep === 'preview' && (
            <>
              {/* Stats bar (fixed under header) */}
              <Box sx={{ flexShrink: 0, display: 'flex', gap: 2, px: 4, pt: 2.5, pb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: '9999px', px: 2, py: 0.625 }}>
                  <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: 14 }}>check_circle</span>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>{validCount} valid</Typography>
                </Box>
                {invalidCount > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(186,26,26,0.08)', border: '1px solid rgba(186,26,26,0.2)', borderRadius: '9999px', px: 2, py: 0.625 }}>
                    <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: 14 }}>error</span>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#ba1a1a' }}>{invalidCount} with errors — will be skipped</Typography>
                  </Box>
                )}
              </Box>

              {/* Scrollable table */}
              <Box sx={{ flex: 1, overflowY: 'auto', mx: 4, mb: 0, border: `1px solid ${T.surfaceHigh}`, borderRadius: '0.75rem', overflow: 'hidden' }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <Box component="thead" sx={{ bgcolor: T.surfaceAlt, position: 'sticky', top: 0, zIndex: 1 }}>
                    <Box component="tr">
                      {['#', 'Name', 'Price (₹)', 'Category', 'Veg', 'Avail', 'Status'].map(h => (
                        <Box key={h} component="th" sx={{ px: 2, py: 1.5, textAlign: 'left', fontWeight: 700, color: T.textSub, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', borderBottom: `1px solid ${T.surfaceHigh}` }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {bulkRows.map(row => {
                      const err = validateBulkRow(row);
                      return (
                        <Box component="tr" key={row._row} sx={{ bgcolor: err ? 'rgba(186,26,26,0.03)' : 'transparent', borderBottom: `1px solid ${T.surfaceHigh}`, '&:last-child': { borderBottom: 'none' } }}>
                          <Box component="td" sx={{ px: 2, py: 1.25, color: T.textMuted, fontWeight: 600, whiteSpace: 'nowrap' }}>{row._row}</Box>
                          <Box component="td" sx={{ px: 2, py: 1.25, fontWeight: 600, color: row.name ? T.text : '#ba1a1a', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name || '—'}</Box>
                          <Box component="td" sx={{ px: 2, py: 1.25, color: (row.price && Number(row.price) > 0) ? T.text : '#ba1a1a', whiteSpace: 'nowrap' }}>{row.price ? `₹${row.price}` : '—'}</Box>
                          <Box component="td" sx={{ px: 2, py: 1.25, color: row.category ? T.text : '#ba1a1a', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.category || '—'}</Box>
                          <Box component="td" sx={{ px: 2, py: 1.25 }}>
                            <Box component="span" sx={{ px: 1.25, py: 0.25, borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, bgcolor: String(row.isveg ?? 'true').toLowerCase() !== 'false' ? '#dcfce7' : '#fee2e2', color: String(row.isveg ?? 'true').toLowerCase() !== 'false' ? '#16a34a' : '#b91c1c' }}>
                              {String(row.isveg ?? 'true').toLowerCase() !== 'false' ? 'Veg' : 'Non-Veg'}
                            </Box>
                          </Box>
                          <Box component="td" sx={{ px: 2, py: 1.25 }}>
                            <Box component="span" sx={{ px: 1.25, py: 0.25, borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, bgcolor: String(row.isavailable ?? 'true').toLowerCase() !== 'false' ? '#dcfce7' : '#f3f4f6', color: String(row.isavailable ?? 'true').toLowerCase() !== 'false' ? '#16a34a' : '#6b7280' }}>
                              {String(row.isavailable ?? 'true').toLowerCase() !== 'false' ? 'Yes' : 'No'}
                            </Box>
                          </Box>
                          <Box component="td" sx={{ px: 2, py: 1.25, whiteSpace: 'nowrap' }}>
                            {!err
                              ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#16a34a' }}><span className="material-symbols-outlined" style={{ fontSize: 15 }}>check_circle</span><Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Valid</Typography></Box>
                              : <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ba1a1a' }}><span className="material-symbols-outlined" style={{ fontSize: 15 }}>error</span><Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{err}</Typography></Box>
                            }
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>

              {bulkErr && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#ba1a1a', px: 4, pt: 1.5 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{bulkErr}</Typography>
                </Box>
              )}

              {/* Fixed footer */}
              <Box sx={{ flexShrink: 0, display: 'flex', gap: 2, px: 4, pt: 2.5, pb: 4, borderTop: `1px solid ${T.surfaceHigh}` }}>
                <Box component="button" onClick={() => setBulkStep('upload')} disabled={bulkImporting} sx={{ flex: 1, py: 1.5, bgcolor: T.surfaceAlt, color: T.textSub, border: 'none', cursor: 'pointer', borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700 }}>← Back</Box>
                <Box component="button" onClick={handleBulkImport} disabled={bulkImporting || validCount === 0}
                  sx={{ flex: 2, py: 1.5, bgcolor: (bulkImporting || validCount === 0) ? T.surfaceHigh : '#f97316', color: (bulkImporting || validCount === 0) ? T.textMuted : '#fff', border: 'none', cursor: (bulkImporting || validCount === 0) ? 'not-allowed' : 'pointer', borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700, transition: 'background-color 0.2s' }}>
                  {bulkImporting ? 'Importing…' : `Import ${validCount} Item${validCount !== 1 ? 's' : ''}`}
                </Box>
              </Box>
            </>
          )}

          {/* ── Step: Result ── */}
          {bulkStep === 'result' && bulkResult && (
            <>
              <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ width: 68, height: 68, bgcolor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 34, color: '#16a34a' }}>check_circle</span>
                  </Box>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: T.text }}>{bulkResult.imported} item{bulkResult.imported !== 1 ? 's' : ''} imported</Typography>
                  {bulkResult.errors?.length > 0 && (
                    <Typography sx={{ fontSize: '0.875rem', color: T.textSub, mt: 0.5 }}>{bulkResult.errors.length} row{bulkResult.errors.length !== 1 ? 's' : ''} skipped due to errors</Typography>
                  )}
                </Box>
                {bulkResult.errors?.length > 0 && (
                  <Box sx={{ bgcolor: 'rgba(186,26,26,0.05)', border: '1px solid rgba(186,26,26,0.2)', borderRadius: '0.75rem', p: 2.5 }}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#ba1a1a', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skipped rows</Typography>
                    {bulkResult.errors.map((e, i) => (
                      <Typography key={i} sx={{ fontSize: '0.82rem', color: '#ba1a1a', mb: 0.75, display: 'flex', gap: 1 }}>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>Row {e.row}{e.name ? ` (${e.name})` : ''}:</span>{e.message}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
              <Box sx={{ flexShrink: 0, px: 4, pb: 4, pt: 2, borderTop: `1px solid ${T.surfaceHigh}` }}>
                <Box component="button" onClick={() => setShowBulk(false)} sx={{ width: '100%', py: 1.5, bgcolor: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700 }}>Done</Box>
              </Box>
            </>
          )}
        </ModalShell>
      )}
    </M>
  );
}
