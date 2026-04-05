import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Button, TextField, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem as SelectItem, InputLabel, FormControl, Chip, Stack,
  Avatar, Divider, Grid, Card, CardContent, Drawer, useMediaQuery, useTheme
} from '@mui/material';
import {
  Delete, Edit, QrCode2, Dashboard, RestaurantMenu, ReceiptLong,
  Leaderboard, Settings, HelpOutline, Logout, Add, Menu as MenuIcon,
  TableBar, Palette, Close, TrendingUp, ShoppingCart, AttachMoney,
  FoodBank, Circle
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const DRAWER_WIDTH = 256;

/* ─── Colour Tokens (admin dark theme) ─── */
const T = {
  bg:         '#0f1117',
  surface:    '#16191f',
  surfaceAlt: '#1d2129',
  border:     'rgba(255,255,255,0.07)',
  accent:     '#7c6ef0',
  accentHov:  '#9d91f7',
  accentDim:  'rgba(124,110,240,0.12)',
  green:      '#22c55e',
  greenDim:   'rgba(34,197,94,0.12)',
  orange:     '#f97316',
  orangeDim:  'rgba(249,115,22,0.12)',
  text:       '#e8eaf0',
  textSub:    '#8b8fa8',
  textMuted:  '#4b5068',
  red:        '#ef4444',
  redDim:     'rgba(239,68,68,0.12)',
  blue:       '#3b82f6',
  blueDim:    'rgba(59,130,246,0.12)',
};

const sxCard = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: '14px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
  },
};

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const [activeSection, setActiveSection] = useState('dashboard');
  const [qrOpen, setQrOpen] = useState(false);
  const [qrTable, setQrTable] = useState('');
  const audioRef = useRef(null);

  const [catOpen, setCatOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', order: 0 });

  const [itemOpen, setItemOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: 0, image: '', categoryId: '' });
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const disabledFeatures = user?.disabledFeatures || [];

  const { data: liveProfile } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => (await api.get('/auth/me')).data,
    refetchInterval: 5000,
  });

  const activeFeatures = liveProfile?.disabledFeatures || disabledFeatures;

  const navItems = [
    { label: 'Dashboard', icon: <Dashboard sx={{ fontSize: 18 }} />, key: 'dashboard' },
    { label: 'Menu', icon: <RestaurantMenu sx={{ fontSize: 18 }} />, key: 'menu' },
    { label: 'Orders', icon: <ReceiptLong sx={{ fontSize: 18 }} />, key: 'orders' },
    { label: 'Analytics', icon: <Leaderboard sx={{ fontSize: 18 }} />, key: 'analytics' },
    { label: 'Reservations', icon: <TableBar sx={{ fontSize: 18 }} />, key: 'reservations' },
    { label: 'Themes', icon: <Palette sx={{ fontSize: 18 }} />, key: 'themes' },
    { label: 'QR Codes', icon: <QrCode2 sx={{ fontSize: 18 }} />, key: 'qr' },
  ].filter(item => !activeFeatures.includes(item.key));

  useEffect(() => {
    if (activeFeatures.includes(activeSection)) setActiveSection('dashboard');
  }, [activeFeatures, activeSection]);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', user?.restaurantId],
    queryFn: async () => (await api.get('/api/categories')).data,
  });
  const { data: menuItems = [] } = useQuery({
    queryKey: ['menuItems', user?.restaurantId],
    queryFn: async () => (await api.get('/api/menu-items')).data,
  });
  const { data: orders = [] } = useQuery({
    queryKey: ['adminOrders', user?.restaurantId],
    queryFn: async () => (await api.get('/api/orders/restaurant')).data,
    refetchInterval: 10000,
  });

  const prevOrderCount = useRef(orders.length);
  useEffect(() => {
    if (orders.length > prevOrderCount.current && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    prevOrderCount.current = orders.length;
  }, [orders.length]);

  const catMutation = useMutation({
    mutationFn: (d) => d._id ? api.put(`/api/categories/${d._id}`, d) : api.post('/api/categories', d),
    onSuccess: () => { queryClient.invalidateQueries(['categories']); setCatOpen(false); },
  });
  const catDeleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['categories']),
  });
  const itemMutation = useMutation({
    mutationFn: (d) => d._id ? api.put(`/api/menu-items/${d._id}`, d) : api.post('/api/menu-items', d),
    onSuccess: () => { queryClient.invalidateQueries(['menuItems']); setItemOpen(false); },
  });
  const itemDeleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/menu-items/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['menuItems']),
  });
  const orderStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/api/orders/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['adminOrders']),
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setItemForm({ ...itemForm, image: res.data.imageUrl });
    } catch (err) { console.error('Upload failed', err); }
    finally { setUploading(false); }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuUrl = `${window.location.origin}/menu/${user?.slug || 'demo'}`;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const handleNav = (key) => {
    if (key === 'qr') { setQrOpen(true); }
    else { setActiveSection(key); }
    if (isMobile) setMobileOpen(false);
  };

  /* ─── Sidebar Content ─── */
  const SidebarContent = () => (
    <Box sx={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: T.surface, px: 2, py: 3,
    }}>
      {/* Brand */}
      <Box sx={{ px: 1, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: '10px',
            background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FoodBank sx={{ fontSize: 18, color: '#fff' }} />
          </Box>
          <Typography sx={{
            fontFamily: '"Manrope", sans-serif', fontWeight: 800,
            fontSize: '1rem', color: T.text, letterSpacing: '-0.3px',
          }}>
            {user?.restaurantName || 'CulinaryCanvas'}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.7rem', color: T.textMuted, pl: '46px', fontWeight: 500, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Admin Portal
        </Typography>
      </Box>

      {/* Nav */}
      <Typography sx={{ fontSize: '0.65rem', color: T.textMuted, px: 1, mb: 1, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
        Navigation
      </Typography>
      <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = activeSection === item.key && item.key !== 'qr';
          return (
            <Button
              key={item.key}
              startIcon={item.icon}
              onClick={() => handleNav(item.key)}
              sx={{
                justifyContent: 'flex-start', px: 1.5, py: 1, borderRadius: '10px',
                fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                color: active ? '#fff' : T.textSub,
                background: active
                  ? `linear-gradient(135deg, ${T.accent}, #a78bfa)`
                  : 'transparent',
                boxShadow: active ? `0 4px 14px rgba(124,110,240,0.35)` : 'none',
                '&:hover': {
                  background: active
                    ? `linear-gradient(135deg, ${T.accent}, #a78bfa)`
                    : T.accentDim,
                  color: active ? '#fff' : T.text,
                },
                transition: 'all 0.2s ease',
                textTransform: 'none',
                letterSpacing: 0,
              }}
            >
              {item.label}
              {item.key === 'orders' && pendingCount > 0 && (
                <Box sx={{
                  ml: 'auto', minWidth: 20, height: 20, borderRadius: '6px',
                  background: T.orange, color: '#fff',
                  fontSize: '0.65rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.6,
                }}>
                  {pendingCount}
                </Box>
              )}
            </Button>
          );
        })}
      </Stack>

      {/* Bottom */}
      <Box sx={{ mt: 2 }}>
        <Divider sx={{ borderColor: T.border, mb: 1.5 }} />
        <Button startIcon={<Settings sx={{ fontSize: 16 }} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.8, color: T.textSub, width: '100%', borderRadius: '10px', fontSize: '0.82rem', textTransform: 'none', '&:hover': { background: T.accentDim, color: T.text } }}>Settings</Button>
        <Button startIcon={<HelpOutline sx={{ fontSize: 16 }} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.8, color: T.textSub, width: '100%', borderRadius: '10px', fontSize: '0.82rem', textTransform: 'none', '&:hover': { background: T.accentDim, color: T.text } }}>Support</Button>
        <Divider sx={{ borderColor: T.border, my: 1.5 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1 }}>
          <Avatar sx={{ width: 32, height: 32, background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`, fontSize: '0.78rem', fontWeight: 700 }}>
            {(user?.email || 'A')[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'Admin'}</Typography>
            <Typography sx={{ fontSize: '0.65rem', color: T.textMuted }}>Manager</Typography>
          </Box>
          <IconButton size="small" onClick={logout} sx={{ color: T.textMuted, '&:hover': { color: T.red } }}>
            <Logout sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  /* ─── Stat Card ─── */
  const StatCard = ({ label, value, icon, color, dimColor }) => (
    <Paper elevation={0} sx={{ ...sxCard, p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '0.72rem', color: T.textSub, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', mb: 1 }}>{label}</Typography>
          <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, color: T.text, lineHeight: 1 }}>{value}</Typography>
        </Box>
        <Box sx={{ width: 42, height: 42, borderRadius: '12px', background: dimColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {React.cloneElement(icon, { sx: { fontSize: 20, color } })}
        </Box>
      </Box>
    </Paper>
  );

  /* ─── Section Header ─── */
  const SectionHeader = ({ title, subtitle, actions }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: T.text, fontFamily: '"Manrope",sans-serif', lineHeight: 1.2 }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: '0.82rem', color: T.textSub, mt: 0.5 }}>{subtitle}</Typography>}
      </Box>
      {actions && <Stack direction="row" spacing={1}>{actions}</Stack>}
    </Box>
  );

  const btnOutline = {
    border: `1px solid ${T.border}`, color: T.textSub, background: 'transparent',
    borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'none',
    px: 2, py: 0.9,
    '&:hover': { background: T.accentDim, borderColor: T.accent, color: T.accent },
    transition: 'all 0.2s ease',
  };
  const btnFilled = {
    background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`,
    color: '#fff', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700,
    textTransform: 'none', px: 2, py: 0.9, boxShadow: `0 4px 14px rgba(124,110,240,0.35)`,
    '&:hover': { background: `linear-gradient(135deg, ${T.accentHov}, #b4a8fc)`, boxShadow: `0 6px 20px rgba(124,110,240,0.5)` },
    transition: 'all 0.2s ease',
  };

  /* ─── Dialog styling ─── */
  const dialogPaperSx = {
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: '18px', color: T.text, minWidth: { xs: '90vw', sm: 400 },
  };
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      color: T.text, borderRadius: '10px',
      '& fieldset': { borderColor: T.border },
      '&:hover fieldset': { borderColor: T.accent },
      '&.Mui-focused fieldset': { borderColor: T.accent },
    },
    '& .MuiInputLabel-root': { color: T.textSub },
    '& .MuiInputLabel-root.Mui-focused': { color: T.accent },
    '& .MuiSelect-icon': { color: T.textSub },
  };

  /* ─── Main layout ─── */
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, borderRight: `1px solid ${T.border}` }}>
          <Box sx={{ position: 'fixed', top: 0, left: 0, width: DRAWER_WIDTH, height: '100vh', overflowY: 'auto' }}>
            <SidebarContent />
          </Box>
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          PaperProps={{ sx: { width: DRAWER_WIDTH, background: T.surface, border: 'none' } }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar (mobile) */}
        {isMobile && (
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2, py: 1.5, borderBottom: `1px solid ${T.border}`,
            background: T.surface, position: 'sticky', top: 0, zIndex: 100,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '8px', background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FoodBank sx={{ fontSize: 15, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '0.95rem', color: T.text }}>
                {user?.restaurantName || 'Admin'}
              </Typography>
            </Box>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: T.textSub }}>
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {/* Page Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>

          {/* ── Dashboard ── */}
          {activeSection === 'dashboard' && (
            <Box className="page-enter">
              <SectionHeader
                title={`Welcome back, ${user?.email?.split('@')[0] || 'Chef'} 👋`}
                subtitle="Here's what's happening at your restaurant today."
              />
              <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
                <Grid item xs={12} sm={6} lg={4}>
                  <StatCard label="Total Orders" value={orders.length} icon={<ShoppingCart />} color={T.accent} dimColor={T.accentDim} />
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <StatCard label="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`} icon={<AttachMoney />} color={T.green} dimColor={T.greenDim} />
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <StatCard label="Menu Items" value={menuItems.length} icon={<TrendingUp />} color={T.orange} dimColor={T.orangeDim} />
                </Grid>
              </Grid>

              {/* Trending Items */}
              <Paper elevation={0} sx={{ ...sxCard, p: 3 }}>
                <Typography sx={{ fontWeight: 700, color: T.text, mb: 2, fontSize: '0.95rem' }}>Trending Items</Typography>
                {menuItems.length === 0 ? (
                  <Typography sx={{ color: T.textMuted, fontSize: '0.85rem', textAlign: 'center', py: 3 }}>No menu items yet</Typography>
                ) : (
                  <Stack spacing={0} divider={<Divider sx={{ borderColor: T.border }} />}>
                    {menuItems.slice(0, 5).map((item, i) => (
                      <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 28, height: 28, borderRadius: '8px', background: T.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: T.accent }}>#{i + 1}</Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: T.text, fontSize: '0.85rem' }}>{item.name}</Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: T.textMuted }}>{categories.find(c => c._id === item.categoryId)?.name || '—'}</Typography>
                          </Box>
                        </Box>
                        <Typography sx={{ fontWeight: 800, color: T.accent, fontSize: '0.9rem' }}>₹{item.price}</Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Box>
          )}

          {/* ── Menu Management ── */}
          {activeSection === 'menu' && (
            <Box className="page-enter">
              <SectionHeader
                title="Menu Management"
                subtitle={`${categories.length} categories · ${menuItems.length} items`}
                actions={[
                  <Button key="cat" sx={btnOutline} onClick={() => { setEditCat(null); setCatForm({ name: '', order: 0 }); setCatOpen(true); }}>
                    + Category
                  </Button>,
                  <Button key="item" sx={btnFilled} startIcon={<Add sx={{ fontSize: 16 }} />} onClick={() => { setEditItem(null); setItemForm({ name: '', description: '', price: 0, image: '', categoryId: '' }); setItemOpen(true); }}>
                    Add Item
                  </Button>,
                ]}
              />

              {/* Categories */}
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', mb: 1.5 }}>Categories</Typography>
              {categories.length === 0 ? (
                <Paper elevation={0} sx={{ ...sxCard, p: 4, textAlign: 'center', mb: 3 }}>
                  <Typography sx={{ color: T.textMuted, fontSize: '0.85rem' }}>No categories yet. Add one to get started.</Typography>
                </Paper>
              ) : (
                <Grid container spacing={2} sx={{ mb: 3.5 }}>
                  {categories.map(cat => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={cat._id}>
                      <Paper elevation={0} sx={{
                        ...sxCard,
                        p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: T.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RestaurantMenu sx={{ fontSize: 17, color: T.accent }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.88rem', lineHeight: 1.3 }}>{cat.name}</Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: T.textMuted }}>Order #{cat.order}</Typography>
                          </Box>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => { setEditCat(cat); setCatForm(cat); setCatOpen(true); }}
                            sx={{ color: T.textSub, '&:hover': { color: T.accent, background: T.accentDim } }}>
                            <Edit sx={{ fontSize: 15 }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => catDeleteMutation.mutate(cat._id)}
                            sx={{ color: T.textSub, '&:hover': { color: T.red, background: T.redDim } }}>
                            <Delete sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Menu Items */}
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', mb: 1.5 }}>Menu Items</Typography>
              {menuItems.length === 0 ? (
                <Paper elevation={0} sx={{ ...sxCard, p: 4, textAlign: 'center' }}>
                  <Typography sx={{ color: T.textMuted, fontSize: '0.85rem' }}>No menu items yet.</Typography>
                </Paper>
              ) : (
                <Grid container spacing={2.5}>
                  {menuItems.map(item => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                      <Card elevation={0} sx={{ ...sxCard, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {item.image ? (
                          <Box
                            component="img"
                            src={item.image}
                            sx={{ width: '100%', height: 150, objectFit: 'cover' }}
                          />
                        ) : (
                          <Box sx={{
                            height: 100, background: `linear-gradient(135deg, ${T.accentDim}, rgba(167,139,250,0.1))`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <FoodBank sx={{ fontSize: 36, color: T.accentDim }} />
                          </Box>
                        )}
                        <CardContent sx={{ p: 2, pb: '12px !important', flexGrow: 1 }}>
                          <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9rem', mb: 0.4, lineHeight: 1.3 }}>{item.name}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: T.textSub, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1, borderTop: `1px solid ${T.border}` }}>
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: T.accent, fontSize: '1rem' }}>₹{item.price}</Typography>
                              <Chip
                                label={categories.find(c => c._id === item.categoryId)?.name || 'Uncategorized'}
                                size="small"
                                sx={{ height: 18, fontSize: '0.6rem', background: T.accentDim, color: T.accent, fontWeight: 600, mt: 0.3 }}
                              />
                            </Box>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton size="small" onClick={() => { setEditItem(item); setItemForm(item); setItemOpen(true); }}
                                sx={{ color: T.textSub, '&:hover': { color: T.accent, background: T.accentDim } }}>
                                <Edit sx={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton size="small" onClick={() => itemDeleteMutation.mutate(item._id)}
                                sx={{ color: T.textSub, '&:hover': { color: T.red, background: T.redDim } }}>
                                <Delete sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Stack>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* ── Orders ── */}
          {activeSection === 'orders' && (
            <Box className="page-enter">
              <SectionHeader
                title="Live Orders"
                subtitle={`${pendingCount} pending · ${orders.length} total`}
              />
              <Stack spacing={2}>
                {orders.length === 0 ? (
                  <Paper elevation={0} sx={{ ...sxCard, p: 5, textAlign: 'center' }}>
                    <ReceiptLong sx={{ fontSize: 48, color: T.textMuted, mb: 1.5 }} />
                    <Typography sx={{ color: T.textSub, fontWeight: 600 }}>No active orders</Typography>
                    <Typography sx={{ color: T.textMuted, fontSize: '0.8rem', mt: 0.5 }}>Orders will appear here in real time</Typography>
                  </Paper>
                ) : orders.map(order => {
                  const statusColors = {
                    pending: { bg: T.orangeDim, text: T.orange },
                    confirmed: { bg: T.blueDim, text: T.blue },
                    preparing: { bg: T.accentDim, text: T.accent },
                    completed: { bg: T.greenDim, text: T.green },
                    cancelled: { bg: T.redDim, text: T.red },
                  };
                  const sc = statusColors[order.status] || { bg: T.accentDim, text: T.accent };
                  return (
                    <Paper key={order._id} elevation={0} sx={{ ...sxCard, p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 800, color: T.text, fontSize: '1rem', fontFamily: '"Manrope",sans-serif' }}>
                              #{order._id.slice(-6).toUpperCase()}
                            </Typography>
                            {order.tableNumber && (
                              <Chip label={`Table ${order.tableNumber}`} size="small"
                                sx={{ height: 20, fontSize: '0.68rem', background: T.accentDim, color: T.accent, fontWeight: 700 }} />
                            )}
                          </Box>
                          <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>
                            {new Date(order.createdAt).toLocaleTimeString()} · {order.customerPhone}
                          </Typography>
                        </Box>
                        <Box sx={{ px: 1.5, py: 0.5, borderRadius: '8px', background: sc.bg, display: 'flex', alignItems: 'center', gap: 0.7 }}>
                          <Circle sx={{ fontSize: 7, color: sc.text }} />
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: sc.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {order.status}
                          </Typography>
                        </Box>
                      </Box>
                      <Stack spacing={0.4} sx={{ mb: 2 }}>
                        {order.items.map((item, j) => (
                          <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 22, height: 22, borderRadius: '6px', background: T.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: T.accent }}>{item.quantity}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.82rem', color: T.textSub }}>{item.name}</Typography>
                          </Box>
                        ))}
                      </Stack>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: `1px solid ${T.border}`, flexWrap: 'wrap', gap: 1 }}>
                        <Typography sx={{ fontWeight: 800, color: T.accent, fontSize: '1.1rem' }}>₹{order.totalAmount.toFixed(0)}</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {order.status === 'pending' && (
                            <Button size="small" sx={{ ...btnFilled, py: 0.5, px: 1.5, fontSize: '0.75rem' }} onClick={() => orderStatusMutation.mutate({ id: order._id, status: 'confirmed' })}>
                              Accept
                            </Button>
                          )}
                          {order.status === 'confirmed' && (
                            <Button size="small" sx={{ ...btnFilled, background: `linear-gradient(135deg, ${T.blue}, #60a5fa)`, boxShadow: 'none', py: 0.5, px: 1.5, fontSize: '0.75rem' }} onClick={() => orderStatusMutation.mutate({ id: order._id, status: 'preparing' })}>
                              Start Prep
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button size="small" sx={{ ...btnFilled, background: `linear-gradient(135deg, ${T.green}, #4ade80)`, boxShadow: 'none', py: 0.5, px: 1.5, fontSize: '0.75rem' }} onClick={() => orderStatusMutation.mutate({ id: order._id, status: 'completed' })}>
                              Mark Ready
                            </Button>
                          )}
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <Button size="small" sx={{ border: `1px solid ${T.redDim}`, color: T.red, borderRadius: '8px', fontSize: '0.75rem', textTransform: 'none', py: 0.5, px: 1.5, '&:hover': { background: T.redDim } }} onClick={() => orderStatusMutation.mutate({ id: order._id, status: 'cancelled' })}>
                              Cancel
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* ── Analytics ── */}
          {activeSection === 'analytics' && (
            <Box className="page-enter">
              <SectionHeader title="Analytics" subtitle="Track peak hours, popular items, and revenue trends." />
              <Paper elevation={0} sx={{ ...sxCard, p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '18px', background: T.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <Leaderboard sx={{ fontSize: 30, color: T.accent }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '1.05rem', mb: 0.5 }}>Advanced Analytics</Typography>
                <Typography sx={{ color: T.textMuted, fontSize: '0.85rem' }}>Coming soon — detailed revenue & item performance reports.</Typography>
              </Paper>
            </Box>
          )}

          {/* ── Reservations ── */}
          {activeSection === 'reservations' && (
            <Box className="page-enter">
              <SectionHeader title="Table Reservations" subtitle="Manage table bookings and seating." />
              <Paper elevation={0} sx={{ ...sxCard, p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '18px', background: T.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <TableBar sx={{ fontSize: 30, color: T.accent }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '1.05rem', mb: 0.5 }}>Reservations Module</Typography>
                <Typography sx={{ color: T.textMuted, fontSize: '0.85rem' }}>Allow customers to reserve tables in advance. Enable waiting lists and seating charts here.</Typography>
              </Paper>
            </Box>
          )}

          {/* ── Themes ── */}
          {activeSection === 'themes' && (
            <Box className="page-enter">
              <SectionHeader title="Brand Themes" subtitle="Customize your public storefront." />
              <Paper elevation={0} sx={{ ...sxCard, p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '18px', background: T.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <Palette sx={{ fontSize: 30, color: T.accent }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '1.05rem', mb: 0.5 }}>Customize Storefront</Typography>
                <Typography sx={{ color: T.textMuted, fontSize: '0.85rem' }}>Switch between dark modes, custom color palettes, and stunning new layout structures.</Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Dialogs ── */}

      {/* Category Dialog */}
      <Dialog open={catOpen} onClose={() => setCatOpen(false)} PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={{ fontWeight: 700, color: T.text, fontSize: '1rem', pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editCat ? 'Edit Category' : 'Add Category'}
          <IconButton size="small" onClick={() => setCatOpen(false)} sx={{ color: T.textMuted }}><Close sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <TextField autoFocus margin="dense" label="Name" fullWidth value={catForm.name}
            onChange={e => setCatForm({ ...catForm, name: e.target.value })} sx={inputSx} />
          <TextField margin="dense" label="Display Order" type="number" fullWidth value={catForm.order}
            onChange={e => setCatForm({ ...catForm, order: Number(e.target.value) })} sx={inputSx} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCatOpen(false)} sx={{ ...btnOutline }}>Cancel</Button>
          <Button onClick={() => catMutation.mutate(catForm)} sx={{ ...btnFilled }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemOpen} onClose={() => setItemOpen(false)} PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={{ fontWeight: 700, color: T.text, fontSize: '1rem', pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editItem ? 'Edit Menu Item' : 'Add Item'}
          <IconButton size="small" onClick={() => setItemOpen(false)} sx={{ color: T.textMuted }}><Close sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <TextField margin="dense" label="Name" fullWidth value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} sx={inputSx} />
          <TextField margin="dense" label="Description" fullWidth multiline rows={2} value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} sx={inputSx} />
          <TextField margin="dense" label="Price (₹)" type="number" fullWidth value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: Number(e.target.value) })} sx={inputSx} />
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography sx={{ fontSize: '0.78rem', color: T.textSub, mb: 1, fontWeight: 600 }}>Item Image</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button component="label" disabled={uploading} sx={{ ...btnOutline, fontSize: '0.75rem', py: 0.7 }}>
                {uploading ? 'Uploading…' : '📎 Upload'}
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
              {itemForm.image && <Box component="img" src={itemForm.image} sx={{ height: 40, borderRadius: '8px', border: `1px solid ${T.border}` }} />}
            </Box>
          </Box>
          <FormControl fullWidth margin="dense" sx={inputSx}>
            <InputLabel>Category</InputLabel>
            <Select value={itemForm.categoryId} onChange={e => setItemForm({ ...itemForm, categoryId: e.target.value })} label="Category"
              MenuProps={{ PaperProps: { sx: { background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, '& .MuiMenuItem-root:hover': { background: T.accentDim } } } }}>
              {categories.map(c => <SelectItem key={c._id} value={c._id} sx={{ color: T.text }}>{c.name}</SelectItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setItemOpen(false)} sx={{ ...btnOutline }}>Cancel</Button>
          <Button onClick={() => itemMutation.mutate(itemForm)} sx={{ ...btnFilled }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* QR Dialog */}
      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} PaperProps={{ sx: { ...dialogPaperSx, minWidth: { xs: '90vw', sm: 380 } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: T.text, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Restaurant QR Code
          <IconButton size="small" onClick={() => setQrOpen(false)} sx={{ color: T.textMuted }}><Close sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <TextField label="Table Number (Optional)" variant="outlined" size="small" sx={{ mb: 3, ...inputSx }}
            value={qrTable} onChange={(e) => setQrTable(e.target.value)} />
          <Box sx={{ display: 'inline-flex', p: 2, background: '#fff', borderRadius: '14px' }}>
            <QRCodeSVG value={qrTable ? `${menuUrl}?table=${qrTable}` : menuUrl} size={220} />
          </Box>
          <Typography sx={{ mt: 2, fontSize: '0.72rem', color: T.textMuted, wordBreak: 'break-all' }}>
            {qrTable ? `${menuUrl}?table=${qrTable}` : menuUrl}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setQrOpen(false)} sx={{ ...btnOutline }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
