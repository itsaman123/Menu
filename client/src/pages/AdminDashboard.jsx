import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import logo from '../assets/logo.png';
import { motion } from 'framer-motion';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { scaleUp, staggerContainer, scrollViewport } from '../hooks/useScrollAnimation';
import MenuManagementView from './MenuManagementView';
import LiveOrdersView from './LiveOrdersView';
import EmployeeManagementView from './EmployeeManagementView';
import QRGeneratorView from './QRGeneratorView';
import api from '../api';

const M = motion.create(Box);

const NAV_ITEMS = [
  { label: 'Dashboard',           icon: 'dashboard' },
  { label: 'Menu Management',     icon: 'restaurant_menu' },
  { label: 'Live Orders',         icon: 'reorder' },
  { label: 'Employee Management', icon: 'badge' },
  { label: 'QR Generator',        icon: 'qr_code' },
  { label: 'Analytics',           icon: 'insights' },
  { label: 'Settings',            icon: 'settings' },
];

// Maps mobile bottom-nav buttons to sidebar nav labels
const MOBILE_NAV = [
  { icon: 'home',           label: 'Home',     navKey: 'Dashboard' },
  { icon: 'menu_book',      label: 'Menu',     navKey: 'Menu Management' },
  { icon: 'receipt_long',   label: 'Orders',   navKey: 'Live Orders' },
  { icon: 'badge',          label: 'Staff',    navKey: 'Employee Management' },
];

const STATUS_STYLE = {
  pending:   { bg: '#ffdcc3', color: '#2f1500' },
  confirmed: { bg: '#dbeafe', color: '#1e40af' },
  preparing: { bg: '#6cf8bb', color: '#00714d' },
  completed: { bg: '#ffedd5', color: '#f97316' },
  cancelled: { bg: '#ffd6d6', color: '#ba1a1a' },
};

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

const GA_ID_RE = /^(G-|UA-|AW-)[A-Z0-9-]+$/i;

