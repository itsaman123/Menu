import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Button, Stack, Divider, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Switch, FormGroup, FormControlLabel, Chip, useMediaQuery, useTheme,
  Drawer, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Paper
} from '@mui/material';
import {
  Delete, Edit, Logout, AdminPanelSettings, People,
  Menu as MenuIcon, Close, Shield, Circle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const T = {
  bg: '#0f1117', surface: '#16191f', surfaceAlt: '#1d2129',
  border: 'rgba(255,255,255,0.07)',
  accent: '#7c6ef0', accentHov: '#9d91f7', accentDim: 'rgba(124,110,240,0.12)',
  green: '#22c55e', greenDim: 'rgba(34,197,94,0.12)',
  orange: '#f97316', orangeDim: 'rgba(249,115,22,0.12)',
  text: '#e8eaf0', textSub: '#8b8fa8', textMuted: '#4b5068',
  red: '#ef4444', redDim: 'rgba(239,68,68,0.12)',
};

const DRAWER_WIDTH = 240;

const sxCard = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: '14px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  overflow: 'hidden',
};

const btnFilled = {
  background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`,
  color: '#fff', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700,
  textTransform: 'none', px: 2, py: 0.9,
  boxShadow: `0 4px 14px rgba(124,110,240,0.35)`,
  '&:hover': { background: `linear-gradient(135deg, ${T.accentHov}, #b4a8fc)` },
};

const inputSx = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: T.accent },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: T.accent },
};

const dialogPaperSx = {
  background: T.surface, border: `1px solid ${T.border}`,
  borderRadius: '18px', color: T.text, minWidth: { xs: '90vw', sm: 400 },
};

const SuperAdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editAdmin, setEditAdmin] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [disabledFeats, setDisabledFeats] = useState([]);
  const saUser = JSON.parse(localStorage.getItem('saUser') || '{}');

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['superadmins'],
    queryFn: async () => (await api.get('/api/superadmin/admins')).data,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/superadmin/admins/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['superadmins'] }); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/superadmin/admins/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['superadmins'] }),
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
    setDisabledFeats(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]);
  };

  const saveFeatures = () => {
    updateMutation.mutate({ id: editAdmin._id, data: { disabledFeatures: disabledFeats } });
  };

  const toggleActive = (id, currentStatus) => {
    updateMutation.mutate({ id, data: { isActive: !currentStatus } });
  };

  const allFeatures = ['menu', 'orders', 'analytics', 'qr', 'reservations', 'themes'];

  const SidebarContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.surface, px: 2, py: 3 }}>
      {/* Brand */}
      <Box sx={{ px: 1, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: '10px',
            background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield sx={{ fontSize: 17, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '1rem', color: T.text }}>
            Super Admin
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.65rem', color: T.textMuted, pl: '46px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          System Control
        </Typography>
      </Box>

      <Typography sx={{ fontSize: '0.65rem', color: T.textMuted, px: 1, mb: 1, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
        Management
      </Typography>
      <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
        <Button startIcon={<People sx={{ fontSize: 17 }} />} sx={{
          justifyContent: 'flex-start', px: 1.5, py: 1, borderRadius: '10px',
          fontSize: '0.82rem', fontWeight: 700, textTransform: 'none',
          color: '#fff', background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`,
          boxShadow: `0 4px 14px rgba(124,110,240,0.35)`,
          '&:hover': { background: `linear-gradient(135deg, ${T.accentHov}, #b4a8fc)` },
        }}>
          Admins
        </Button>
        <Button startIcon={<AdminPanelSettings sx={{ fontSize: 17 }} />} sx={{
          justifyContent: 'flex-start', px: 1.5, py: 1, borderRadius: '10px',
          fontSize: '0.82rem', fontWeight: 500, textTransform: 'none',
          color: T.textSub,
          '&:hover': { background: T.accentDim, color: T.text },
        }}>
          System Logs
        </Button>
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Divider sx={{ borderColor: T.border, mb: 1.5 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1 }}>
          <Avatar sx={{ width: 32, height: 32, background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`, fontSize: '0.78rem', fontWeight: 700 }}>
            {(saUser?.email || 'S')[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {saUser?.email || 'Super Admin'}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: T.textMuted }}>System Admin</Typography>
          </Box>
          <IconButton size="small" onClick={logout} sx={{ color: T.textMuted, '&:hover': { color: T.red } }}>
            <Logout sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

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
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}
          PaperProps={{ sx: { width: DRAWER_WIDTH, background: T.surface, border: 'none' } }}>
          <SidebarContent />
        </Drawer>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile topbar */}
        {isMobile && (
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2, py: 1.5, borderBottom: `1px solid ${T.border}`,
            background: T.surface, position: 'sticky', top: 0, zIndex: 100,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '8px', background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield sx={{ fontSize: 15, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '0.95rem', color: T.text }}>Super Admin</Typography>
            </Box>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: T.textSub }}><MenuIcon /></IconButton>
          </Box>
        )}

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '1.4rem', color: T.text, lineHeight: 1.2 }}>
              System Administrators
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: T.textSub, mt: 0.5 }}>
              {admins.length} restaurants registered in the system
            </Typography>
          </Box>

          {/* Stats Row */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Admins', value: admins.length, color: T.accent, dim: T.accentDim },
              { label: 'Active', value: admins.filter(a => a.isActive !== false).length, color: T.green, dim: T.greenDim },
              { label: 'Suspended', value: admins.filter(a => a.isActive === false).length, color: T.red, dim: T.redDim },
            ].map(s => (
              <Box key={s.label} sx={{
                flex: '1 1 120px', background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: '12px', p: 2,
              }}>
                <Typography sx={{ fontSize: '0.68rem', color: T.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>{s.label}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: s.color, lineHeight: 1 }}>{s.value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Table Card */}
          <Paper elevation={0} sx={{ ...sxCard }}>
            {/* Desktop table */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-root': { background: T.surfaceAlt, color: T.textMuted, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${T.border}`, py: 1.5 } }}>
                    <TableCell>Restaurant</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Disabled Features</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.map(admin => (
                    <TableRow key={admin._id} sx={{ '& .MuiTableCell-root': { color: T.text, borderBottom: `1px solid ${T.border}`, py: 2 }, '&:last-child .MuiTableCell-root': { borderBottom: 'none' }, '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, background: T.accentDim, color: T.accent, fontSize: '0.78rem', fontWeight: 700 }}>
                            {(admin.restaurantId?.name || 'R')[0].toUpperCase()}
                          </Avatar>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: T.text }}>
                            {admin.restaurantId?.name || 'Unknown'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.83rem', color: T.textSub }}>{admin.email}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            checked={admin.isActive !== false}
                            onChange={() => toggleActive(admin._id, admin.isActive !== false)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: T.green },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: T.green },
                              '& .MuiSwitch-track': { backgroundColor: T.textMuted },
                            }}
                          />
                          <Box sx={{ px: 1.2, py: 0.4, borderRadius: '7px', background: admin.isActive !== false ? T.greenDim : T.redDim, display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <Circle sx={{ fontSize: 7, color: admin.isActive !== false ? T.green : T.red }} />
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: admin.isActive !== false ? T.green : T.red }}>
                              {admin.isActive !== false ? 'Active' : 'Suspended'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {admin.disabledFeatures?.length > 0
                          ? admin.disabledFeatures.map(f => (
                            <Chip key={f} label={f} size="small"
                              sx={{ mr: 0.5, mb: 0.3, height: 20, fontSize: '0.65rem', background: T.orangeDim, color: T.orange, fontWeight: 700 }} />
                          ))
                          : <Chip label="All enabled" size="small" sx={{ height: 20, fontSize: '0.65rem', background: T.greenDim, color: T.green, fontWeight: 700 }} />
                        }
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => handleEditClick(admin)}
                            sx={{ color: T.textSub, '&:hover': { color: T.accent, background: T.accentDim }, borderRadius: '8px' }}>
                            <Edit sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => window.confirm('Delete this admin?') && deleteMutation.mutate(admin._id)}
                            sx={{ color: T.textSub, '&:hover': { color: T.red, background: T.redDim }, borderRadius: '8px' }}>
                            <Delete sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {admins.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, color: T.textMuted, borderBottom: 'none' }}>
                        No administrators found in the system.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            {/* Mobile card list */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, p: 1.5 }}>
              {admins.length === 0 && !isLoading && (
                <Typography sx={{ textAlign: 'center', py: 4, color: T.textMuted, fontSize: '0.85rem' }}>
                  No administrators found.
                </Typography>
              )}
              <Stack spacing={1.5}>
                {admins.map(admin => (
                  <Box key={admin._id} sx={{ background: T.surfaceAlt, borderRadius: '12px', p: 2, border: `1px solid ${T.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, background: T.accentDim, color: T.accent, fontSize: '0.82rem', fontWeight: 800 }}>
                          {(admin.restaurantId?.name || 'R')[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.88rem' }}>
                            {admin.restaurantId?.name || 'Unknown'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.73rem', color: T.textSub }}>{admin.email}</Typography>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => handleEditClick(admin)}
                          sx={{ color: T.textSub, '&:hover': { color: T.accent, background: T.accentDim }, borderRadius: '8px' }}>
                          <Edit sx={{ fontSize: 15 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => window.confirm('Delete?') && deleteMutation.mutate(admin._id)}
                          sx={{ color: T.textSub, '&:hover': { color: T.red, background: T.redDim }, borderRadius: '8px' }}>
                          <Delete sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Stack>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch checked={admin.isActive !== false} onChange={() => toggleActive(admin._id, admin.isActive !== false)} size="small"
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: T.green }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: T.green } }} />
                        <Typography sx={{ fontSize: '0.75rem', color: admin.isActive !== false ? T.green : T.red, fontWeight: 600 }}>
                          {admin.isActive !== false ? 'Active' : 'Suspended'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {admin.disabledFeatures?.length > 0
                          ? admin.disabledFeatures.map(f => <Chip key={f} label={f} size="small" sx={{ height: 18, fontSize: '0.62rem', background: T.orangeDim, color: T.orange, fontWeight: 700 }} />)
                          : <Chip label="All enabled" size="small" sx={{ height: 18, fontSize: '0.62rem', background: T.greenDim, color: T.green, fontWeight: 700 }} />
                        }
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Feature Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={{ fontWeight: 700, color: T.text, fontSize: '1rem', pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Manage Features
          <IconButton size="small" onClick={() => setDialogOpen(false)} sx={{ color: T.textMuted }}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.8rem', color: T.textSub, mb: 2.5 }}>
            Toggle features on/off for <strong style={{ color: T.text }}>{editAdmin?.restaurantId?.name}</strong>
          </Typography>
          <FormGroup>
            {allFeatures.map(f => (
              <FormControlLabel
                key={f}
                control={
                  <Switch
                    checked={!disabledFeats.includes(f)}
                    onChange={() => toggleFeature(f)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: T.accent },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: T.accent },
                      '& .MuiSwitch-track': { backgroundColor: T.textMuted },
                    }}
                  />
                }
                label={<Typography sx={{ textTransform: 'capitalize', fontSize: '0.88rem', color: T.text }}>{f}</Typography>}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ border: `1px solid ${T.border}`, color: T.textSub, borderRadius: '10px', textTransform: 'none', '&:hover': { background: T.accentDim } }}>
            Cancel
          </Button>
          <Button onClick={saveFeatures} sx={{ ...btnFilled }}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminDashboard;
