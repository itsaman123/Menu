import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Switch, IconButton, Button, Chip, Stack, Drawer, Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { Delete, Edit, Logout, AdminPanelSettings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const SuperAdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editAdmin, setEditAdmin] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [disabledFeats, setDisabledFeats] = useState([]);

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['superadmins'],
    queryFn: async () => (await api.get('/api/superadmin/admins')).data
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/superadmin/admins/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['superadmins'] }); setDialogOpen(false); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/superadmin/admins/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['superadmins'] })
  });

  const logout = () => {
    localStorage.removeItem('saToken');
    localStorage.removeItem('saUser');
    navigate('/superadmin-login');
  };

  const handleEditClick = (admin) => {
    setEditAdmin(admin);
    setDisabledFeats(admin.disabledFeatures || []);
    setDialogOpen(true);
  };

  const toggleFeature = (feature) => {
    setDisabledFeats(prev => 
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  const saveFeatures = () => {
    updateMutation.mutate({ id: editAdmin._id, data: { disabledFeatures: disabledFeats }});
  };

  const toggleActive = (id, currentStatus) => {
    updateMutation.mutate({ id, data: { isActive: !currentStatus }});
  };

  const allFeatures = ['menu', 'orders', 'analytics', 'qr', 'reservations', 'themes'];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--cc-surface-container-low)' }}>
      {/* Sidebar */}
      <Drawer variant="permanent" sx={{ width: 260, flexShrink: 0, '& .MuiDrawer-paper': { width: 260, bgcolor: '#1a1a2e', color: 'white', p: 3, border: 'none' }}}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 4 }}>
          <AdminPanelSettings sx={{ color: '#4facfe', fontSize: 32 }} />
          <Typography variant="h6" fontWeight="bold">Super Admin</Typography>
        </Stack>
        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          <Button sx={{ justifyContent: 'flex-start', color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>Admins</Button>
        </Stack>
        <Button startIcon={<Logout />} onClick={logout} sx={{ color: '#ff6b6b' }}>Logout</Button>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="800" sx={{ mb: 4 }}>System Administrators</Typography>
        
        <Paper elevation={0} sx={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'var(--cc-surface-container)' }}>
              <TableRow>
                <TableCell>Restaurant</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status (Active)</TableCell>
                <TableCell>Disabled Features</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map(admin => (
                <TableRow key={admin._id}>
                  <TableCell sx={{ fontWeight: '600' }}>{admin.restaurantId?.name || 'Unknown'}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={admin.isActive !== false} 
                      onChange={() => toggleActive(admin._id, admin.isActive !== false)} 
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    {admin.disabledFeatures?.length > 0 
                      ? admin.disabledFeatures.map(f => <Chip key={f} label={f} size="small" color="error" sx={{ mr: 0.5 }} />)
                      : <Chip label="None" size="small" variant="outlined" />
                    }
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEditClick(admin)} color="primary"><Edit /></IconButton>
                    <IconButton onClick={() => window.confirm('Delete this admin?') && deleteMutation.mutate(admin._id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && !isLoading && (
                <TableRow><TableCell colSpan={5} align="center">No admins found in the system.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* Feature Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Manage Features for {editAdmin?.restaurantId?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>Toggle features on or off for this admin:</Typography>
          <FormGroup>
            {allFeatures.map(f => (
              <FormControlLabel 
                key={f} 
                control={<Switch checked={!disabledFeats.includes(f)} onChange={() => toggleFeature(f)} />} 
                label={<Typography sx={{ textTransform: 'capitalize' }}>{f}</Typography>} 
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveFeatures}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default SuperAdminDashboard;