function AnalyticsView() {
  const T = useTokens();
  const [otpStats, setOtpStats]     = useState(null);
  const [gaId, setGaId]             = useState('');
  const [gaInput, setGaInput]       = useState('');
  const [loadingOtp, setLoadingOtp] = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/otp/stats'),
      api.get('/auth/restaurant-settings'),
    ]).then(([otpRes, settingsRes]) => {
      setOtpStats(otpRes.data);
      setGaId(settingsRes.data.gaTrackingId || '');
      setGaInput(settingsRes.data.gaTrackingId || '');
    }).catch(() => {}).finally(() => setLoadingOtp(false));
  }, []);

  const saveGa = async () => {
    if (gaInput && !GA_ID_RE.test(gaInput)) {
      return setSaveMsg('Invalid ID format. Use G-XXXXXXXX, UA-XXXXX-X, or AW-XXXXXXXXX');
    }
    setSaving(true); setSaveMsg('');
    try {
      const { data } = await api.put('/auth/restaurant-settings', { gaTrackingId: gaInput.trim() });
      setGaId(data.gaTrackingId);
      setSaveMsg('Saved!');
    } catch (err) {
      setSaveMsg(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const OTP_CARDS = otpStats ? [
    { label: 'Total OTPs Sent',      value: otpStats.totalSent,     icon: 'send',         color: '#f97316' },
    { label: 'Total Verified',        value: otpStats.totalVerified, icon: 'verified',     color: '#006c49' },
    { label: 'Sent (Last 30 Days)',   value: otpStats.last30Days,    icon: 'calendar_month', color: '#884800' },
    { label: 'Conversion Rate',
      value: otpStats.totalSent > 0
        ? `${Math.round(otpStats.totalVerified / otpStats.totalSent * 100)}%`
        : '—',
      icon: 'percent', color: '#00558b' },
  ] : [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 900, letterSpacing: '-0.05em', color: T.text }}>
          Analytics
        </Typography>
        <Typography sx={{ color: T.textSub, fontWeight: 500, mt: 0.5 }}>
          OTP usage and Google Analytics configuration for your restaurant.
        </Typography>
      </Box>

      {/* OTP Stats */}
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, mb: 2 }}>
        OTP Usage
      </Typography>
      {loadingOtp ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#f97316' }} />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 6 }}>
          {OTP_CARDS.map(card => (
            <Box key={card.label} sx={{
              bgcolor: T.surface, p: 3, borderRadius: '0.75rem', boxShadow: T.shadowHov,
              position: 'relative', overflow: 'hidden',
            }}>
              <Box sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.08 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 64, color: card.color }}>{card.icon}</span>
              </Box>
              <span className="material-symbols-outlined" style={{ color: card.color, fontSize: 28, display: 'block', marginBottom: 12 }}>{card.icon}</span>
              <Typography sx={{ color: T.textSub, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>
                {card.label}
              </Typography>
              <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: T.text, letterSpacing: '-0.05em' }}>
                {card.value}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Google Analytics Config */}
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, mb: 2 }}>
        Google Analytics
      </Typography>
      <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 4, boxShadow: T.shadowHov, maxWidth: 560 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: 28 }}>analytics</span>
          <Box>
            <Typography sx={{ fontWeight: 800, color: T.text }}>Measurement ID</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>Paste your GA4 Measurement ID to track menu traffic per restaurant.</Typography>
          </Box>
        </Box>

        {gaId && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 2, py: 1, bgcolor: '#e6f4ea', borderRadius: '9999px', width: 'fit-content' }}>
            <span className="material-symbols-outlined" style={{ color: '#006c49', fontSize: 14 }}>check_circle</span>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#006c49' }}>Active: {gaId}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Box component="input"
            type="text"
            value={gaInput}
            onChange={e => { setGaInput(e.target.value); setSaveMsg(''); }}
            placeholder="e.g. G-XXXXXXXXXX"
            sx={{
              flex: 1, minWidth: 200, height: 48, px: 3, borderRadius: '0.75rem',
              bgcolor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, outline: 'none',
              fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 500,
              '&:focus': { borderColor: '#f97316', boxShadow: '0 0 0 2px rgba(249,115,22,0.15)' },
              '&::placeholder': { color: T.textMuted },
            }}
          />
          <Box component="button" onClick={saveGa} disabled={saving}
            sx={{
              height: 48, px: 3, background: 'linear-gradient(to bottom right, #f97316, #ea580c)',
              color: '#fff', fontWeight: 700, borderRadius: '0.75rem', border: 'none',
              cursor: saving ? 'wait' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
              whiteSpace: 'nowrap', '&:hover': { opacity: 0.9 }, '&:disabled': { opacity: 0.6 },
            }}>
            {saving ? 'Saving…' : 'Save'}
          </Box>
        </Box>

        {saveMsg && (
          <Typography sx={{
            mt: 1.5, fontSize: '0.8rem', fontWeight: 600,
            color: saveMsg === 'Saved!' ? '#006c49' : '#ba1a1a',
          }}>
            {saveMsg}
          </Typography>
        )}

        <Typography sx={{ mt: 2, fontSize: '0.75rem', color: T.textMuted, lineHeight: 1.6 }}>
          The GA script is injected automatically in your public menu page when a valid ID is set. Leave blank to disable tracking.
        </Typography>
      </Box>
    </Box>
  );
}

