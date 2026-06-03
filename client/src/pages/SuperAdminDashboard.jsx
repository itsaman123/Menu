import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

const M = motion.create(Box);

function toSlug(v) {
  return v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/* ─── Small labelled input used inside the modal ─── */
function OField({ label, value, onChange, type = 'text', placeholder = '', T }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </Typography>
      <Box
        component="input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        sx={{
          width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt,
          border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem',
          fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text,
          outline: 'none', boxSizing: 'border-box',
          '&:focus': { borderColor: '#5341cd' },
        }}
      />
    </Box>
  );
}

const EMPTY_FORM = {
  restaurantName: '', slug: '', subscriptionStatus: 'trial',
  email: '', password: '', confirmPassword: '',
};

/* ─── Onboarding Modal ─── */
function OnboardingModal({ open, onClose, onCreated }) {
  const T = useTokens();
  const [step, setStep] = useState(1);
  const [slugManual, setSlugManual] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  function reset() {
    setStep(1);
    setSlugManual(false);
    setForm(EMPTY_FORM);
    setShowPw(false);
    setError('');
    setCreated(null);
    setCopied(false);
    setSending(false);
    setEmailSent(false);
    setEmailError('');
  }

  function handleClose() { reset(); onClose(); }

  function handleChange(field) {
    return (e) => {
      const v = e.target.value;
      setError('');
      if (field === 'restaurantName') {
        setForm(p => ({ ...p, restaurantName: v, slug: slugManual ? p.slug : toSlug(v) }));
      } else if (field === 'slug') {
        setSlugManual(true);
        setForm(p => ({ ...p, slug: toSlug(v) }));
      } else {
        setForm(p => ({ ...p, [field]: v }));
      }
    };
  }

  function nextStep() {
    if (!form.restaurantName.trim()) return setError('Restaurant name is required');
    if (!form.slug.trim()) return setError('URL slug is required');
    if (!/^[a-z0-9-]+$/.test(form.slug)) return setError('Slug can only contain lowercase letters, numbers and hyphens');
    setError('');
    setStep(2);
  }

  async function handleSubmit() {
    if (!form.email.trim()) return setError('Admin email is required');
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError('Invalid email address');
    if (!form.password) return setError('Password is required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/api/superadmin/restaurants', {
        restaurantName: form.restaurantName.trim(),
        slug: form.slug.trim(),
        subscriptionStatus: form.subscriptionStatus,
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      setCreated(data);
      onCreated(data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create restaurant');
    } finally {
      setSubmitting(false);
    }
  }

  function copyCredentials() {
    navigator.clipboard.writeText(
      `Restaurant: ${form.restaurantName}\nURL Slug: ${form.slug}\nAdmin Email: ${form.email}\nPassword: ${form.password}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendCredentials() {
    setSending(true);
    setEmailError('');
    try {
      await api.post('/api/superadmin/send-credentials', {
        to: form.email,
        restaurantName: form.restaurantName,
        slug: form.slug,
        restaurantId: created?.restaurant?._id,
        email: form.email,
        password: form.password,
        subscription: created?.restaurant?.subscriptionStatus,
        appBaseUrl: window.location.origin,
      });
      setEmailSent(true);
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  const STEPS = ['Restaurant', 'Admin', 'Done'];

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      {/* Backdrop */}
      <Box onClick={step < 3 ? handleClose : undefined} sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} />

      {/* Card */}
      <M initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} sx={{
        position: 'relative', zIndex: 1, bgcolor: T.surface, borderRadius: '1.25rem',
        boxShadow: '0 24px 56px rgba(0,0,0,0.22)', width: '100%', maxWidth: 520, overflow: 'hidden',
      }}>
        {/* Header */}
        <Box sx={{ px: 3, pt: 3, pb: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: T.text, letterSpacing: '-0.02em' }}>
                {step === 3 ? 'Restaurant Created!' : 'Onboard Restaurant'}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: T.textMuted, mt: 0.25 }}>
                {step === 1 && 'Set up the restaurant profile'}
                {step === 2 && 'Create admin login credentials'}
                {step === 3 && 'Save these credentials before closing'}
              </Typography>
            </Box>
            <Box component="button" onClick={handleClose} sx={{
              p: 0.75, borderRadius: '50%', border: 'none', bgcolor: T.surfaceAlt,
              cursor: 'pointer', display: 'flex', color: T.textMuted,
              '&:hover': { bgcolor: T.surfaceHigh, color: T.text },
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </Box>
          </Box>

          {/* Step bar */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {STEPS.map((label, i) => {
              const idx = i + 1;
              const done = step > idx;
              const active = step === idx;
              return (
                <Box key={label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: '100%', height: 4, borderRadius: 2, bgcolor: done || active ? '#5341cd' : T.surfaceHigh, transition: 'background-color 0.3s' }} />
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: done || active ? '#5341cd' : T.textMuted }}>
                    {done ? '✓ ' : ''}{label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ px: 3, pb: 3 }}>

          {/* ── Step 1: Restaurant info ── */}
          {step === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <OField label="Restaurant Name" value={form.restaurantName} onChange={handleChange('restaurantName')} placeholder="e.g. The Spice Garden" T={T} />
              <Box>
                <OField label="URL Slug" value={form.slug} onChange={handleChange('slug')} placeholder="e.g. spice-garden" T={T} />
                <Typography sx={{ fontSize: '0.7rem', color: T.textMuted, mt: 0.5 }}>
                  Public menu URL:&nbsp;
                  <Box component="span" sx={{ fontWeight: 700, color: '#5341cd' }}>
                    /menu/{form.slug || 'your-slug'}
                  </Box>
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Subscription</Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {['trial', 'active', 'inactive'].map(s => (
                    <Box key={s} onClick={() => setForm(p => ({ ...p, subscriptionStatus: s }))} sx={{
                      flex: 1, py: 1, borderRadius: '0.5rem', textAlign: 'center', cursor: 'pointer',
                      border: `2px solid ${form.subscriptionStatus === s ? '#5341cd' : T.surfaceHigh}`,
                      bgcolor: form.subscriptionStatus === s ? 'rgba(83,65,205,0.08)' : T.surfaceAlt,
                      transition: 'all 0.2s',
                    }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize', color: form.subscriptionStatus === s ? '#5341cd' : T.textSub }}>
                        {s}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* ── Step 2: Admin credentials ── */}
          {step === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <OField label="Admin Email" value={form.email} onChange={handleChange('email')} placeholder="admin@restaurant.com" type="email" T={T} />
              <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Password</Typography>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="input"
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange('password')}
                    placeholder="Min. 6 characters"
                    sx={{
                      width: '100%', px: 2, py: 1.5, pr: '2.75rem', bgcolor: T.surfaceAlt,
                      border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem',
                      fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text,
                      outline: 'none', boxSizing: 'border-box', '&:focus': { borderColor: '#5341cd' },
                    }}
                  />
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', bgcolor: 'transparent', cursor: 'pointer', color: T.textMuted, display: 'flex', p: 0 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{showPw ? 'visibility_off' : 'visibility'}</span>
                  </Box>
                </Box>
              </Box>
              <OField label="Confirm Password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} placeholder="Re-enter password" type="password" T={T} />
            </Box>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && created && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(0,108,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#006c49', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </Box>
                <Typography sx={{ fontWeight: 900, color: T.text, fontSize: '1.125rem' }}>{created.restaurant.name}</Typography>
                <Typography sx={{ color: T.textMuted, fontSize: '0.8rem' }}>/{created.restaurant.slug}</Typography>
              </Box>

              <Box sx={{ bgcolor: T.surfaceAlt, borderRadius: '0.75rem', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Admin Email', value: form.email },
                  { label: 'Password', value: form.password },
                  { label: 'Subscription', value: created.restaurant.subscriptionStatus },
                ].map(row => (
                  <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, fontWeight: 600 }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: row.label === 'Subscription' ? '#5341cd' : T.text, textTransform: row.label === 'Subscription' ? 'capitalize' : 'none' }}>
                      {row.value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Copy + Send buttons */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Box component="button" onClick={copyCredentials} sx={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                  py: 1.5, borderRadius: '0.5rem', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem',
                  border: `1.5px solid ${copied ? '#006c49' : T.surfaceHigh}`,
                  color: copied ? '#006c49' : T.textSub, bgcolor: 'transparent', cursor: 'pointer',
                  transition: 'all 0.2s', '&:hover': { borderColor: '#5341cd', color: '#5341cd' },
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{copied ? 'check' : 'content_copy'}</span>
                  {copied ? 'Copied!' : 'Copy'}
                </Box>

                <Box component="button" onClick={sendCredentials} disabled={sending || emailSent} sx={{
                  flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                  py: 1.5, borderRadius: '0.5rem', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem',
                  border: 'none',
                  background: emailSent
                    ? 'rgba(0,108,73,0.12)'
                    : 'linear-gradient(135deg,#5341cd,#6c5ce7)',
                  color: emailSent ? '#006c49' : '#fff',
                  cursor: sending || emailSent ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.75 : 1,
                  transition: 'all 0.2s',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {emailSent ? 'mark_email_read' : 'send'}
                  </span>
                  {sending ? 'Sending…' : emailSent ? 'Email Sent!' : 'Send via Email'}
                </Box>
              </Box>

              {emailError && (
                <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '0.5rem', bgcolor: 'rgba(186,26,26,0.08)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ba1a1a' }}>error</span>
                  <Typography sx={{ fontSize: '0.78rem', color: '#ba1a1a', fontWeight: 600 }}>{emailError}</Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Error banner */}
          {error && (
            <Box sx={{ mt: 2, p: 1.5, borderRadius: '0.5rem', bgcolor: 'rgba(186,26,26,0.08)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ba1a1a' }}>error</span>
              <Typography sx={{ fontSize: '0.8rem', color: '#ba1a1a', fontWeight: 600 }}>{error}</Typography>
            </Box>
          )}

          {/* Action buttons */}
          <Box sx={{ mt: 3, display: 'flex', gap: 1.5 }}>
            {step === 1 && (
              <>
                <Box component="button" onClick={handleClose} sx={{ flex: 1, py: 1.5, borderRadius: '0.5rem', border: `1.5px solid ${T.surfaceHigh}`, bgcolor: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: T.textSub, fontWeight: 600, fontSize: '0.875rem', '&:hover': { bgcolor: T.surfaceAlt } }}>
                  Cancel
                </Box>
                <Box component="button" onClick={nextStep} sx={{ flex: 2, py: 1.5, borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg,#5341cd,#6c5ce7)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#fff', fontWeight: 700, fontSize: '0.875rem', '&:hover': { filter: 'brightness(1.08)' } }}>
                  Next →
                </Box>
              </>
            )}
            {step === 2 && (
              <>
                <Box component="button" onClick={() => { setStep(1); setError(''); }} sx={{ flex: 1, py: 1.5, borderRadius: '0.5rem', border: `1.5px solid ${T.surfaceHigh}`, bgcolor: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: T.textSub, fontWeight: 600, fontSize: '0.875rem', '&:hover': { bgcolor: T.surfaceAlt } }}>
                  ← Back
                </Box>
                <Box component="button" onClick={handleSubmit} disabled={submitting} sx={{ flex: 2, py: 1.5, borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg,#5341cd,#6c5ce7)', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', color: '#fff', fontWeight: 700, fontSize: '0.875rem', opacity: submitting ? 0.7 : 1, '&:hover': { filter: submitting ? 'none' : 'brightness(1.08)' } }}>
                  {submitting ? 'Creating…' : 'Create Restaurant'}
                </Box>
              </>
            )}
            {step === 3 && (
              <Box component="button" onClick={handleClose} sx={{ flex: 1, py: 1.5, borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg,#5341cd,#6c5ce7)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#fff', fontWeight: 700, fontSize: '0.875rem', '&:hover': { filter: 'brightness(1.08)' } }}>
                Done
              </Box>
            )}
          </Box>
        </Box>
      </M>
    </Box>
  );
}

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
  const [otpStats, setOtpStats]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [onboardOpen, setOnboardOpen] = useState(false);

  function handleRestaurantCreated(data) {
    setAdmins(prev => [{
      _id: data.admin._id,
      email: data.admin.email,
      restaurantId: data.restaurant,
      isActive: data.admin.isActive,
      createdAt: data.admin.createdAt,
    }, ...prev]);
  }

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, adminsRes, otpRes] = await Promise.all([
        api.get('/api/superadmin/stats'),
        api.get('/api/superadmin/admins'),
        api.get('/api/superadmin/otp-stats'),
      ]);
      setStats(statsRes.data);
      setAdmins(adminsRes.data);
      setOtpStats(otpRes.data);
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
          <Box component="button" onClick={() => setOnboardOpen(true)} sx={{
            width: '100%', background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)',
            color: '#fff', py: 1.5, borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem',
            boxShadow: '0 10px 15px -3px rgba(199,210,254,1)', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', mb: 2, '&:active': { transform: 'scale(0.95)' },
          }}>+ New Restaurant</Box>
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

        {/* OTP Stats */}
        <Box component="section" sx={{ mb: 5 }}>
          <Typography variant="h3" sx={{ fontSize: '1.125rem', fontWeight: 700, color: T.text, mb: 3 }}>
            OTP Usage Per Restaurant
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#5341cd' }} size={28} />
            </Box>
          ) : otpStats.length === 0 ? (
            <Box sx={{ bgcolor: T.surface, p: 4, borderRadius: '0.5rem', textAlign: 'center' }}>
              <Typography sx={{ color: T.textSub }}>No OTP data yet.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 3 }}>
              {otpStats.map(row => {
                const convRate = row.sent > 0 ? Math.round(row.verified / row.sent * 100) : 0;
                return (
                  <Box key={String(row.restaurantId)} sx={{
                    bgcolor: T.surface, borderRadius: '0.5rem', p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    display: 'flex', flexDirection: 'column', gap: 1.5,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: 1, bgcolor: 'rgba(83,65,205,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, color: '#5341cd', fontSize: '0.875rem',
                      }}>{(row.name || '?')[0].toUpperCase()}</Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem' }}>{row.name}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: T.textMuted }}>/{row.slug}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1, bgcolor: T.surfaceAlt, borderRadius: '0.5rem', p: 1.5, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#5341cd' }}>{row.sent}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sent</Typography>
                      </Box>
                      <Box sx={{ flex: 1, bgcolor: T.surfaceAlt, borderRadius: '0.5rem', p: 1.5, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#006c49' }}>{row.verified}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Verified</Typography>
                      </Box>
                      <Box sx={{ flex: 1, bgcolor: T.surfaceAlt, borderRadius: '0.5rem', p: 1.5, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#884800' }}>{convRate}%</Typography>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Conv.</Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
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

      <OnboardingModal
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        onCreated={handleRestaurantCreated}
      />
    </Box>
  );
}
