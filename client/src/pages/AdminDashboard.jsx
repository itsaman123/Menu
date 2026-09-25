import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { StatCard } from '../components/StatCard';
import InventoryView from './InventoryView';
import BillingView from './BillingView';

function playOrderAlarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Three ascending dings: C5 → E5 → G5
    [[0, 523], [0.25, 659], [0.5, 784]].forEach(([delay, freq]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.45);
    });
    // Close context after sound finishes
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // AudioContext not supported — silent fail
  }
}

const M = motion.create(Box);

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard' },
  { label: 'Menu Management', icon: 'restaurant_menu' },
  { label: 'Live Orders', icon: 'reorder' },
  { label: 'Employee Management', icon: 'badge' },
  { label: 'Billing & Invoicing', icon: 'receipt' },
  { label: 'Inventory', icon: 'inventory_2' },
  { label: 'QR Generator', icon: 'qr_code' },
  { label: 'Analytics', icon: 'insights' },
  { label: 'Settings', icon: 'settings' },
];

// Maps mobile bottom-nav buttons to sidebar nav labels
const MOBILE_NAV = [
  { icon: 'home', label: 'Home', navKey: 'Dashboard' },
  { icon: 'menu_book', label: 'Menu', navKey: 'Menu Management' },
  { icon: 'receipt_long', label: 'Orders', navKey: 'Live Orders' },
  { icon: 'badge', label: 'Staff', navKey: 'Employee Management' },
];

