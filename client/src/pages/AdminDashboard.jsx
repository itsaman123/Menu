import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Container, Typography, Tab, Tabs, Button, TextField, 
  Paper, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem as SelectItem, 
  InputLabel, FormControl, AppBar, Toolbar, Badge, Chip, Stack,
  Drawer, Divider
} from '@mui/material';
import { Delete, Edit, QrCode, Notifications, CheckCircle, Restaurant, DirectionsRun } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(2); // Start on orders tab
  const [qrOpen, setQrOpen] = useState(false);
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
  
  // Category state
  const [catOpen, setCatOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', order: 0 });

  // Menu item state
  const [itemOpen, setItemOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: 0, image: '', categoryId: '' });
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/api/categories')).data
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => (await api.get('/api/menu-items')).data
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => (await api.get('/api/orders/restaurant')).data,
    refetchInterval: 10000 // Poll every 10 seconds for new orders
  });

  // Sound notification effect
  const prevOrderCount = useRef(orders.length);
  useEffect(() => {
    if (orders.length > prevOrderCount.current) {
      audioRef.current.play().catch(e => console.log('Audio disabled by browser policy'));
    }
    prevOrderCount.current = orders.length;
  }, [orders.length]);

  // Category Mutations
  const catMutation = useMutation({
    mutationFn: (data) => data._id ? api.put(`/api/categories/${data._id}`, data) : api.post('/api/categories', data),
    onSuccess: () => { queryClient.invalidateQueries(['categories']); setCatOpen(false); }
  });

  const catDeleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['categories'])
  });

  // Menu Item Mutations
  const itemMutation = useMutation({
    mutationFn: (data) => data._id ? api.put(`/api/menu-items/${data._id}`, data) : api.post('/api/menu-items', data),
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
      const res = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setItemForm({ ...itemForm, image: res.data.imageUrl });
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCatSave = () => { catMutation.mutate(catForm); };
  const handleItemSave = () => { itemMutation.mutate(itemForm); };

  const menuUrl = `${window.location.origin}/menu/${user?.slug || 'my-restaurant'}`;

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'primary',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <Restaurant color="primary" sx={{ mr: 2 }} />
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>{user?.restaurantName || 'Menu Admin'}</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={() => setQrOpen(true)}><QrCode /></IconButton>
            <IconButton><Badge badgeContent={orders.filter(o => o.status === 'pending').length} color="error"><Notifications /></Badge></IconButton>
            <Button color="inherit" onClick={logout} sx={{ fontWeight: 'bold' }}>Logout</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, pb: 6 }}>
        <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: 'white' }}>
            <Tab label="Live Orders" icon={<DirectionsRun />} iconPosition="start" />
            <Tab label="Menu Categories" />
            <Tab label="Menu Items" />
          </Tabs>

          <TabPanel value={tabValue} index={1}>
            <Button variant="contained" onClick={() => { setEditCat(null); setCatForm({ name: '', order: 0 }); setCatOpen(true); }} sx={{ mb: 3 }}>Add Category</Button>
            <List>
              {categories.map(cat => (
                <ListItem key={cat._id} sx={{ bgcolor: 'white', mb: 1, borderRadius: 2, border: '1px solid #f0f0f0' }}>
                  <ListItemText primary={<strong>{cat.name}</strong>} secondary={`Display Order: ${cat.order}`} />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => { setEditCat(cat); setCatForm(cat); setCatOpen(true); }}><Edit /></IconButton>
                    <IconButton edge="end" color="error" onClick={() => catDeleteMutation.mutate(cat._id)}><Delete /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Button variant="contained" onClick={() => { setEditItem(null); setItemForm({ name: '', description: '', price: 0, image: '', categoryId: '' }); setItemOpen(true); }} sx={{ mb: 3 }}>Add Menu Item</Button>
            <List>
              {menuItems.map(item => (
                <ListItem key={item._id} sx={{ bgcolor: 'white', mb: 1, borderRadius: 2, border: '1px solid #f0f0f0' }}>
                   <ListItemText primary={<strong>{item.name}</strong>} secondary={`₹{item.price} • ${categories.find(c => c._id === item.categoryId)?.name}`} />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => { setEditItem(item); setItemForm(item); setItemOpen(true); }}><Edit /></IconButton>
                    <IconButton edge="end" color="error" onClick={() => itemDeleteMutation.mutate(item._id)}><Delete /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Incoming Orders</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {orders.map(order => (
                <Paper key={order._id} elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 4, bgcolor: order.status === 'pending' ? 'rgba(255, 152, 0, 0.05)' : 'white' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="900">#{order._id.slice(-6).toUpperCase()}</Typography>
                      <Typography variant="body2" color="text.secondary">{new Date(order.createdAt).toLocaleTimeString()} • {order.customerPhone}</Typography>
                    </Box>
                    <Chip label={order.status.toUpperCase()} color={getStatusColor(order.status)} size="small" sx={{ fontWeight: 'bold' }} />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    {order.items.map((item, i) => (
                      <Typography key={i} variant="body1"><strong>{item.quantity}x</strong> {item.name}</Typography>
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">Total: ₹{order.totalAmount.toFixed(2)}</Typography>
                    <Stack direction="row" spacing={1}>
                      {order.status === 'pending' && <Button variant="contained" color="info" size="small" onClick={() => orderStatusMutation.mutate({ id: order._id, status: 'confirmed' })}>Confirm</Button>}
                      {order.status === 'confirmed' && <Button variant="contained" color="primary" size="small" onClick={() => orderStatusMutation.mutate({ id: order._id, status: 'preparing' })}>Start Prep</Button>}
                      {order.status === 'preparing' && <Button variant="contained" color="success" size="small" onClick={() => orderStatusMutation.mutate({ id: order._id, status: 'completed' })}>Set Ready</Button>}
                      <Button variant="outlined" color="error" size="small" onClick={() => orderStatusMutation.mutate({ id: order._id, status: 'cancelled' })}>Cancel</Button>
                    </Stack>
                  </Box>
                </Paper>
              ))}
              {orders.length === 0 && <Box sx={{ py: 8, textAlign: 'center' }}><CheckCircle color="disabled" sx={{ fontSize: 60, mb: 2 }} /><Typography color="text.secondary">No active orders</Typography></Box>}
            </Stack>
          </TabPanel>
        </Paper>
      </Container>

      {/* Reusable Dialogs for Cat/Item/QR - Omitted identical logic as before, just kept structural placeholders */}
      <Dialog open={catOpen} onClose={() => setCatOpen(false)}>
        <DialogTitle>{editCat ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent sx={{ width: 400 }}>
          <TextField autoFocus margin="dense" label="Name" fullWidth value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} />
          <TextField margin="dense" label="Order" type="number" fullWidth value={catForm.order} onChange={e => setCatForm({...catForm, order: Number(e.target.value)})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCatOpen(false)}>Cancel</Button>
          <Button onClick={handleCatSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={itemOpen} onClose={() => setItemOpen(false)}>
        <DialogTitle>{editItem ? 'Edit Menu Item' : 'Add Item'}</DialogTitle>
        <DialogContent sx={{ width: 400 }}>
          <TextField margin="dense" label="Name" fullWidth value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} />
          <TextField margin="dense" label="Description" fullWidth multiline rows={2} value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} />
          <TextField margin="dense" label="Price" type="number" fullWidth value={itemForm.price} onChange={e => setItemForm({...itemForm, price: Number(e.target.value)})} />
          <Box sx={{ mt: 2, mb: 1 }}>
            <InputLabel shrink>Item Image</InputLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button variant="outlined" component="label" disabled={uploading}>{uploading ? '...' : 'Upload'}<input type="file" hidden accept="image/*" onChange={handleImageUpload} /></Button>
              {itemForm.image && <img src={itemForm.image} style={{ height: 40, borderRadius: 4 }} />}
            </Box>
          </Box>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select value={itemForm.categoryId} onChange={e => setItemForm({...itemForm, categoryId: e.target.value})} label="Category">
              {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions><Button onClick={() => setItemOpen(false)}>Cancel</Button><Button onClick={handleItemSave} variant="contained">Save</Button></DialogActions>
      </Dialog>

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)}>
        <DialogTitle>Restaurant QR Code</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}><QRCodeSVG value={menuUrl} size={256} /><Typography variant="body2" sx={{ mt: 2 }}>{menuUrl}</Typography></DialogContent>
        <DialogActions><Button onClick={() => setQrOpen(false)}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
