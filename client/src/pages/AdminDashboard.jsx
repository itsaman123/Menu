import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Button, TextField, Paper, IconButton, List, ListItem, ListItemText,
  ListItemSecondaryAction, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem as SelectItem, InputLabel, FormControl, Chip, Stack,
  Drawer, Avatar, Divider, Grid, Card, CardContent
} from '@mui/material';
import {
  Delete, Edit, QrCode2, Dashboard, RestaurantMenu, ReceiptLong,
  Leaderboard, Settings, HelpOutline, Logout, Add, Notifications
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const DRAWER_WIDTH = 260;

const AdminDashboard = () => {
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

  const navItems = [
    { label: 'Dashboard', icon: <Dashboard />, key: 'dashboard' },
    { label: 'Menu', icon: <RestaurantMenu />, key: 'menu' },
    { label: 'Orders', icon: <ReceiptLong />, key: 'orders' },
    { label: 'Analytics', icon: <Leaderboard />, key: 'analytics' },
    { label: 'QR Codes', icon: <QrCode2 />, key: 'qr' },
  ].filter(item => !disabledFeatures.includes(item.key));

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', user?.restaurantId], queryFn: async () => (await api.get('/api/categories')).data
  });
  const { data: menuItems = [] } = useQuery({
    queryKey: ['menuItems', user?.restaurantId], queryFn: async () => (await api.get('/api/menu-items')).data
  });
  const { data: orders = [] } = useQuery({
    queryKey: ['adminOrders', user?.restaurantId],
    queryFn: async () => (await api.get('/api/orders/restaurant')).data,
    refetchInterval: 10000
  });

  // Sound notification
  const prevOrderCount = useRef(orders.length);
  useEffect(() => {
    if (orders.length > prevOrderCount.current && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    prevOrderCount.current = orders.length;
  }, [orders.length]);

  // Mutations
  const catMutation = useMutation({
    mutationFn: (d) => d._id ? api.put(`/api/categories/${d._id}`, d) : api.post('/api/categories', d),
    onSuccess: () => { queryClient.invalidateQueries(['categories']); setCatOpen(false); }
  });
  const catDeleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['categories'])
  });
  const itemMutation = useMutation({
    mutationFn: (d) => d._id ? api.put(`/api/menu-items/${d._id}`, d) : api.post('/api/menu-items', d),
    onSuccess: () => { queryClient.invalidateQueries(['menuItems']); setItemOpen(false); }
  });
  const itemDeleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/menu-items/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['menuItems'])
  });
  const orderStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/api/orders/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['adminOrders'])
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

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--cc-surface-container-low)' }} className="page-enter">
      {/* Sidebar */}
      <Drawer variant="permanent" sx={{
        width: DRAWER_WIDTH, flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH, bgcolor: 'var(--cc-surface-container-lowest)',
          boxShadow: 'none', border: 'none', p: 2, pt: 3,
        },
      }}>
        <Typography variant="h6" fontWeight="800" sx={{ fontFamily: '"Manrope"', color: 'var(--cc-primary)', px: 1, mb: 0.5 }}>
          {user?.restaurantName || 'CulinaryCanvas'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--cc-on-surface-variant)', px: 1, mb: 3, display: 'block' }}>
          Admin Terminal
        </Typography>

        <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.key}
              startIcon={item.icon}
              onClick={() => item.key === 'qr' ? setQrOpen(true) : setActiveSection(item.key)}
              sx={{
                justifyContent: 'flex-start', px: 2, py: 1.2, borderRadius: 'var(--radius-md)',
                color: activeSection === item.key ? 'var(--cc-on-primary)' : 'var(--cc-on-surface-variant)',
                bgcolor: activeSection === item.key ? 'var(--cc-primary)' : 'transparent',
                fontWeight: activeSection === item.key ? 700 : 500,
                '&:hover': {
                  bgcolor: activeSection === item.key ? 'var(--cc-primary)' : 'var(--cc-surface-container)',
                },
              }}
            >
              {item.label}
              {item.key === 'orders' && pendingCount > 0 && (
                <Chip label={pendingCount} size="small" sx={{ ml: 'auto', height: 20, bgcolor: activeSection === 'orders' ? 'rgba(255,255,255,0.2)' : 'rgba(108,92,231,0.1)', color: activeSection === 'orders' ? 'white' : 'var(--cc-primary)', fontWeight: 'bold' }} />
              )}
            </Button>
          ))}
        </Stack>

        <Stack spacing={0.5} sx={{ mt: 2 }}>
          <Button startIcon={<Settings />} sx={{ justifyContent: 'flex-start', px: 2, py: 1, color: 'var(--cc-on-surface-variant)' }}>Settings</Button>
          <Button startIcon={<HelpOutline />} sx={{ justifyContent: 'flex-start', px: 2, py: 1, color: 'var(--cc-on-surface-variant)' }}>Support</Button>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--cc-primary)', fontSize: '0.8rem' }}>
              {(user?.email || 'A')[0].toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight="600" noWrap>{user?.email || 'Admin'}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--cc-on-surface-variant)' }}>General Manager</Typography>
            </Box>
            <IconButton size="small" onClick={logout}><Logout fontSize="small" /></IconButton>
          </Box>
        </Stack>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 4, ml: `${DRAWER_WIDTH}px` }}>
        {/* Dashboard */}
        {activeSection === 'dashboard' && (
          <>
            <Typography variant="h4" fontWeight="800" sx={{ mb: 1 }}>Admin Dashboard</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Welcome back, {user?.email?.split('@')[0] || 'Chef'}.</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { label: 'Total Orders', value: orders.length, color: 'var(--cc-primary)' },
                { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, color: '#2e7d32' },
                { label: 'Active Menu Items', value: menuItems.length, color: 'var(--cc-tertiary)' },
              ].map((stat, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Paper elevation={0} sx={{ p: 3, bgcolor: 'var(--cc-surface-container-lowest)', boxShadow: 'var(--shadow-card)' }}>
                    <Typography variant="body2" sx={{ color: 'var(--cc-on-surface-variant)', mb: 1 }}>{stat.label}</Typography>
                    <Typography variant="h4" fontWeight="800" sx={{ color: stat.color }}>{stat.value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Trending Items */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'var(--cc-surface-container-lowest)', boxShadow: 'var(--shadow-card)' }}>
              <Typography variant="h6" fontWeight="700" gutterBottom>Trending Items</Typography>
              <Stack spacing={2}>
                {menuItems.slice(0, 3).map((item) => (
                  <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight="600">{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{categories.find(c => c._id === item.categoryId)?.name}</Typography>
                    </Box>
                    <Typography fontWeight="700" color="primary">₹{item.price}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </>
        )}

        {/* Menu Management */}
        {activeSection === 'menu' && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" fontWeight="800">Menu Management</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => { setEditCat(null); setCatForm({ name: '', order: 0 }); setCatOpen(true); }}>Add Category</Button>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setEditItem(null); setItemForm({ name: '', description: '', price: 0, image: '', categoryId: '' }); setItemOpen(true); }}>Add Item</Button>
              </Stack>
            </Box>

            {/* Categories */}
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Categories</Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {categories.map(cat => (
                <Grid item xs={12} sm={6} md={4} key={cat._id}>
                  <Paper elevation={0} sx={{ p: 3, bgcolor: 'var(--cc-surface-container-lowest)', boxShadow: 'var(--shadow-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight="700">{cat.name}</Typography>
                      <Typography variant="caption" color="text.secondary">Order: {cat.order}</Typography>
                    </Box>
                    <Stack direction="row">
                      <IconButton size="small" onClick={() => { setEditCat(cat); setCatForm(cat); setCatOpen(true); }}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => catDeleteMutation.mutate(cat._id)}><Delete fontSize="small" /></IconButton>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Items */}
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Menu Items</Typography>
            <Grid container spacing={2}>
              {menuItems.map(item => (
                <Grid item xs={12} sm={6} md={4} key={item._id}>
                  <Card elevation={0} sx={{ bgcolor: 'var(--cc-surface-container-lowest)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
                    {item.image && <Box component="img" src={item.image} sx={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                    <CardContent>
                      <Typography fontWeight="700">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{item.description}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography fontWeight="800" color="primary">₹{item.price}</Typography>
                        <Stack direction="row">
                          <IconButton size="small" onClick={() => { setEditItem(item); setItemForm(item); setItemOpen(true); }}><Edit fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => itemDeleteMutation.mutate(item._id)}><Delete fontSize="small" /></IconButton>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Orders */}
        {activeSection === 'orders' && (
          <>
            <Typography variant="h4" fontWeight="800" sx={{ mb: 4 }}>Live Orders</Typography>
            <Stack spacing={2}>
              {orders.map(order => (
                <Paper key={order._id} elevation={0} sx={{ p: 3, bgcolor: 'var(--cc-surface-container-lowest)', boxShadow: 'var(--shadow-card)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="800">#{order._id.slice(-6).toUpperCase()}</Typography>
                      {order.tableNumber && (
                        <Typography variant="subtitle2" sx={{ color: 'var(--cc-primary)', fontWeight: 'bold' }}>
                          Table: {order.tableNumber}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleTimeString()} • {order.customerPhone}
                      </Typography>
                    </Box>
                    <span className={`status-pill ${order.status}`}>{order.status}</span>
                  </Box>
                  <Stack spacing={0.5} sx={{ mb: 2 }}>
                    {order.items.map((item, j) => (
                      <Typography key={j} variant="body2"><strong>{item.quantity}×</strong> {item.name}</Typography>
                    ))}
                  </Stack>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid var(--cc-surface-container)' }}>
                    <Typography variant="h6" color="primary" fontWeight="700">₹{order.totalAmount.toFixed(0)}</Typography>
                    <Stack direction="row" spacing={1}>
                      {order.status === 'pending' && <Button size="small" variant="contained" onClick={() => orderStatusMutation.mutate({ id: order._id, status: 'confirmed' })}>Accept</Button>}
                      {order.status === 'confirmed' && <Button size="small" variant="contained" onClick={() => orderStatusMutation.mutate({ id: order._id, status: 'preparing' })}>Start Prep</Button>}
                      {order.status === 'preparing' && <Button size="small" variant="contained" sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, background: '#2e7d32' }} onClick={() => orderStatusMutation.mutate({ id: order._id, status: 'completed' })}>Ready</Button>}
                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <Button size="small" variant="outlined" color="error" onClick={() => orderStatusMutation.mutate({ id: order._id, status: 'cancelled' })}>Cancel</Button>
                      )}
                    </Stack>
                  </Box>
                </Paper>
              ))}
              {orders.length === 0 && (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'var(--cc-surface-container-lowest)' }}>
                  <ReceiptLong sx={{ fontSize: 60, color: 'var(--cc-outline-variant)', mb: 2 }} />
                  <Typography color="text.secondary">No active orders</Typography>
                </Paper>
              )}
            </Stack>
          </>
        )}

        {/* Analytics (placeholder) */}
        {activeSection === 'analytics' && (
          <>
            <Typography variant="h4" fontWeight="800" sx={{ mb: 4 }}>Analytics</Typography>
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'var(--cc-surface-container-lowest)' }}>
              <Leaderboard sx={{ fontSize: 60, color: 'var(--cc-outline-variant)', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">Advanced analytics coming soon</Typography>
              <Typography variant="body2" color="text.secondary">Track peak hours, popular items, and revenue trends.</Typography>
            </Paper>
          </>
        )}
      </Box>

      {/* Dialogs */}
      <Dialog open={catOpen} onClose={() => setCatOpen(false)} PaperProps={{ sx: { borderRadius: 'var(--radius-xl)', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editCat ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent sx={{ minWidth: 380 }}>
          <TextField autoFocus margin="dense" label="Name" fullWidth value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} />
          <TextField margin="dense" label="Display Order" type="number" fullWidth value={catForm.order} onChange={e => setCatForm({...catForm, order: Number(e.target.value)})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCatOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => catMutation.mutate(catForm)}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={itemOpen} onClose={() => setItemOpen(false)} PaperProps={{ sx: { borderRadius: 'var(--radius-xl)', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editItem ? 'Edit Menu Item' : 'Add Item'}</DialogTitle>
        <DialogContent sx={{ minWidth: 380 }}>
          <TextField margin="dense" label="Name" fullWidth value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} />
          <TextField margin="dense" label="Description" fullWidth multiline rows={2} value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} />
          <TextField margin="dense" label="Price (₹)" type="number" fullWidth value={itemForm.price} onChange={e => setItemForm({...itemForm, price: Number(e.target.value)})} />
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'var(--cc-on-surface-variant)' }}>Item Image</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button variant="outlined" component="label" disabled={uploading} size="small">
                {uploading ? 'Uploading...' : 'Upload'}<input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
              {itemForm.image && <Box component="img" src={itemForm.image} sx={{ height: 40, borderRadius: 'var(--radius-sm)' }} />}
            </Box>
          </Box>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select value={itemForm.categoryId} onChange={e => setItemForm({...itemForm, categoryId: e.target.value})} label="Category">
              {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => itemMutation.mutate(itemForm)}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} PaperProps={{ sx: { borderRadius: 'var(--radius-xl)', p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Restaurant QR Code</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <TextField 
            label="Table Number (Optional)" 
            variant="outlined" 
            size="small" 
            sx={{ mb: 3 }} 
            value={qrTable} 
            onChange={(e) => setQrTable(e.target.value)} 
          />
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <QRCodeSVG value={qrTable ? `${menuUrl}?table=${qrTable}` : menuUrl} size={256} />
          </Box>
          <Typography variant="body2" sx={{ mt: 2, color: 'var(--cc-on-surface-variant)' }}>
            {qrTable ? `${menuUrl}?table=${qrTable}` : menuUrl}
          </Typography>
        </DialogContent>
        <DialogActions><Button onClick={() => setQrOpen(false)}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