function SettingsView({ adminEmail, restaurantName, slug }) {
  const T = useTokens();
  const navigate = useNavigate();
  const [gaId, setGaId]         = useState('');
  const [gaInput, setGaInput]   = useState('');
  const [gaMsg, setGaMsg]       = useState('');
  const [gaSaving, setGaSaving] = useState(false);
  const [pw, setPw]             = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg]       = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/restaurant-settings').then(r => {
      setGaId(r.data.gaTrackingId || '');
      setGaInput(r.data.gaTrackingId || '');
    }).catch(() => {});
  }, []);

  const saveGa = async () => {
    if (gaInput && !GA_ID_RE.test(gaInput)) return setGaMsg('Invalid format — use G-XXXXXXXX, UA-XXXXX-X or AW-XXXXXXXXX');
    setGaSaving(true); setGaMsg('');
    try {
      const { data } = await api.put('/auth/restaurant-settings', { gaTrackingId: gaInput.trim() });
      setGaId(data.gaTrackingId); setGaMsg('Saved!');
    } catch (err) { setGaMsg(err.response?.data?.message || 'Failed to save'); }
    finally { setGaSaving(false); }
  };

  const changePw = async () => {
    if (!pw.current) return setPwMsg('Enter your current password');
    if (pw.next.length < 6) return setPwMsg('New password must be at least 6 characters');
    if (pw.next !== pw.confirm) return setPwMsg('Passwords do not match');
    setPwSaving(true); setPwMsg('');
    try {
      await api.put('/auth/change-password', { currentPassword: pw.current, newPassword: pw.next });
      setPwMsg('Password changed! Please log in again.');
      setTimeout(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }, 1800);
    } catch (err) { setPwMsg(err.response?.data?.message || 'Failed to change password'); }
    finally { setPwSaving(false); }
  };

  return (
    <Box>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 900, letterSpacing: '-0.05em', color: T.text }}>Settings</Typography>
        <Typography sx={{ color: T.textSub, fontWeight: 500, mt: 0.5 }}>Manage your restaurant account and integrations.</Typography>
      </Box>

      {/* Restaurant Info */}
      <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 4, mb: 4, boxShadow: T.shadow }}>
        <Typography sx={{ fontWeight: 800, color: T.text, mb: 3, fontSize: '1rem' }}>Restaurant Info</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[{ label: 'Restaurant Name', value: restaurantName }, { label: 'Admin Email', value: adminEmail }, { label: 'Menu URL', value: slug ? `${window.location.origin}/menu/${slug}` : '—' }].map(row => (
            <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: `1px solid ${T.surfaceHigh}` }}>
              <Typography sx={{ fontSize: '0.875rem', color: T.textSub, fontWeight: 600 }}>{row.label}</Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: T.text, fontFamily: row.label === 'Menu URL' ? 'monospace' : 'inherit' }}>{row.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Change Password */}
      <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 4, mb: 4, boxShadow: T.shadow, maxWidth: 520 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: 24 }}>lock</span>
          <Box>
            <Typography sx={{ fontWeight: 800, color: T.text }}>Change Password</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>You will be logged out after changing.</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[{ key: 'current', label: 'Current Password' }, { key: 'next', label: 'New Password' }, { key: 'confirm', label: 'Confirm New Password' }].map(f => (
            <Box key={f.key}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{f.label}</Typography>
              <Box component="input" type="password" value={pw[f.key]} onChange={e => setPw(p => ({ ...p, [f.key]: e.target.value }))} sx={{ width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text, outline: 'none', boxSizing: 'border-box', '&:focus': { borderColor: '#f97316' } }} />
            </Box>
          ))}
          {pwMsg && <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: pwMsg.includes('changed') ? '#006c49' : '#ba1a1a' }}>{pwMsg}</Typography>}
          <Box component="button" onClick={changePw} disabled={pwSaving} sx={{ py: 1.5, px: 3, border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', borderRadius: '0.5rem', cursor: pwSaving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem', opacity: pwSaving ? 0.7 : 1, alignSelf: 'flex-start' }}>
            {pwSaving ? 'Changing…' : 'Change Password'}
          </Box>
        </Box>
      </Box>

      {/* Google Analytics */}
      <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 4, boxShadow: T.shadow, maxWidth: 520 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: 24 }}>analytics</span>
          <Box>
            <Typography sx={{ fontWeight: 800, color: T.text }}>Google Analytics</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>Track your menu page visitors with GA4.</Typography>
          </Box>
        </Box>
        {gaId && <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2, px: 2, py: 0.75, bgcolor: 'rgba(0,108,73,0.1)', borderRadius: '9999px' }}><span className="material-symbols-outlined" style={{ color: '#006c49', fontSize: 14 }}>check_circle</span><Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#006c49' }}>Active: {gaId}</Typography></Box>}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Box component="input" type="text" value={gaInput} onChange={e => { setGaInput(e.target.value); setGaMsg(''); }} placeholder="e.g. G-XXXXXXXXXX" sx={{ flex: 1, minWidth: 200, height: 48, px: 3, borderRadius: '0.75rem', bgcolor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', '&:focus': { borderColor: '#f97316' }, '&::placeholder': { color: T.textMuted } }} />
          <Box component="button" onClick={saveGa} disabled={gaSaving} sx={{ height: 48, px: 3, background: 'linear-gradient(to bottom right,#f97316,#ea580c)', color: '#fff', fontWeight: 700, borderRadius: '0.75rem', border: 'none', cursor: gaSaving ? 'wait' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', opacity: gaSaving ? 0.6 : 1 }}>{gaSaving ? 'Saving…' : 'Save'}</Box>
        </Box>
        {gaMsg && <Typography sx={{ mt: 1.5, fontSize: '0.8rem', fontWeight: 600, color: gaMsg === 'Saved!' ? '#006c49' : '#ba1a1a' }}>{gaMsg}</Typography>}
      </Box>
    </Box>
  );
}