const STATUS_STYLE = {
  pending: { bg: '#ffdcc3', color: '#2f1500' },
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
  const [otpStats, setOtpStats] = useState(null);
  const [gaId, setGaId] = useState('');
  const [gaInput, setGaInput] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/otp/stats'),
      api.get('/auth/restaurant-settings'),
    ]).then(([otpRes, settingsRes]) => {
      setOtpStats(otpRes.data);
      setGaId(settingsRes.data.gaTrackingId || '');
      setGaInput(settingsRes.data.gaTrackingId || '');
    }).catch(() => { }).finally(() => setLoadingOtp(false));
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
    { label: 'Total OTPs Sent', value: otpStats.totalSent, icon: 'send', color: '#f97316' },
    { label: 'Total Verified', value: otpStats.totalVerified, icon: 'verified', color: '#006c49' },
    { label: 'Sent (Last 30 Days)', value: otpStats.last30Days, icon: 'calendar_month', color: '#884800' },
    {
      label: 'Conversion Rate',
      value: otpStats.totalSent > 0
        ? `${Math.round(otpStats.totalVerified / otpStats.totalSent * 100)}%`
        : '—',
      icon: 'percent', color: '#00558b'
    },
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 6 }}>
          {OTP_CARDS.map(card => (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
              T={T}
            />
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
  const [gaId, setGaId] = useState('');
  const [gaInput, setGaInput] = useState('');
  const [gaMsg, setGaMsg] = useState('');
  const [gaSaving, setGaSaving] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstSaving, setGstSaving] = useState(false);
  const [gstRateInput, setGstRateInput] = useState('5');
  const [prepTimeInput, setPrepTimeInput] = useState('15-20 mins');
  const [orderMsg, setOrderMsg] = useState('');
  const [orderSaving, setOrderSaving] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverMsg, setCoverMsg] = useState('');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/restaurant-settings').then(r => {
      setGaId(r.data.gaTrackingId || '');
      setGaInput(r.data.gaTrackingId || '');
      setGstEnabled(r.data.gstEnabled !== false);
      setGstRateInput(String(r.data.gstRate ?? 5));
      setPrepTimeInput(r.data.estimatedPrepTime || '15-20 mins');
      setCoverImage(r.data.coverImage || '');
    }).catch(() => { });
  }, []);

  const saveOrderSettings = async () => {
    const rate = Number(gstRateInput);
    if (isNaN(rate) || rate < 0 || rate > 100) return setOrderMsg('GST rate must be between 0 and 100');
    if (!prepTimeInput.trim()) return setOrderMsg('Estimated prep time is required');
    setOrderSaving(true); setOrderMsg('');
    try {
      await api.put('/auth/restaurant-settings', { gstRate: rate, estimatedPrepTime: prepTimeInput.trim() });
      setOrderMsg('Saved!');
    } catch (err) { setOrderMsg(err.response?.data?.message || 'Failed to save'); }
    finally { setOrderSaving(false); }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true); setCoverMsg('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await api.put('/auth/restaurant-settings', { coverImage: data.imageUrl });
      setCoverImage(data.imageUrl);
    } catch {
      setCoverMsg('Cover image upload failed.');
    } finally { setCoverUploading(false); }
  };

  const saveGa = async () => {
    if (gaInput && !GA_ID_RE.test(gaInput)) return setGaMsg('Invalid format — use G-XXXXXXXX, UA-XXXXX-X or AW-XXXXXXXXX');
    setGaSaving(true); setGaMsg('');
    try {
      const { data } = await api.put('/auth/restaurant-settings', { gaTrackingId: gaInput.trim() });
      setGaId(data.gaTrackingId); setGaMsg('Saved!');
    } catch (err) { setGaMsg(err.response?.data?.message || 'Failed to save'); }
    finally { setGaSaving(false); }
  };

  const toggleGst = async () => {
    const next = !gstEnabled;
    setGstEnabled(next); // optimistic
    setGstSaving(true);
    try {
      await api.put('/auth/restaurant-settings', { gstEnabled: next });
    } catch {
      setGstEnabled(!next); // revert on failure
    } finally { setGstSaving(false); }
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

      {/* Billing */}
      <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 4, mb: 4, boxShadow: T.shadow, maxWidth: 520 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: 24 }}>receipt_long</span>
            <Box>
              <Typography sx={{ fontWeight: 800, color: T.text }}>GST on Bill</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>Add GST to customer orders at checkout.</Typography>
            </Box>
          </Box>
          <Box onClick={toggleGst} sx={{
            width: 44, height: 24, borderRadius: '9999px', p: '3px', position: 'relative', flexShrink: 0,
            bgcolor: gstEnabled ? '#6cf8bb' : T.surfaceHigh, cursor: gstSaving ? 'wait' : 'pointer',
            transition: 'background-color 0.2s', opacity: gstSaving ? 0.7 : 1,
          }}>
            <Box sx={{ width: 18, height: 18, bgcolor: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', transition: 'left 0.2s', left: gstEnabled ? 'calc(100% - 21px)' : '3px' }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em' }}>GST Rate (%)</Typography>
            <Box component="input" type="number" min="0" max="100" step="0.1" value={gstRateInput} onChange={e => { setGstRateInput(e.target.value); setOrderMsg(''); }} sx={{ width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text, outline: 'none', boxSizing: 'border-box', '&:focus': { borderColor: '#f97316' } }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Est. Prep Time</Typography>
            <Box component="input" type="text" value={prepTimeInput} onChange={e => { setPrepTimeInput(e.target.value); setOrderMsg(''); }} placeholder="e.g. 15-20 mins" sx={{ width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text, outline: 'none', boxSizing: 'border-box', '&:focus': { borderColor: '#f97316' } }} />
          </Box>
        </Box>
        {orderMsg && <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1.5, color: orderMsg === 'Saved!' ? '#006c49' : '#ba1a1a' }}>{orderMsg}</Typography>}
        <Box component="button" onClick={saveOrderSettings} disabled={orderSaving} sx={{ py: 1.25, px: 3, border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', borderRadius: '0.5rem', cursor: orderSaving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem', opacity: orderSaving ? 0.7 : 1 }}>
          {orderSaving ? 'Saving…' : 'Save'}
        </Box>
      </Box>

      {/* Menu Cover Image */}
      <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 4, mb: 4, boxShadow: T.shadow, maxWidth: 520 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: 24 }}>image</span>
          <Box>
            <Typography sx={{ fontWeight: 800, color: T.text }}>Menu Cover Image</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>Shown as the hero banner on your public menu page.</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {coverImage && <Box component="img" src={coverImage} alt="" sx={{ width: 72, height: 72, borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }} />}
          <Box component="label" sx={{ flex: 1, px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px dashed ${T.surfaceHigh}`, borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, '&:hover': { borderColor: '#f97316' } }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.textMuted }}>{coverUploading ? 'hourglass_empty' : 'upload'}</span>
            <Typography sx={{ fontSize: '0.875rem', color: T.textSub, fontWeight: 600 }}>{coverUploading ? 'Uploading…' : 'Upload Cover Image'}</Typography>
            <Box component="input" type="file" accept="image/*" onChange={handleCoverUpload} sx={{ display: 'none' }} />
          </Box>
        </Box>
        {coverMsg && <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mt: 1.5, color: '#ba1a1a' }}>{coverMsg}</Typography>}
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
  const [collapsed, setCollapsed] = useState(false);
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
  const adminEmail = adminInfo.email || '';
  const menuUrl = adminInfo.slug ? `${window.location.origin}/menu/${adminInfo.slug}` : null;

  /* ── Dashboard stats ── */
  const [orders, setOrders] = useState([]);
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
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoadingStats(false);
    }
  }, [activeNav]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= todayStart);
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const activeItems = menuItems.filter(i => i.isAvailable).length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  // Aggregate real item quantities from today's orders (falls back to all-time if nothing sold today yet)
  const topSellers = (() => {
    const source = todayOrders.length > 0 ? todayOrders : orders;
    const counts = {};
    source.forEach(o => o.items.forEach(i => {
      const key = i.menuItemId?._id || i.menuItemId || i.name;
      if (!counts[key]) {
        const menuItem = menuItems.find(m => m._id === (i.menuItemId?._id || i.menuItemId));
        counts[key] = { name: i.name, category: menuItem?.categoryId?.name, image: menuItem?.image, qty: 0 };
      }
      counts[key].qty += i.quantity;
    }));
    return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 2);
  })();
  const topSellersLabel = todayOrders.length > 0 ? 'orders today' : 'orders all-time';

  // Global background polling for new orders (for notification alarm)
  const knownGlobalIds = useRef(null);
  
  const pollGlobalOrders = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const { data } = await api.get('/api/orders/restaurant');
      if (knownGlobalIds.current === null) {
        knownGlobalIds.current = new Set(data.map(o => o._id));
      } else {
        const newPending = data.filter(
          o => o.status === 'pending' && !knownGlobalIds.current.has(o._id)
        );
        if (newPending.length > 0) {
          newPending.forEach(o => knownGlobalIds.current.add(o._id));
          const isMuted = localStorage.getItem('orderAlarmMuted') === 'true';
          if (!isMuted) playOrderAlarm();
        }
        data.forEach(o => knownGlobalIds.current.add(o._id));
      }
    } catch { }
  }, []);

  useEffect(() => {
    pollGlobalOrders();
    const interval = setInterval(pollGlobalOrders, 15000); // Check every 15s for faster notifications
    return () => clearInterval(interval);
  }, [pollGlobalOrders]);

  return (
    <Box sx={{ display: 'flex', bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text }}>

      {/* ─── Sidebar ─── */}
      <M
        initial={{ opacity: 0, x: -60, width: 256 }}
        animate={{ opacity: 1, x: 0, width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        component="aside"
        sx={{
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
          pt: 2, pb: 4, px: 2, gap: 1, height: '100vh',
          position: 'fixed', left: 0, top: 0, bgcolor: T.bg, zIndex: 40,
          borderRight: `1.5px solid ${T.border || 'rgba(0,0,0,0.06)'}`,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1.5 }}>
          {!collapsed ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box component="img" src={logo} alt="ScanIt" sx={{ height: '12vh', maxHeight: '110px', width: 'auto' }} />
            </Box>
          ) : (
            <Box component="img" src={logo} alt="ScanIt" sx={{ height: 42, width: 42, objectFit: "cover" }} />
          )}
        </Box>
        {!collapsed && (
          <Typography sx={{ px: 2, mb: 2, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, fontWeight: 700, textAlign: 'center' }}>
            Premium Dining Admin
          </Typography>
        )}

        <Box component="nav" sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item.label;
            return (
              <Box
                component="a"
                href="#"
                key={item.label}
                onClick={e => { e.preventDefault(); setActiveNav(item.label); }}
                title={collapsed ? item.label : undefined}
                sx={{
                  display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 1.25, py: 1, px: collapsed ? 0 : 1.75,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '9999px', textDecoration: 'none', transition: 'all 0.2s', mx: 1,
                  color: isActive ? '#ea580c' : T.textMuted,
                  fontWeight: isActive ? 700 : 500,
                  bgcolor: isActive ? T.surfaceAlt : 'transparent',
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  '&:hover': { color: '#ea580c', bgcolor: isActive ? T.surfaceAlt : 'rgba(255,255,255,0.5)' },
                }}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1", fontSize: 18 } : { fontSize: 18 }}>{item.icon}</span>
                {!collapsed && (
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 'inherit', color: 'inherit', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Logout */}
        <Box sx={{ px: 2, pb: 1.5, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <Box component="button" onClick={handleLogout} sx={{
            display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 1, py: 0.75, px: collapsed ? 0 : 1.5, width: collapsed ? 'auto' : '100%',
            borderRadius: '9999px', border: 'none', bgcolor: 'transparent', cursor: 'pointer',
            color: T.textSub, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            justifyContent: collapsed ? 'center' : 'flex-start', mx: 1,
            '&:hover': { color: '#ba1a1a', bgcolor: 'rgba(186,26,26,0.06)' },
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            {!collapsed && (
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                Logout
              </Typography>
            )}
          </Box>
        </Box>
      </M>

      {/* ─── Top Nav ─── */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: { md: collapsed ? '72px' : '256px' },
          zIndex: 50,
          display: { xs: 'none', md: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 4,
          height: 70,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(24px)',
          borderBottom: `1.5px solid ${T.border || 'rgba(0,0,0,0.06)'}`,
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Desktop collapse toggle */}
          <Box
            component="button"
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center', justifyContent: 'center',
              p: 1, border: 'none', bgcolor: 'transparent', cursor: 'pointer', color: T.textSub,
              borderRadius: '50%', '&:hover': { bgcolor: T.surfaceAlt }
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
              {collapsed ? 'menu_open' : 'menu'}
            </span>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="button" onClick={fetchStats} title="Refresh" sx={{ p: 1, borderRadius: '50%', color: T.textSub, border: 'none', cursor: 'pointer', bgcolor: 'transparent', display: 'flex', '&:hover': { bgcolor: T.surfaceAlt } }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>refresh</span>
          </Box>
          <Box sx={{ width: '1.5px', height: 24, bgcolor: T.border || 'rgba(0,0,0,0.08)', mx: 1.5, flexShrink: 0 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: T.text, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{restaurantName}</Typography>
              <Typography sx={{ fontSize: '9px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em', mt: 0.25, whiteSpace: 'nowrap' }}>ADMIN PORTAL</Typography>
            </Box>
            <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
              {restaurantName ? restaurantName[0].toUpperCase() : 'A'}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ─── Main Content ─── */}
      <Box
        component="main"
        sx={{
          ml: { md: collapsed ? '72px' : '256px' },
          minHeight: '100vh',
          pb: { xs: 14, md: 6 },
          px: { xs: 3, xl: 6 },
          pt: { xs: 4, md: 12 },
          width: '100%',
          maxWidth: { md: collapsed ? 'calc(100% - 72px)' : 'calc(100% - 256px)', xl: 1280 },
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
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
            </M>

            {/* Stats Bento Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 6 }}>
              <StatCard
                label="Total Orders Today"
                value={loadingStats ? '—' : todayOrders.length}
                icon="shopping_bag"
                color="#f97316"
                subtext="today"
                T={T}
              />
              <StatCard
                label="Revenue Today"
                value={loadingStats ? '—' : `₹${todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                icon="payments"
                color="#ea580c"
                subtext="today"
                T={T}
              />
              <StatCard
                label="Active Menu Items"
                value={loadingStats ? '—' : activeItems}
                icon="restaurant"
                color="#884800"
                subtext="active"
                T={T}
              />
            </Box>

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
                  {topSellers.length === 0 ? (
                    <Typography sx={{ color: T.textSub, fontSize: '0.875rem' }}>No orders yet.</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {topSellers.map(item => (
                        <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 64, height: 64, borderRadius: '0.5rem', bgcolor: T.surface, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.image
                              ? <Box component="img" src={item.image} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span className="material-symbols-outlined" style={{ fontSize: 28, color: T.textMuted }}>restaurant</span>}
                          </Box>
                          <Box>
                            {item.category && <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', mb: 0.5 }}>{item.category}</Typography>}
                            <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem', lineHeight: 1.25 }}>{item.name}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: T.textSub, mt: 0.5 }}>{item.qty} {topSellersLabel}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Promotions */}
                <Box sx={{ bgcolor: '#fff7ed', p: 4, borderRadius: '0.5rem', position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'relative', zIndex: 10 }}>
                    <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em', color: T.text, mb: 1 }}>Grow your reach</Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: T.textSub, mb: 3 }}>Add a weekend special to your menu to give customers a reason to come back.</Typography>
                    <Box component="button" onClick={() => setActiveNav('Menu Management')} sx={{
                      px: 3, py: 1.5, bgcolor: '#f97316', color: '#fff',
                      fontSize: '0.875rem', fontWeight: 700, borderRadius: '9999px', border: 'none',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      transition: 'box-shadow 0.3s', '&:hover': { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
                    }}>Manage Menu</Box>
                  </Box>
                  <Box sx={{ position: 'absolute', right: -48, bottom: -48, width: 160, height: 160, bgcolor: 'rgba(249,115,22,0.1)', borderRadius: '50%', filter: 'blur(24px)' }} />
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {activeNav === 'Menu Management' && <MenuManagementView />}
        {activeNav === 'Live Orders' && <LiveOrdersView restaurantName={restaurantName} />}
        {activeNav === 'Employee Management' && <EmployeeManagementView />}
        {activeNav === 'Inventory' && <InventoryView />}
        {activeNav === 'Billing & Invoicing' && <BillingView />}
        {activeNav === 'QR Generator' && <QRGeneratorView />}
        {activeNav === 'Analytics' && <AnalyticsView />}
        {activeNav === 'Settings' && <SettingsView adminEmail={adminEmail} restaurantName={restaurantName} slug={adminInfo.slug} />}
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
