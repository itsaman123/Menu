import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const SA_NAV = [
  { label: 'Dashboard', icon: 'dashboard', active: true },
  { label: 'Restaurants', icon: 'restaurant' },
  { label: 'Subscriptions', icon: 'payments' },
  { label: 'Analytics', icon: 'analytics' },
  { label: 'Users', icon: 'group' },
  { label: 'Tickets', icon: 'support_agent' },
];

function formatRevenue(n) {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000)    return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${n.toFixed(0)}`;
}

export default function SuperAdminDashboard() {
  const T = useTokens();
  const navigate = useNavigate();

  const [stats, setStats]           = useState(null);
  const [admins, setAdmins]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, adminsRes] = await Promise.all([
        api.get('/api/superadmin/stats'),
        api.get('/api/superadmin/admins'),
      ]);
      setStats(statsRes.data);
      setAdmins(adminsRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this admin and restaurant permanently?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/superadmin/admins/${id}`);
      setAdmins(prev => prev.filter(a => a._id !== id));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(admin) {
    setTogglingId(admin._id);
    try {
      const { data } = await api.put(`/api/superadmin/admins/${admin._id}`, { isActive: !admin.isActive });
      setAdmins(prev => prev.map(a => a._id === data._id ? data : a));
    } catch {
      // silent
    } finally {
      setTogglingId(null);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('saToken');
    navigate('/superadmin-login');
  };
  const CHART_BARS = [
    { label: 'Jan', h: '40%', primary: true },
    { label: 'Feb', h: '28%' },
    { label: 'Mar', h: '35%' },
    { label: 'Apr', h: '50%' },
    { label: 'May', h: '42%' },
    { label: 'Jun', h: '60%' },
  ];
  

  const STAT_CARDS = stats ? [
    { label: 'Total Restaurants', value: String(stats.totalAdmins), icon: 'storefront',    sub: `${stats.activeAdmins} active` },
    { label: 'Total Orders',      value: stats.totalOrders >= 1000 ? `${(stats.totalOrders/1000).toFixed(1)}k` : String(stats.totalOrders), icon: 'shopping_bag', sub: 'all time' },
    { label: 'Platform Revenue',  value: formatRevenue(stats.totalRevenue), icon: 'payments',      sub: 'all time' },
    { label: 'Active Accounts',   value: String(stats.activeAdmins), icon: 'verified_user', sub: `${stats.totalAdmins > 0 ? Math.round(stats.activeAdmins/stats.totalAdmins*100) : 0}% retention` },
  ] : [];

  return (
    <Box sx={{ display: 'flex', bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text }}>

      {/* ─── Top Nav ─── */}
      <Box component="nav" sx={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, height: 64,
        bgcolor: T.navBg, backdropFilter: 'blur(24px)', boxShadow: T.shadowHov,
      }}>
        <Typography sx={{
          fontSize: '1.25rem', fontWeight: 900,
          background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)',
          WebkitBackgroundClip: 'text', color: 'transparent',
        }}>
          The Curated Canvas
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Search */}
          <Box sx={{
            display: { xs: 'none', md: 'flex' }, alignItems: 'center',
            bgcolor: T.surfaceAlt, px: 2, py: 1, borderRadius: '9999px', border: `1px solid ${T.border}`,
          }}>
            <span className="material-symbols-outlined" style={{ color: T.textMuted, fontSize: 14, marginRight: 8 }}>search</span>
            <Box component="input" type="text" placeholder="Search accounts..."
              sx={{
                bgcolor: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem',
                color: T.text, width: 256, fontFamily: 'Inter, sans-serif',
                '&::placeholder': { color: T.textMuted },
              }}
            />
          </Box>
          {/* Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {['notifications', 'settings'].map(icon => (
              <Box component="button" key={icon} sx={{
                p: 1, borderRadius: '50%', color: T.textSub, border: 'none', cursor: 'pointer',
                bgcolor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                '&:hover': { bgcolor: T.surfaceHigh },
              }}>
                <span className="material-symbols-outlined">{icon}</span>
              </Box>
            ))}
            <Box sx={{
              width: 40, height: 40, borderRadius: '50%', bgcolor: '#6c5ce7', overflow: 'hidden',
              border: '2px solid #fff', ml: 1,
            }}>
              <Box component="img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5YsqfEBXRF2660OPdHLkP9NJTIN8ST_YD917kBUZaAfwYItA8UjRTUleS_PoZ_1JukbfimU_sRTbzrwNT4exFRXb4ZUIn3GjkW3J-x1QaZyHp4IWKhT4355jUr198Ha_RXI8CI36gDXlfMbq1LTlpAlVUwpP0PnO_jedD8M8ZJCz9DM2Ts8-Z13w8kA4zJOsU1jszfa1fWJ7xfKjLCTpjS3X53xQLbPf9Wfl9zjoNS4qk6NKV42PVxr582lrwhdX5D9fOPr1dm0w"
                alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ─── Side Nav ─── */}
      <Box component="aside" sx={{
        position: 'fixed', left: 0, top: 0, height: '100vh',
        display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        p: 2, pt: 10, gap: 1, bgcolor: T.bg, width: 256,
        borderRadius: '0 1.5rem 1.5rem 0', zIndex: 40,
      }}>
        <Box sx={{ mb: 4, px: 2 }}>
          <Typography sx={{ fontWeight: 900, color: '#4338ca', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '-0.025em' }}>SaaS Admin</Typography>
          <Typography sx={{ color: T.textMuted, fontSize: '0.75rem', fontWeight: 500 }}>Management Portal</Typography>
        </Box>

        <Box component="nav" sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {SA_NAV.map(item => (
            <Box component="a" href="#" key={item.label} sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5,
              borderRadius: '9999px', textDecoration: 'none', transition: 'all 0.3s',
              color: item.active ? '#4f46e5' : T.textMuted, fontWeight: item.active ? 700 : 500,
              bgcolor: item.active ? T.surface : 'transparent',
              boxShadow: item.active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              '&:hover': { color: '#6366f1', bgcolor: item.active ? T.surface : '#eef2ff' },
            }}>
              <span className="material-symbols-outlined" style={item.active ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 'inherit' }}>{item.label}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 'auto', px: 2, py: 3, borderTop: `1px solid ${T.border}` }}>
          <Box component="button" sx={{
            width: '100%', background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)',
            color: '#fff', py: 1.5, borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem',
            boxShadow: '0 10px 15px -3px rgba(199,210,254,1)', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', mb: 2, '&:active': { transform: 'scale(0.95)' },
          }}>New Restaurant</Box>
          <Box component="a" href="#" onClick={handleLogout} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, color: T.textMuted,
            textDecoration: 'none', '&:hover': { color: '#ba1a1a' },
          }}>
            <span className="material-symbols-outlined">logout</span>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Logout</Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── Main ─── */}
      <Box component="main" sx={{ ml: { md: '256px' }, pt: 12, pb: 6, px: 4, minHeight: '100vh', width: '100%' }}>

        {/* Header */}
        <Box component="header" sx={{ mb: 5 }}>
          <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 900, color: T.text, mb: 0.5, letterSpacing: '-0.025em' }}>Platform Overview</Typography>
          <Typography sx={{ color: T.textSub, fontWeight: 500 }}>
            {loading ? 'Loading platform data…' : `Monitoring growth across ${stats?.totalAdmins ?? 0} partner locations.`}
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 5 }}>
          {loading ? (
            <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#5341cd' }} />
            </Box>
          ) : STAT_CARDS.map(stat => (
            <Box key={stat.label} sx={{
              bgcolor: T.surface, p: 3, borderRadius: '0.5rem', position: 'relative',
              overflow: 'hidden', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.02)' },
            }}>
              <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, opacity: 0.1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 60, color: '#5341cd' }}>{stat.icon}</span>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, fontWeight: 700, mb: 1 }}>{stat.label}</Typography>
              <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: T.text }}>{stat.value}</Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: '#006c49', fontSize: '0.875rem', fontWeight: 700 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4 }}>info</span>
                {stat.sub}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Chart + Promo */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4, mb: 5 }}>
          {/* Chart */}
          <Box sx={{ bgcolor: T.surface, p: 4, borderRadius: '0.5rem' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, color: T.text }}>Monthly Revenue Growth</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: T.textSub }}>Performance across fiscal year 2024</Typography>
              </Box>
              <Box component="select" sx={{
                bgcolor: T.surfaceAlt, border: 'none', borderRadius: '9999px', px: 2, py: 1,
                fontSize: '0.875rem', fontWeight: 500, color: T.text, outline: 'none',
                fontFamily: 'Inter, sans-serif',
              }}>
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </Box>
            </Box>
            <Box sx={{ height: 256, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
              {CHART_BARS.map(bar => (
                <Box key={bar.label} sx={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  '&:hover .bar': { bgcolor: bar.primary ? '#6c5ce7' : 'rgba(83,65,205,0.2)' },
                }}>
                  <Box className="bar" sx={{
                    width: '100%', bgcolor: bar.primary ? '#5341cd' : '#dee9fc',
                    borderRadius: '0.5rem 0.5rem 0 0', height: bar.h, transition: 'background-color 0.3s',
                    boxShadow: bar.primary ? '0 10px 15px -3px rgba(199,210,254,1)' : 'none',
                  }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: bar.primary ? '#5341cd' : T.textSub, mt: 1.5 }}>{bar.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Promo */}
          <Box sx={{
            background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)', p: 4, borderRadius: '0.5rem',
            color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <Box sx={{ position: 'relative', zIndex: 10 }}>
              <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 900, mb: 1 }}>Upgrade Engine</Typography>
              <Typography sx={{ color: 'rgba(250,246,255,0.8)', fontSize: '0.875rem', mb: 3 }}>Automated campaigns for Starter plan users are ready to launch.</Typography>
              <Box component="button" sx={{
                bgcolor: '#fff', color: '#5341cd', fontWeight: 700, px: 3, py: 1.5,
                borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)' },
              }}>Launch Campaign</Box>
            </Box>
            <Box sx={{ position: 'absolute', bottom: -32, right: -32, opacity: 0.2, transform: 'rotate(12deg)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 120 }}>rocket_launch</span>
            </Box>
          </Box>
        </Box>

        {/* Restaurants Table */}
        <Box component="section" sx={{ bgcolor: T.surface, borderRadius: '0.5rem', overflow: 'hidden' }}>
          <Box sx={{ p: 4, borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, color: T.text }}>Recently Joined Restaurants</Typography>
            <Box component="button" sx={{
              color: '#5341cd', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center',
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              '&:hover': { textDecoration: 'underline' },
            }}>
              View All Restaurants
              <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 4 }}>arrow_forward</span>
            </Box>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#5341cd' }} />
            </Box>
          ) : admins.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Typography sx={{ color: T.textSub }}>No restaurants registered yet.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: T.surfaceAlt }}>
                    {['Restaurant', 'Admin Email', 'Status', 'Joined', 'Actions'].map((h, i) => (
                      <TableCell key={h} align={i === 4 ? 'center' : 'left'} sx={{
                        py: 2, px: { xs: 2, md: 4 }, color: T.textSub, fontSize: '10px',
                        textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, borderBottom: 'none',
                      }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.map(row => {
                    const restaurant = row.restaurantId;
                    const isActive   = row.isActive !== false;
                    const initials   = (restaurant?.name || row.email || '?')[0].toUpperCase();
                    const joinedDate = new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                    const isDeleting = deletingId === row._id;
                    const isToggling = togglingId === row._id;
                    return (
                      <TableRow key={row._id} sx={{ '&:hover': { bgcolor: 'rgba(239,244,255,0.5)' }, transition: 'background-color 0.2s' }}>
                        {/* Restaurant */}
                        <TableCell sx={{ px: { xs: 2, md: 4 }, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                              width: 40, height: 40, borderRadius: 1, bgcolor: T.accentDim, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 900, color: '#5341cd', fontSize: '1rem',
                            }}>
                              {initials}
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem' }}>
                                {restaurant?.name || '—'}
                              </Typography>
                              {restaurant?.slug && (
                                <Typography sx={{ fontSize: '0.7rem', color: T.textMuted }}>/{restaurant.slug}</Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Admin email */}
                        <TableCell sx={{ px: { xs: 2, md: 4 }, py: 2.5, borderBottom: `1px solid ${T.border}`, color: T.textSub, fontWeight: 500, fontSize: '0.875rem' }}>
                          {row.email}
                        </TableCell>

                        {/* Status + toggle */}
                        <TableCell sx={{ px: { xs: 2, md: 4 }, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                            onClick={() => !isToggling && handleToggleActive(row)}
                          >
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isActive ? '#006c49' : '#884800', flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: isActive ? '#006c49' : '#884800' }}>
                              {isToggling ? '…' : (isActive ? 'Active' : 'Disabled')}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Date */}
                        <TableCell sx={{ px: { xs: 2, md: 4 }, py: 2.5, borderBottom: `1px solid ${T.border}`, color: T.textSub, fontWeight: 500, fontSize: '0.875rem' }}>
                          {joinedDate}
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="center" sx={{ px: { xs: 2, md: 4 }, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                          <Box component="button" onClick={() => !isDeleting && handleDelete(row._id)} sx={{
                            p: 1, color: isDeleting ? T.textMuted : T.textMuted, background: 'none', border: 'none',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto',
                            '&:hover': { color: '#ba1a1a' }, transition: 'color 0.15s',
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                              {isDeleting ? 'hourglass_empty' : 'delete'}
                            </span>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
}