export default function AdminDashboard() {
  const T = useTokens();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [adminInfo, setAdminInfo] = useState(getUser());

  // Verify token + isActive on mount — disabled admins get kicked out immediately
  useEffect(() => {
    api.get('/auth/me').then(r => {
      setAdminInfo(r.data);
      localStorage.setItem('user', JSON.stringify(r.data));
    }).catch(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const restaurantName = adminInfo.restaurantName || 'Your Restaurant';
  const adminEmail     = adminInfo.email || '';
  const menuUrl        = adminInfo.slug ? `${window.location.origin}/menu/${adminInfo.slug}` : null;

  /* ── Dashboard stats ── */
  const [orders, setOrders]     = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    if (activeNav !== 'Dashboard') return;
    try {
      setLoadingStats(true);
      const [ordRes, menuRes] = await Promise.all([
        api.get('/api/orders/restaurant'),
        api.get('/api/menu-items'),
      ]);
      setOrders(ordRes.data);
      setMenuItems(menuRes.data);
    } catch {
      // silent
    } finally {
      setLoadingStats(false);
    }
  }, [activeNav]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  /* ── Derived stats ── */
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayOrders  = orders.filter(o => new Date(o.createdAt) >= todayStart);
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const activeItems  = menuItems.filter(i => i.isAvailable).length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <Box sx={{ display: 'flex', bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text }}>

      {/* ─── Sidebar ─── */}
      <M
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        component="aside"
        sx={{
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
          py: 4, px: 2, gap: 1, height: '100vh', width: 256,
          position: 'fixed', left: 0, top: 0, bgcolor: T.bg, zIndex: 40,
          overflowY: 'auto',
        }}
      >
        <Box sx={{ px: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box component="img" src={logo} alt="ScanIt" sx={{ height: 28, width: 'auto' }} />
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: T.text }}>ScanIt</Typography>
          </Box>
          <Typography sx={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, fontWeight: 700 }}>
            Premium Dining Admin
          </Typography>
        </Box>

        <Box component="nav" sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {NAV_ITEMS.map(item => (
            <Box
              component="a"
              href="#"
              key={item.label}
              onClick={e => { e.preventDefault(); setActiveNav(item.label); }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, px: 2,
                borderRadius: '9999px', textDecoration: 'none', transition: 'all 0.2s', mx: 1,
                bgcolor: activeNav === item.label ? T.surface : 'transparent',
                color:   activeNav === item.label ? T.accent  : T.textSub,
                boxShadow: activeNav === item.label ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                '&:hover': { bgcolor: activeNav === item.label ? T.surface : 'rgba(255,255,255,0.5)' },
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Storage */}
        <Box sx={{ px: 2, py: 3, bgcolor: '#fff7ed', borderRadius: '0.5rem', mx: 1, mb: 3 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: T.textSub, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Storage Used
          </Typography>
          <Box sx={{ height: 8, width: '100%', bgcolor: '#fed7aa', borderRadius: '9999px', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', bgcolor: '#f97316', width: '75%' }} />
          </Box>
          <Box component="button" sx={{
            mt: 2, width: '100%', py: 1, bgcolor: '#ea580c', color: '#fff7ed',
            fontSize: '0.75rem', fontWeight: 700, borderRadius: '9999px', border: 'none',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            '&:active': { transform: 'scale(0.95)' },
          }}>
            Upgrade Plan
          </Box>
        </Box>

        {/* Logout */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Box component="button" onClick={handleLogout} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 2, width: '100%',
            borderRadius: '9999px', border: 'none', bgcolor: 'transparent', cursor: 'pointer',
            color: T.textSub, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            '&:hover': { color: '#ba1a1a', bgcolor: 'rgba(186,26,26,0.06)' },
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Logout
            </Typography>
          </Box>
        </Box>
      </M>

      {/* ─── Main Content ─── */}
      <Box
        component="main"
        sx={{
          ml: { md: '256px' }, minHeight: '100vh',
          pb: { xs: 14, md: 6 }, px: { xs: 3, xl: 6 }, pt: 4,
          width: '100%', maxWidth: { md: 'calc(100% - 256px)', xl: 1280 },
        }}
      >
        {/* ── Dashboard ── */}
        {activeNav === 'Dashboard' && (
          <Box>
            {/* Header */}
            <M
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              component="header"
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5, flexWrap: 'wrap', gap: 2 }}
            >
              <Box>
                <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 900, letterSpacing: '-0.05em', color: T.text }}>
                  Dashboard
                </Typography>
                <Typography sx={{ color: T.textSub, fontWeight: 500, mt: 0.5 }}>
                  Welcome back — <strong>{restaurantName}</strong>
                </Typography>
                {menuUrl && (
                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Box
                      component="a"
                      href={menuUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.75,
                        px: 2, py: 0.75, bgcolor: 'rgba(249,115,22,0.08)', borderRadius: '9999px',
                        color: '#f97316', fontWeight: 600, fontSize: '0.8rem',
                        textDecoration: 'none', fontFamily: 'monospace',
                        transition: 'background-color 0.2s',
                        '&:hover': { bgcolor: 'rgba(249,115,22,0.15)' },
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>link</span>
                      {menuUrl}
                      <span className="material-symbols-outlined" style={{ fontSize: 12, opacity: 0.6 }}>open_in_new</span>
                    </Box>
                    <Box
                      component="button"
                      onClick={() => setActiveNav('QR Generator')}
                      sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.5,
                        px: 2, py: 0.75, bgcolor: T.surfaceAlt, border: 'none', borderRadius: '9999px',
                        color: T.textSub, fontWeight: 700, fontSize: '0.75rem',
                        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s', '&:hover': { bgcolor: '#f97316', color: '#fff' },
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>qr_code</span>
                      Get QR Codes
                    </Box>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box component="button" sx={{
                  p: 1.5, bgcolor: T.surfaceAlt, borderRadius: '50%', color: T.textSub,
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  '&:hover': { bgcolor: T.surfaceHigh },
                }}>
                  <span className="material-symbols-outlined">notifications</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: T.surfaceAlt, pl: 1, pr: 2, py: 1, borderRadius: '9999px' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
                    {adminEmail ? adminEmail[0].toUpperCase() : 'A'}
                  </Box>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: T.text, lineHeight: 1 }}>{adminEmail}</Typography>
                    <Typography sx={{ fontSize: '10px', color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin</Typography>
                  </Box>
                </Box>
              </Box>
            </M>

            {/* Stats Bento Grid */}
            <M
              variants={staggerContainer}
              initial="hidden" whileInView="visible" viewport={scrollViewport}
              component="section"
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 6 }}
            >
              <M variants={scaleUp} custom={0} sx={{ bgcolor: T.surface, p: 4, borderRadius: '0.5rem', boxShadow: T.shadowHov, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'relative', zIndex: 10 }}>
                  <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: 32, display: 'block', marginBottom: 16 }}>shopping_bag</span>
                  <Typography sx={{ color: T.textSub, fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>Total Orders Today</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: T.text, letterSpacing: '-0.05em' }}>
                      {loadingStats ? '—' : todayOrders.length}
                    </Typography>
                    <Typography sx={{ color: T.textMuted, fontSize: '0.875rem', fontWeight: 500 }}>today</Typography>
                  </Box>
                </Box>
                <Box sx={{ position: 'absolute', right: -16, bottom: -16, opacity: 0.05 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 120 }}>trending_up</span>
                </Box>
              </M>

              <M variants={scaleUp} custom={1} sx={{
                background: 'linear-gradient(to bottom right, #f97316, #ea580c)', color: '#fff',
                p: 4, borderRadius: '0.5rem', boxShadow: '0px 20px 40px rgba(18,28,42,0.12)',
                position: 'relative', overflow: 'hidden',
              }}>
                <Box sx={{ position: 'relative', zIndex: 10 }}>
                  <span className="material-symbols-outlined" style={{ color: '#ffedd5', fontSize: 32, display: 'block', marginBottom: 16 }}>payments</span>
                  <Typography sx={{ color: 'rgba(255,237,213,0.8)', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>Revenue Today</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.05em' }}>
                      {loadingStats ? '—' : `₹${todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ position: 'absolute', right: 0, top: 0, width: 128, height: 128, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%', mr: '-4rem', mt: '-4rem', filter: 'blur(24px)' }} />
              </M>

              <M variants={scaleUp} custom={2} sx={{ bgcolor: T.surface, p: 4, borderRadius: '0.5rem', boxShadow: T.shadowHov }}>
                <span className="material-symbols-outlined" style={{ color: '#884800', fontSize: 32, display: 'block', marginBottom: 16 }}>restaurant</span>
                <Typography sx={{ color: T.textSub, fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>Active Menu Items</Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: T.text, letterSpacing: '-0.05em' }}>
                    {loadingStats ? '—' : activeItems}
                  </Typography>
                  <Typography sx={{ color: T.textMuted, fontSize: '0.875rem', fontWeight: 500 }}>/ {menuItems.length} Total</Typography>
                </Box>
              </M>
            </M>

            {/* Orders + Sidebar */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
              {/* Recent Orders */}
              <Box component="section">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: T.text }}>Recent Orders</Typography>
                  <Box component="button" onClick={() => setActiveNav('Live Orders')} sx={{ color: '#f97316', fontSize: '0.875rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', '&:hover': { textDecoration: 'underline' } }}>
                    View All
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentOrders.length === 0 && !loadingStats ? (
                    <Box sx={{ bgcolor: T.surface, p: 4, borderRadius: '0.5rem', textAlign: 'center' }}>
                      <Typography sx={{ color: T.textSub }}>No orders yet. Share your QR code to get started!</Typography>
                    </Box>
                  ) : recentOrders.map(order => {
                    const ss = STATUS_STYLE[order.status] || STATUS_STYLE.pending;
                    const initials = order.tableNumber
                      ? `T${order.tableNumber}`
                      : order.customerPhone?.slice(-2) || '??';
                    return (
                      <Box key={order._id} sx={{
                        bgcolor: T.surface, p: 3, borderRadius: '0.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'background-color 0.3s', '&:hover': { bgcolor: T.surfaceContainer },
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{
                            width: 48, height: 48, borderRadius: '50%', bgcolor: T.surfaceAlt, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: '#f97316', fontSize: '0.875rem',
                          }}>{initials}</Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: T.text }}>
                              {order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: T.textSub }}>
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''} • #{String(order._id).slice(-6).toUpperCase()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography sx={{ fontWeight: 700, color: T.text }}>
                            ₹{order.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </Typography>
                          <Box component="span" sx={{
                            display: 'inline-block', px: 1.5, py: 0.5, bgcolor: ss.bg,
                            color: ss.color, fontSize: '10px', fontWeight: 900,
                            textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '9999px', mt: 0.5,
                          }}>{order.status}</Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Right Bento */}
              <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Top Sellers */}
                <Box sx={{ bgcolor: '#fff7ed', p: 4, borderRadius: '0.5rem' }}>
                  <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em', color: T.text, mb: 3 }}>Top Sellers</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[
                      { category: 'Burger',  name: 'Crispy Paneer Burger',  orders: '42 orders today', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyWmlKBGBHb7FX96JdfJuVqfXLE_eBuiKamYDfcP5K0AcNZ8ds9SbkYDlPsu4hUPHUoDH2FiDcYMrmWdYu38fepEmocYH0bArNSGWCYmkOObCuG9KymNf85qx2mu1SUCeKixsYWT1tvsJ7ZTmJe0lq2zd17MWJ3m2Msasnm9n7Sgvlo3U3bzAKeWQRRb42gSdcDjrCh26Y8ntz1f71L60ba9Tzfal9D6U36GVPoRaG92pHXTeUqEZeWdsxKlcf9nMZ5smE6OWdpww' },
                      { category: 'Brunch',  name: 'Zesty Avocado Toast',    orders: '38 orders today', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARcYZ8_sNXq6_g0dbhAVs5t-jhT3wC5TJs-y7rhnXravMSXNJoms9acca2doGH0yi_VtT5gPj2z50evmO9Y97pWkUkflVXUHxYymF2RtTdAMzJIDUF_6lI1bo8vWmhTuDB1VX3VkuOqpv1v2_4QJj6iKnvMYUZL0cFNRDaSmGk6Vf9NM1Vk57oFxdX6uTIaPGDE9RvVp1YndRbeuAB2ykSK5F5Y3i-9f3gG8Hwl-dSwLv0CNhJonoQCihKihBe9x3LKaXYYH2Qx2g' },
                    ].map(item => (
                      <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 64, height: 64, borderRadius: '0.5rem', bgcolor: T.surface, overflow: 'hidden', flexShrink: 0 }}>
                          <Box component="img" src={item.img} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', mb: 0.5 }}>{item.category}</Typography>
                          <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem', lineHeight: 1.25 }}>{item.name}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: T.textSub, mt: 0.5 }}>{item.orders}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Promotions */}
                <Box sx={{ bgcolor: '#fff7ed', p: 4, borderRadius: '0.5rem', position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'relative', zIndex: 10 }}>
                    <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em', color: T.text, mb: 1 }}>Grow your reach</Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: T.textSub, mb: 3 }}>Create a new weekend special menu and boost sales by up to 20%.</Typography>
                    <Box component="button" sx={{
                      px: 3, py: 1.5, bgcolor: '#f97316', color: '#fff',
                      fontSize: '0.875rem', fontWeight: 700, borderRadius: '9999px', border: 'none',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      transition: 'box-shadow 0.3s', '&:hover': { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
                    }}>Create Promo</Box>
                  </Box>
                  <Box sx={{ position: 'absolute', right: -48, bottom: -48, width: 160, height: 160, bgcolor: 'rgba(249,115,22,0.1)', borderRadius: '50%', filter: 'blur(24px)' }} />
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {activeNav === 'Menu Management'     && <MenuManagementView />}
        {activeNav === 'Live Orders'         && <LiveOrdersView />}
        {activeNav === 'Employee Management' && <EmployeeManagementView />}
        {activeNav === 'QR Generator'        && <QRGeneratorView />}
        {activeNav === 'Analytics'           && <AnalyticsView />}
        {activeNav === 'Settings'            && <SettingsView adminEmail={adminEmail} restaurantName={restaurantName} slug={adminInfo.slug} />}
      </Box>

      {/* ─── Mobile Bottom Nav ─── */}
      <Box
        component="nav"
        sx={{
          display: { md: 'none' }, position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 50,
          bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)',
          borderRadius: '28px 28px 0 0', boxShadow: '0 -10px 30px rgba(18,28,42,0.08)',
          px: 2, pb: 3, pt: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
          {MOBILE_NAV.map(item => {
            const isActive = activeNav === item.navKey;
            return (
              <Box
                key={item.label}
                component="button"
                onClick={() => setActiveNav(item.navKey)}
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  ...(isActive
                    ? { background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', borderRadius: '9999px', px: 2, py: 1.25, mb: 0.5, transform: 'scale(1.08)' }
                    : { bgcolor: 'transparent', color: '#8c7a6a', p: 1 }
                  ),
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: isActive ? 22 : 24 }}>{item.icon}</span>
                <Typography sx={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', mt: 0.25 }}>
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
