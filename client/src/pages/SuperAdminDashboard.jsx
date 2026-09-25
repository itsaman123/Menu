import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
} from '@mui/material';
import logo from '../assets/logo.png';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { StatCard } from '../components/StatCard';

const M = motion.create(Box);
const SA_FEATURES = ['menu', 'orders', 'qr', 'employees'];

/* ─── helpers ─────────────────────────────────────────────────── */
function toSlug(v) { return v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
// Random temp password for "resend credentials" — avoids visually ambiguous chars (0/O, l/1).
function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pw = '';
  for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}
function formatCurrency(n) {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${n.toFixed(0)}`;
}
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
function formatPct(pct) {
  if (pct === null || pct === undefined) return { text: 'New', color: '#6b7280' };
  const rounded = Math.round(pct * 10) / 10;
  return { text: `${rounded > 0 ? '+' : ''}${rounded}%`, color: rounded >= 0 ? '#22c55e' : '#ef4444' };
}
// Last 7 days, ending today — used as the initial date-range default everywhere
function defaultDateRange(days = 7) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

/* ─── shared small input ─── */
function OField({ label, value, onChange, type = 'text', placeholder = '', T }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</Typography>
      <Box component="input" type={type} placeholder={placeholder} value={value} onChange={onChange} sx={{
        width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt,
        border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem',
        fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text,
        outline: 'none', boxSizing: 'border-box', '&:focus': { borderColor: '#f97316' },
      }} />
    </Box>
  );
}

/* ─── pill badge ─── */
function SubBadge({ status }) {
  const map = { active: ['#006c49', '#e6fff4'], trial: ['#884800', '#fff4e6'], inactive: ['#ba1a1a', '#ffd6d6'] };
  const [c, bg] = map[status] || ['#555', '#eee'];
  return (
    <Box component="span" sx={{ px: 1.5, py: 0.25, borderRadius: '4px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: c, bgcolor: bg }}>
      {status}
    </Box>
  );
}


/* ═══════════════════════════════════════════════════════════════
   ONBOARDING MODAL (unchanged)
═══════════════════════════════════════════════════════════════ */
const EMPTY_FORM = { restaurantName: '', slug: '', subscriptionStatus: 'trial', email: '', password: '', confirmPassword: '' };

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

  function reset() { setStep(1); setSlugManual(false); setForm(EMPTY_FORM); setShowPw(false); setError(''); setCreated(null); setCopied(false); setSending(false); setEmailSent(false); setEmailError(''); }
  function handleClose() { reset(); onClose(); }

  function handleChange(field) {
    return (e) => {
      const v = e.target.value;
      setError('');
      if (field === 'restaurantName') setForm(p => ({ ...p, restaurantName: v, slug: slugManual ? p.slug : toSlug(v) }));
      else if (field === 'slug') { setSlugManual(true); setForm(p => ({ ...p, slug: toSlug(v) })); }
      else setForm(p => ({ ...p, [field]: v }));
    };
  }

  function nextStep() {
    if (!form.restaurantName.trim()) return setError('Restaurant name is required');
    if (!form.slug.trim()) return setError('URL slug is required');
    if (!/^[a-z0-9-]+$/.test(form.slug)) return setError('Slug can only contain lowercase letters, numbers and hyphens');
    setError(''); setStep(2);
  }

  async function handleSubmit() {
    if (!form.email.trim()) return setError('Admin email is required');
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError('Invalid email address');
    if (!form.password) return setError('Password is required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setSubmitting(true); setError('');
    try {
      const { data } = await api.post('/api/superadmin/restaurants', { restaurantName: form.restaurantName.trim(), slug: form.slug.trim(), subscriptionStatus: form.subscriptionStatus, email: form.email.trim().toLowerCase(), password: form.password });
      setCreated(data); onCreated(data); setStep(3);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create restaurant'); }
    finally { setSubmitting(false); }
  }

  function copyCredentials() {
    navigator.clipboard.writeText(`Restaurant: ${form.restaurantName}\nURL Slug: ${form.slug}\nAdmin Email: ${form.email}\nPassword: ${form.password}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  async function sendCredentials() {
    setSending(true); setEmailError('');
    try {
      await api.post('/api/superadmin/send-credentials', { to: form.email, restaurantName: form.restaurantName, slug: form.slug, restaurantId: created?.restaurant?._id, email: form.email, password: form.password, subscription: created?.restaurant?.subscriptionStatus, appBaseUrl: window.location.origin });
      setEmailSent(true);
    } catch (err) { setEmailError(err.response?.data?.message || 'Failed to send email'); }
    finally { setSending(false); }
  }

  if (!open) return null;
  const STEPS = ['Restaurant', 'Admin', 'Done'];

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box onClick={step < 3 ? handleClose : undefined} sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} />
      <M initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} sx={{ position: 'relative', zIndex: 1, bgcolor: T.surface, borderRadius: '1.25rem', boxShadow: '0 24px 56px rgba(0,0,0,0.22)', width: '100%', maxWidth: 520, overflow: 'hidden' }}>
        <Box sx={{ px: 3, pt: 3, pb: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: T.text, letterSpacing: '-0.02em' }}>{step === 3 ? 'Restaurant Created!' : 'Onboard Restaurant'}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: T.textMuted, mt: 0.25 }}>
                {step === 1 && 'Set up the restaurant profile'}{step === 2 && 'Create admin login credentials'}{step === 3 && 'Save these credentials before closing'}
              </Typography>
            </Box>
            <Box component="button" onClick={handleClose} sx={{ p: 0.75, borderRadius: '50%', border: 'none', bgcolor: T.surfaceAlt, cursor: 'pointer', display: 'flex', color: T.textMuted, '&:hover': { bgcolor: T.surfaceHigh, color: T.text } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {STEPS.map((label, i) => {
              const idx = i + 1; const done = step > idx; const active = step === idx; return (
                <Box key={label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: '100%', height: 4, borderRadius: 2, bgcolor: done || active ? '#f97316' : T.surfaceHigh, transition: 'background-color 0.3s' }} />
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: done || active ? '#f97316' : T.textMuted }}>{done ? '✓ ' : ''}{label}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box sx={{ px: 3, pb: 3 }}>
          {step === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <OField label="Restaurant Name" value={form.restaurantName} onChange={handleChange('restaurantName')} placeholder="e.g. The Spice Garden" T={T} />
              <Box>
                <OField label="URL Slug" value={form.slug} onChange={handleChange('slug')} placeholder="e.g. spice-garden" T={T} />
                <Typography sx={{ fontSize: '0.7rem', color: T.textMuted, mt: 0.5 }}>Public menu URL: <Box component="span" sx={{ fontWeight: 700, color: '#f97316' }}>/menu/{form.slug || 'your-slug'}</Box></Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Subscription</Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {['trial', 'active', 'inactive'].map(s => (
                    <Box key={s} onClick={() => setForm(p => ({ ...p, subscriptionStatus: s }))} sx={{ flex: 1, py: 1, borderRadius: '0.5rem', textAlign: 'center', cursor: 'pointer', border: `2px solid ${form.subscriptionStatus === s ? '#f97316' : T.surfaceHigh}`, bgcolor: form.subscriptionStatus === s ? 'rgba(249,115,22,0.08)' : T.surfaceAlt, transition: 'all 0.2s' }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize', color: form.subscriptionStatus === s ? '#f97316' : T.textSub }}>{s}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
          {step === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <OField label="Admin Email" value={form.email} onChange={handleChange('email')} placeholder="admin@restaurant.com" type="email" T={T} />
              <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Password</Typography>
                <Box sx={{ position: 'relative' }}>
                  <Box component="input" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange('password')} placeholder="Min. 6 characters" sx={{ width: '100%', px: 2, py: 1.5, pr: '2.75rem', bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text, outline: 'none', boxSizing: 'border-box', '&:focus': { borderColor: '#f97316' } }} />
                  <Box component="button" type="button" onClick={() => setShowPw(p => !p)} sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', bgcolor: 'transparent', cursor: 'pointer', color: T.textMuted, display: 'flex', p: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{showPw ? 'visibility_off' : 'visibility'}</span>
                  </Box>
                </Box>
              </Box>
              <OField label="Confirm Password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} placeholder="Re-enter password" type="password" T={T} />
            </Box>
          )}
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
                {[{ label: 'Admin Email', value: form.email }, { label: 'Password', value: form.password }, { label: 'Subscription', value: created.restaurant.subscriptionStatus }].map(row => (
                  <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, fontWeight: 600 }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: row.label === 'Subscription' ? '#f97316' : T.text, textTransform: row.label === 'Subscription' ? 'capitalize' : 'none' }}>{row.value}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Box component="button" onClick={copyCredentials} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 1.5, borderRadius: '0.5rem', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem', border: `1.5px solid ${copied ? '#006c49' : T.surfaceHigh}`, color: copied ? '#006c49' : T.textSub, bgcolor: 'transparent', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: '#f97316', color: '#f97316' } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{copied ? 'check' : 'content_copy'}</span>
                  {copied ? 'Copied!' : 'Copy'}
                </Box>
                <Box component="button" onClick={sendCredentials} disabled={sending || emailSent} sx={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 1.5, borderRadius: '0.5rem', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem', border: 'none', background: emailSent ? 'rgba(0,108,73,0.12)' : 'linear-gradient(135deg,#f97316,#ea580c)', color: emailSent ? '#006c49' : '#fff', cursor: sending || emailSent ? 'not-allowed' : 'pointer', opacity: sending ? 0.75 : 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{emailSent ? 'mark_email_read' : 'send'}</span>
                  {sending ? 'Sending…' : emailSent ? 'Email Sent!' : 'Send via Email'}
                </Box>
              </Box>
              {emailError && <Box sx={{ p: 1.5, borderRadius: '0.5rem', bgcolor: 'rgba(186,26,26,0.08)', display: 'flex', alignItems: 'center', gap: 1 }}><span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ba1a1a' }}>error</span><Typography sx={{ fontSize: '0.78rem', color: '#ba1a1a', fontWeight: 600 }}>{emailError}</Typography></Box>}
            </Box>
          )}
          {error && <Box sx={{ mt: 2, p: 1.5, borderRadius: '0.5rem', bgcolor: 'rgba(186,26,26,0.08)', display: 'flex', alignItems: 'center', gap: 1 }}><span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ba1a1a' }}>error</span><Typography sx={{ fontSize: '0.8rem', color: '#ba1a1a', fontWeight: 600 }}>{error}</Typography></Box>}
          <Box sx={{ mt: 3, display: 'flex', gap: 1.5 }}>
            {step === 1 && (<><Box component="button" onClick={handleClose} sx={{ flex: 1, py: 1.5, borderRadius: '0.5rem', border: `1.5px solid ${T.surfaceHigh}`, bgcolor: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: T.textSub, fontWeight: 600, fontSize: '0.875rem' }}>Cancel</Box><Box component="button" onClick={nextStep} sx={{ flex: 2, py: 1.5, borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>Next →</Box></>)}
            {step === 2 && (<><Box component="button" onClick={() => { setStep(1); setError(''); }} sx={{ flex: 1, py: 1.5, borderRadius: '0.5rem', border: `1.5px solid ${T.surfaceHigh}`, bgcolor: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: T.textSub, fontWeight: 600, fontSize: '0.875rem' }}>← Back</Box><Box component="button" onClick={handleSubmit} disabled={submitting} sx={{ flex: 2, py: 1.5, borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', color: '#fff', fontWeight: 700, fontSize: '0.875rem', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Creating…' : 'Create Restaurant'}</Box></>)}
            {step === 3 && <Box component="button" onClick={handleClose} sx={{ flex: 1, py: 1.5, borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>Done</Box>}
          </Box>
        </Box>
      </M>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: DASHBOARD
═══════════════════════════════════════════════════════════════ */
function DashboardView({ stats, admins, otpStats, loading, onViewChange }) {
  const T = useTokens();
  const [weeklyTrend, setWeeklyTrend] = useState(null);

  useEffect(() => {
    api.get('/api/superadmin/orders/trends', { params: { range: 'weekly' } })
      .then(r => setWeeklyTrend(r.data))
      .catch(() => { });
  }, []);

  const chartBars = weeklyTrend ? (() => {
    const max = Math.max(1, ...weeklyTrend.current);
    return weeklyTrend.labels.map((label, i) => ({
      label,
      h: `${Math.round((weeklyTrend.current[i] / max) * 100)}%`,
      primary: weeklyTrend.current[i] === max,
    }));
  })() : [];

  const STAT_CARDS = stats ? [
    { label: 'Total Restaurants', value: stats.totalAdmins, icon: 'storefront', color: '#ea580c', trend: { direction: 'up', text: `${stats.activeAdmins} active` } },
    { label: 'Total Orders', value: stats.totalOrders >= 1000 ? `${(stats.totalOrders / 1000).toFixed(1)}k` : stats.totalOrders, icon: 'shopping_bag', color: '#3b82f6', subtext: 'all time' },
    { label: 'Platform Revenue', value: formatCurrency(stats.totalRevenue), icon: 'payments', color: '#eab308', subtext: 'all time' },
    { label: 'Active Accounts', value: stats.activeAdmins, icon: 'verified_user', color: '#22c55e', subtext: `${stats.totalAdmins > 0 ? Math.round(stats.activeAdmins / stats.totalAdmins * 100) : 0}% retention` },
  ] : [];

  return (
    <M initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 900, color: T.text, mb: 0.5, letterSpacing: '-0.025em' }}>Platform Overview</Typography>
        <Typography sx={{ color: T.textSub, fontWeight: 500 }}>{loading ? 'Loading…' : `Monitoring growth across ${stats?.totalAdmins ?? 0} partner locations.`}</Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 5 }}>
        {loading ? <Box sx={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#f97316' }} /></Box>
          : STAT_CARDS.map(s => (
            <StatCard key={s.label} {...s} T={T} />
          ))}
      </Box>

      {/* Chart + Promo */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4, mb: 5 }}>
        <Box sx={{ bgcolor: T.surface, p: 4, borderRadius: '0.5rem' }}>
          <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, color: T.text, mb: 0.5 }}>Order Volume — Last 7 Days</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: T.textSub, mb: 4 }}>Daily order counts across the platform</Typography>
          {chartBars.length === 0 ? (
            <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: T.textSub, fontSize: '0.85rem' }}>{weeklyTrend ? 'No orders in the last 7 days.' : 'Loading…'}</Typography>
            </Box>
          ) : (
            <Box sx={{ height: 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
              {chartBars.map((bar, i) => (
                <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', bgcolor: bar.primary ? '#f97316' : T.surfaceHigh, borderRadius: '0.5rem 0.5rem 0 0', height: bar.h, transition: 'background-color 0.3s', '&:hover': { bgcolor: '#ea580c' } }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: bar.primary ? '#f97316' : T.textSub, mt: 1.5 }}>{bar.label}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box sx={{ background: 'linear-gradient(to bottom right, #f97316, #ea580c)', p: 4, borderRadius: '0.5rem', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', zIndex: 10 }}>
            <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 900, mb: 1 }}>Quick Actions</Typography>
            <Typography sx={{ color: 'rgba(250,246,255,0.8)', fontSize: '0.875rem', mb: 3 }}>Jump to any management section.</Typography>
            {[{ label: 'Manage Restaurants', view: 'restaurants' }, { label: 'View Subscriptions', view: 'subscriptions' }, { label: 'Platform Analytics', view: 'analytics' }].map(a => (
              <Box key={a.view} component="button" onClick={() => onViewChange(a.view)} sx={{ display: 'block', width: '100%', bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, px: 3, py: 1.25, borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', mb: 1.5, textAlign: 'left', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>{a.label}</Box>
            ))}
          </Box>
          <Box sx={{ position: 'absolute', bottom: -32, right: -32, opacity: 0.2, transform: 'rotate(12deg)' }}><span className="material-symbols-outlined" style={{ fontSize: 120 }}>rocket_launch</span></Box>
        </Box>
      </Box>

      {/* OTP Stats */}
      {otpStats.length > 0 && (
        <Box component="section" sx={{ mb: 5 }}>
          <Typography variant="h3" sx={{ fontSize: '1.125rem', fontWeight: 700, color: T.text, mb: 3 }}>OTP Usage Per Restaurant</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 3 }}>
            {otpStats.map(row => {
              const rate = row.sent > 0 ? Math.round(row.verified / row.sent * 100) : 0;
              return (
                <Box key={String(row.restaurantId)} sx={{ bgcolor: T.surface, borderRadius: '0.5rem', p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#f97316', fontSize: '0.875rem' }}>{(row.name || '?')[0].toUpperCase()}</Box>
                    <Box><Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem' }}>{row.name}</Typography><Typography sx={{ fontSize: '0.7rem', color: T.textMuted }}>/{row.slug}</Typography></Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {[{ v: row.sent, label: 'Sent', c: '#f97316' }, { v: row.verified, label: 'Verified', c: '#006c49' }, { v: `${rate}%`, label: 'Conv.', c: '#884800' }].map(x => (
                      <Box key={x.label} sx={{ flex: 1, bgcolor: T.surfaceAlt, borderRadius: '0.5rem', p: 1.5, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: x.c }}>{x.v}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{x.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Recent restaurants table */}
      <Box component="section" sx={{ bgcolor: T.surface, borderRadius: '0.5rem', overflow: 'hidden' }}>
        <Box sx={{ p: 4, borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, color: T.text }}>Recently Joined Restaurants</Typography>
          <Box component="button" onClick={() => onViewChange('restaurants')} sx={{ color: '#f97316', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', '&:hover': { textDecoration: 'underline' } }}>
            View All <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 4 }}>arrow_forward</span>
          </Box>
        </Box>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#f97316' }} /></Box>
          : admins.length === 0 ? <Box sx={{ p: 8, textAlign: 'center' }}><Typography sx={{ color: T.textSub }}>No restaurants registered yet.</Typography></Box>
            : (
              <TableContainer><Table sx={{ minWidth: 600 }}>
                <TableHead><TableRow sx={{ bgcolor: T.surfaceAlt }}>
                  {['Restaurant', 'Admin Email', 'Status', 'Joined'].map(h => <TableCell key={h} sx={{ py: 2, px: 4, color: T.textSub, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, borderBottom: 'none' }}>{h}</TableCell>)}
                </TableRow></TableHead>
                <TableBody>
                  {admins.slice(0, 5).map(row => (
                    <TableRow key={row._id} sx={{ '&:hover': { bgcolor: T.surfaceAlt } }}>
                      <TableCell sx={{ px: 4, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: T.surfaceHigh, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#f97316', fontSize: '0.875rem' }}>{(row.restaurantId?.name || '?')[0].toUpperCase()}</Box>
                          <Box><Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem' }}>{row.restaurantId?.name}</Typography><Typography sx={{ fontSize: '0.7rem', color: T.textMuted }}>/{row.restaurantId?.slug}</Typography></Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ px: 4, py: 2.5, borderBottom: `1px solid ${T.border}`, color: T.textSub, fontSize: '0.875rem' }}>{row.email}</TableCell>
                      <TableCell sx={{ px: 4, py: 2.5, borderBottom: `1px solid ${T.border}` }}><SubBadge status={row.restaurantId?.subscriptionStatus || 'trial'} /></TableCell>
                      <TableCell sx={{ px: 4, py: 2.5, borderBottom: `1px solid ${T.border}`, color: T.textSub, fontSize: '0.875rem' }}>{fmtDate(row.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table></TableContainer>
            )}
      </Box>
    </M>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: RESTAURANTS
═══════════════════════════════════════════════════════════════ */
function RestaurantsView({ stats, admins, setAdmins, otpStats, loading, onViewChange }) {
  const T = useTokens();
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'management'
  const [timeframe, setTimeframe] = useState('Weekly');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [startDate, setStartDate] = useState(() => defaultDateRange(7).start);
  const [endDate, setEndDate] = useState(() => defaultDateRange(7).end);

  // API statistics state
  const [restStats, setRestStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [summary, setSummary] = useState(null);       // /orders/summary for the selected range
  const [trends, setTrends] = useState(null);         // /orders/trends for the selected range
  const [orderHistory, setOrderHistory] = useState([]); // /orders for the selected range
  const [periodLoading, setPeriodLoading] = useState(true);

  useEffect(() => {
    api.get('/api/superadmin/restaurant-stats')
      .then(r => setRestStats(r.data))
      .catch(() => { })
      .finally(() => setStatsLoading(false));
  }, []);

  // Selected restaurant filter (declared here so it can be used by the fetch effect below)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    const restaurantId = restStats.find(r => r.name === selectedRestaurant)?.restaurantId;
    const params = { from: startDate, to: endDate, ...(restaurantId ? { restaurantId } : {}) };
    Promise.all([
      api.get('/api/superadmin/orders/summary', { params }),
      api.get('/api/superadmin/orders/trends', { params }),
      api.get('/api/superadmin/orders', { params: { ...params, limit: 10 } }),
    ]).then(([summaryRes, trendsRes, ordersRes]) => {
      setSummary(summaryRes.data);
      setTrends(trendsRes.data);
      setOrderHistory(ordersRes.data.orders);
    }).catch(() => { }).finally(() => setPeriodLoading(false));
  }, [startDate, endDate, selectedRestaurant, restStats]);

  // Management states
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [subEditing, setSubEditing] = useState({}); // { [adminId]: status }
  const [savingId, setSavingId] = useState(null);

  // Resend credentials (restaurant forgot their ID / email / password)
  const [resendTarget, setResendTarget] = useState(null); // admin row
  const [resendPw, setResendPw] = useState('');
  const [resendSending, setResendSending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendCopied, setResendCopied] = useState(false);

  const filteredAdmins = admins.filter(a => {
    const q = search.toLowerCase();
    return (a.restaurantId?.name || '').toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || (a.restaurantId?.slug || '').toLowerCase().includes(q);
  });

  async function handleDelete(id) {
    if (!window.confirm('Delete this admin and restaurant permanently?')) return;
    setDeletingId(id);
    try { await api.delete(`/api/superadmin/admins/${id}`); setAdmins(p => p.filter(a => a._id !== id)); }
    catch { } finally { setDeletingId(null); }
  }

  async function handleToggleActive(row) {
    setTogglingId(row._id);
    try {
      const { data } = await api.put(`/api/superadmin/admins/${row._id}`, { isActive: !row.isActive });
      setAdmins(p => p.map(a => a._id === data._id ? data : a));
    } catch { } finally { setTogglingId(null); }
  }

  async function handleFeatureToggle(row, feature) {
    const cur = row.disabledFeatures || [];
    const next = cur.includes(feature) ? cur.filter(f => f !== feature) : [...cur, feature];
    try {
      const { data } = await api.put(`/api/superadmin/admins/${row._id}`, { disabledFeatures: next });
      setAdmins(p => p.map(a => a._id === data._id ? data : a));
    } catch { }
  }

  async function handleSubSave(row) {
    const newStatus = subEditing[row._id];
    if (!newStatus || newStatus === row.restaurantId?.subscriptionStatus) { setSubEditing(p => { const n = { ...p }; delete n[row._id]; return n; }); return; }
    setSavingId(row._id);
    try {
      await api.put(`/api/superadmin/restaurants/${row.restaurantId._id}`, { subscriptionStatus: newStatus });
      setAdmins(p => p.map(a => a._id === row._id ? { ...a, restaurantId: { ...a.restaurantId, subscriptionStatus: newStatus } } : a));
      setSubEditing(p => { const n = { ...p }; delete n[row._id]; return n; });
    } catch { } finally { setSavingId(null); }
  }

  function openResend(row) {
    setResendTarget(row);
    setResendPw(generatePassword());
    setResendSending(false);
    setResendSent(false);
    setResendError('');
    setResendCopied(false);
  }
  function closeResend() { if (!resendSending) setResendTarget(null); }

  function copyResendCredentials() {
    const rest = resendTarget?.restaurantId;
    navigator.clipboard.writeText(`Restaurant: ${rest?.name}\nRestaurant ID: ${rest?._id}\nAdmin Email: ${resendTarget.email}\nPassword: ${resendPw}`);
    setResendCopied(true); setTimeout(() => setResendCopied(false), 2000);
  }

  async function sendResendCredentials() {
    if (!resendTarget) return;
    setResendSending(true); setResendError('');
    const rest = resendTarget.restaurantId;
    try {
      await api.post(`/api/superadmin/admins/${resendTarget._id}/reset-password`, { newPassword: resendPw });
      await api.post('/api/superadmin/send-credentials', {
        to: resendTarget.email, restaurantName: rest?.name, slug: rest?.slug,
        restaurantId: rest?._id, email: resendTarget.email, password: resendPw,
        subscription: rest?.subscriptionStatus, appBaseUrl: window.location.origin,
      });
      setResendSent(true);
    } catch (err) {
      setResendError(err.response?.data?.message || 'Failed to resend credentials');
    } finally {
      setResendSending(false);
    }
  }

  const handleTimeframeChange = (t) => {
    setTimeframe(t);
    const days = t === 'Daily' ? 1 : t === 'Weekly' ? 7 : 30;
    const range = defaultDateRange(days);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  const formatDateDisplay = (start, end) => {
    try {
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      const sStr = new Date(start).toLocaleDateString('en-US', options);
      const eStr = new Date(end).toLocaleDateString('en-US', options);
      return `${sStr} - ${eStr}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  // Calculate dynamic stats based on date range and selected restaurant filter
  const activeStats = selectedRestaurant
    ? restStats.filter(r => r.name === selectedRestaurant)
    : restStats;

  const totalOrdersVal = trends ? trends.current.reduce((a, b) => a + b, 0) : 0;
  const totalRevenueVal = summary?.totalVolume || 0;
  const avgOrderValueVal = summary?.avgOrderValue || 0;
  const volumeTrend = formatPct(summary?.totalVolumeChangePct);
  const avgOrderTrend = formatPct(summary?.avgOrderValueChangePct);

  const locationsTrend = formatPct(stats?.restaurantsGrowthPct);

  const sortedPerformers = [...activeStats].sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));
  const displayPerformers = sortedPerformers.slice(0, 3).map(r => ({
    name: r.name,
    orders: `${r.totalOrders || 0} Orders`,
    amount: formatCurrency(r.totalRevenue || 0)
  }));

  return (
    <M initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {/* View Mode Selector Header */}
      <Box sx={{ display: 'flex', bgcolor: 'rgba(0,0,0,0.04)', p: 0.5, borderRadius: '9999px', border: '1px solid rgba(0,0,0,0.06)', width: 'fit-content', mb: 4 }}>
        {['dashboard', 'management'].map(mode => (
          <Box component="button" key={mode} onClick={() => setViewMode(mode)} sx={{ px: 3, py: 1, borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, bgcolor: viewMode === mode ? '#FF6B00' : 'transparent', color: viewMode === mode ? '#fff' : '#6b7280', transition: 'all 0.2s', textTransform: 'capitalize' }}>
            {mode === 'management' ? `Manage Locations (${admins.length})` : 'Dashboard View'}
          </Box>
        ))}
      </Box>

      {viewMode === 'dashboard' ? (
        <>
          {/* Top Filter Controls */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', bgcolor: 'rgba(0,0,0,0.04)', p: 0.5, borderRadius: '9999px', border: '1px solid rgba(0,0,0,0.06)', width: 'fit-content' }}>
              {['Daily', 'Weekly', 'Monthly'].map(t => (
                <Box component="button" key={t} onClick={() => handleTimeframeChange(t)} sx={{ px: { xs: 2.5, sm: 4 }, py: 1, borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, bgcolor: timeframe === t ? '#FF6B00' : 'transparent', color: timeframe === t ? '#fff' : '#6b7280', transition: 'all 0.2s' }}>{t}</Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ position: 'relative' }}>
                <Box onClick={() => setDateMenuOpen(!dateMenuOpen)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, bgcolor: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '0.5rem', cursor: 'pointer', '&:hover': { bgcolor: '#f9f9fa' } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#6b7280' }}>calendar_month</span>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{formatDateDisplay(startDate, endDate)}</Typography>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#9ca3af' }}>keyboard_arrow_down</span>
                </Box>

                {dateMenuOpen && (
                  <Box sx={{
                    position: 'absolute', top: '120%', right: 0, zIndex: 100,
                    width: 280, bgcolor: '#ffffff', p: 2.5, borderRadius: '0.75rem',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                    display: 'flex', flexDirection: 'column', gap: 2
                  }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#111827' }}>Date Range Presets</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {[
                        { label: 'Today (1 day)', days: 1 },
                        { label: 'Last 7 Days', days: 7 },
                        { label: 'Last 30 Days', days: 30 }
                      ].map(preset => (
                        <Box
                          component="button"
                          key={preset.label}
                          onClick={() => {
                            const range = defaultDateRange(preset.days);
                            setStartDate(range.start);
                            setEndDate(range.end);
                            setDateMenuOpen(false);
                          }}
                          sx={{
                            textAlign: 'left', p: 1, border: 'none', bgcolor: 'transparent',
                            borderRadius: '0.375rem', cursor: 'pointer', color: '#4b5563',
                            fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                            transition: 'all 0.15s',
                            '&:hover': { bgcolor: '#f9f9fa', color: '#FF6B00' }
                          }}
                        >
                          {preset.label}
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)', pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#6b7280', mb: 0.5, textTransform: 'uppercase' }}>Start Date</Typography>
                        <Box component="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} sx={{ width: '100%', px: 1.5, py: 1, border: '1px solid rgba(0,0,0,0.06)', borderRadius: '0.375rem', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#111827', bgcolor: '#f9f9fa' }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#6b7280', mb: 0.5, textTransform: 'uppercase' }}>End Date</Typography>
                        <Box component="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} sx={{ width: '100%', px: 1.5, py: 1, border: '1px solid rgba(0,0,0,0.06)', borderRadius: '0.375rem', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#111827', bgcolor: '#f9f9fa' }} />
                      </Box>
                      <Box component="button" onClick={() => setDateMenuOpen(false)} sx={{ py: 1, bgcolor: '#FF6B00', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', '&:hover': { bgcolor: '#E05E00' } }}>
                        Apply Custom Range
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>

              <Box component="button" onClick={() => setFiltersOpen(!filtersOpen)} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3.5, py: 1.5, bgcolor: '#FF6B00', color: '#fff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(249,107,0,0.15)', '&:hover': { bgcolor: '#E05E00' }, transition: 'all 0.2s' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_alt</span>Advanced Filters
              </Box>

              <Box component="button" title="Download CSV" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1.5, bgcolor: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '0.5rem', cursor: 'pointer', color: '#4b5563', '&:hover': { bgcolor: '#f9f9fa' }, transition: 'all 0.2s', height: 46, width: 46, boxSizing: 'border-box' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
              </Box>
            </Box>
          </Box>

          {/* Advanced Filters dropdown panel */}
          {filtersOpen && (
            <M
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              sx={{ mb: 4, bgcolor: '#ffffff', p: 3, borderRadius: '0.75rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', mb: 1.5 }}>Filter by Restaurant</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Box component="button" onClick={() => setSelectedRestaurant(null)} sx={{ px: 2.5, py: 1, bgcolor: !selectedRestaurant ? '#FF6B0015' : 'rgba(0,0,0,0.04)', border: `1.5px solid ${!selectedRestaurant ? '#FF6B00' : 'rgba(0,0,0,0.06)'}`, borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: !selectedRestaurant ? '#FF6B00' : '#4b5563', cursor: 'pointer' }}>All Restaurants</Box>
                {restStats.map(r => (
                  <Box key={r.name} component="button" onClick={() => setSelectedRestaurant(r.name)} sx={{ px: 2.5, py: 1, bgcolor: selectedRestaurant === r.name ? '#FF6B0015' : 'rgba(0,0,0,0.04)', border: `1.5px solid ${selectedRestaurant === r.name ? '#FF6B00' : 'rgba(0,0,0,0.06)'}`, borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: selectedRestaurant === r.name ? '#FF6B00' : '#4b5563', cursor: 'pointer', '&:hover': { borderColor: '#FF6B00', color: '#FF6B00' } }}>{r.name}</Box>
                ))}
              </Box>
            </M>
          )}

          {/* Stats Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 5 }}>
            {[
              { label: 'Total Order Volume', value: formatCurrency(totalRevenueVal), icon: 'trending_up', color: '#FF6B00', trendText: volumeTrend.text, trendColor: volumeTrend.color, subtext: 'vs previous period' },
              { label: 'Total Orders', value: totalOrdersVal, icon: 'shopping_bag', color: '#006c49', trendText: '', trendColor: '#22c55e', subtext: 'in selected period' },
              { label: 'Avg. Order Value', value: formatCurrency(avgOrderValueVal), icon: 'payments', color: '#3b82f6', trendText: avgOrderTrend.text, trendColor: avgOrderTrend.color, subtext: `Across ${admins.length} active locations` },
              { label: 'Platform Locations', value: admins.length || 0, icon: 'storefront', color: '#ea580c', trendText: locationsTrend.text, trendColor: locationsTrend.color, subtext: 'Fully onboarded locations · vs last month' }
            ].map((card, idx) => (
              <Box key={idx} sx={{ bgcolor: '#ffffff', p: 2.75, borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: '8px', bgcolor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}><span className="material-symbols-outlined" style={{ fontSize: 20, color: card.color }}>{card.icon}</span></Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', mt: 1, fontFamily: 'Inter, sans-serif' }}>{card.label}</Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#1a1c1d', lineHeight: 1.1, fontFamily: 'Inter, sans-serif' }}>{card.value}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: card.trendColor, display: 'flex', alignItems: 'center', gap: 0.5, fontFamily: 'Inter, sans-serif' }}>{card.trendText}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>{card.subtext}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Volume Trends & Top Performers */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4, mb: 5 }}>
            <Box sx={{ bgcolor: '#ffffff', p: 3.5, borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#2D1F18', fontFamily: 'Inter, sans-serif' }}>Volume Trends</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#6b7280', mt: 0.25, fontFamily: 'Inter, sans-serif' }}>Historical daily order counts</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF6B00' }} /><Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', fontFamily: 'Inter, sans-serif' }}>Selected Period</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FFE5D9' }} /><Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', fontFamily: 'Inter, sans-serif' }}>Previous Period</Typography></Box>
                </Box>
              </Box>

              {!trends || trends.current.every(v => v === 0 && trends.previous.every(p => p === 0)) ? (
                <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#6b7280', fontSize: '0.85rem' }}>{periodLoading ? 'Loading…' : 'No order data for this period yet.'}</Typography>
                </Box>
              ) : (
                <Box sx={{ height: 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, px: 1, pt: 2 }}>
                  {(() => {
                    const max = Math.max(1, ...trends.current, ...trends.previous);
                    return trends.labels.map((label, idx) => (
                      <Box key={idx} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, width: '100%', height: '100%' }}>
                          <Box title={`${trends.current[idx]} orders`} sx={{ flex: 1, bgcolor: '#FF6B00', height: `${Math.round((trends.current[idx] / max) * 100)}%`, borderRadius: '4px 4px 0 0', '&:hover': { bgcolor: '#E05E00' } }} />
                          <Box title={`${trends.previous[idx]} orders`} sx={{ flex: 1, bgcolor: '#FFE5D9', height: `${Math.round((trends.previous[idx] / max) * 100)}%`, borderRadius: '4px 4px 0 0', '&:hover': { bgcolor: '#EAD6C5' } }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', mt: 1.5, fontFamily: 'Inter, sans-serif' }}>{label}</Typography>
                      </Box>
                    ));
                  })()}
                </Box>
              )}
            </Box>

            <Box sx={{ bgcolor: '#1E140C', color: '#ffffff', p: 3.5, borderRadius: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(30, 20, 12, 0.15)' }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', mb: 3, fontFamily: 'Inter, sans-serif' }}>Top Performers</Typography>
                {displayPerformers.length === 0 ? (
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>No data available</Typography>
                ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                  {displayPerformers.map((rest, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: i === 0 ? '#FF6B00' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: '#fff' }}>{i + 1}</Box>
                        <Box><Typography sx={{ fontWeight: 800, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>{rest.name}</Typography><Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif' }}>{rest.orders}</Typography></Box>
                      </Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>{rest.amount}</Typography>
                    </Box>
                  ))}
                </Box>
                )}
              </Box>
              <Box component="button" onClick={() => setViewMode('management')} sx={{ width: '100%', py: 1.75, mt: 4, bgcolor: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: '9999px', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: '#fff' } }}>View All Locations</Box>
            </Box>
          </Box>

          {/* Detailed Order History Table */}
          <Box sx={{ bgcolor: '#ffffff', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', mb: 4 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#2D1F18', fontFamily: 'Inter, sans-serif' }}>Detailed Order History</Typography>
              <Box component="button" onClick={() => setViewMode('management')} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 2, py: 1, bgcolor: '#FFF5EE', border: '1px solid #FFE5D9', borderRadius: '0.5rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#FF6B00' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>table_chart</span>Table View
              </Box>
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FFF5EE' }}>
                    {['Order ID', 'Date & Time', 'Restaurant', 'Customer', 'Items', 'Amount', 'Status'].map(h => (
                      <TableCell key={h} sx={{ py: 2, px: 3.5, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5C4A3A', borderBottom: 'none', fontFamily: 'Inter, sans-serif' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderHistory.length === 0 ? (
                    <TableRow><TableCell colSpan={7} sx={{ py: 6, textAlign: 'center', color: '#6b7280', borderBottom: 'none' }}>{periodLoading ? 'Loading…' : 'No orders in this period.'}</TableCell></TableRow>
                  ) : orderHistory.map((row) => {
                    const STATUS_COLORS = {
                      completed: ['#22c55e', 'rgba(34, 197, 94, 0.08)'],
                      cancelled: ['#ef4444', 'rgba(239, 68, 68, 0.08)'],
                      preparing: ['#3b82f6', 'rgba(59, 130, 246, 0.08)'],
                      confirmed: ['#3b82f6', 'rgba(59, 130, 246, 0.08)'],
                      pending:   ['#ea580c', 'rgba(234, 88, 12, 0.08)'],
                    };
                    const [statusColor, statusBg] = STATUS_COLORS[row.status] || STATUS_COLORS.pending;
                    const dateStr = new Date(row.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
                    const timeStr = new Date(row.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    const itemsSummary = row.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
                    return (
                      <TableRow key={row.orderId} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                        <TableCell sx={{ px: 3.5, py: 2.2, borderBottom: '1px solid rgba(0,0,0,0.04)' }}><Typography sx={{ fontWeight: 800, color: '#FF6B00', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>{row.orderId}</Typography></TableCell>
                        <TableCell sx={{ px: 3.5, py: 2.2, borderBottom: '1px solid rgba(0,0,0,0.04)', color: '#4b5563', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827', fontFamily: 'Inter, sans-serif' }}>{dateStr}</Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: 'Inter, sans-serif', mt: 0.25 }}>{timeStr}</Typography>
                        </TableCell>
                        <TableCell sx={{ px: 3.5, py: 2.2, borderBottom: '1px solid rgba(0,0,0,0.04)' }}><Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>{row.restaurant?.name}</Typography></TableCell>
                        <TableCell sx={{ px: 3.5, py: 2.2, borderBottom: '1px solid rgba(0,0,0,0.04)', fontFamily: 'Inter, sans-serif' }}><Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>{row.customerPhone}</Typography></TableCell>
                        <TableCell sx={{ px: 3.5, py: 2.2, borderBottom: '1px solid rgba(0,0,0,0.04)', color: '#4b5563', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={itemsSummary}>{itemsSummary}</TableCell>
                        <TableCell sx={{ px: 3.5, py: 2.2, borderBottom: '1px solid rgba(0,0,0,0.04)', fontWeight: 800, color: '#111827', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>{formatCurrency(row.totalAmount)}</TableCell>
                        <TableCell sx={{ px: 3.5, py: 2.2, borderBottom: '1px solid rgba(0,0,0,0.04)' }}><Box sx={{ bgcolor: statusBg, color: statusColor, px: 2, py: 0.5, borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content', textAlign: 'center', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>{row.status}</Box></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      ) : (
        /* Real Locations Management View */
        <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 3, boxShadow: T.shadow }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: T.text, fontFamily: 'Inter, sans-serif' }}>Onboarded Locations</Typography>
              <Typography sx={{ color: T.textSub, fontSize: '0.8rem', mt: 0.5 }}>Real-time restaurant access control and configurations.</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: T.surfaceAlt, px: 2.5, py: 1.25, borderRadius: '9999px', border: `1px solid ${T.border}`, gap: 1, minWidth: 280 }}>
              <span className="material-symbols-outlined" style={{ color: T.textMuted, fontSize: 16 }}>search</span>
              <Box component="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search locations…" sx={{ border: 'none', bgcolor: 'transparent', outline: 'none', fontSize: '0.85rem', color: T.text, fontFamily: 'Inter, sans-serif', width: '100%', '&::placeholder': { color: T.textMuted } }} />
            </Box>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#FFF5EE' }}>
                  {['Restaurant', 'Admin Email', 'Subscription', 'Account Status', 'Joined Date', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ py: 2, px: 3, color: '#5C4A3A', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, borderBottom: 'none', fontFamily: 'Inter, sans-serif' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAdmins.length === 0 ? (
                  <TableRow><TableCell colSpan={6} sx={{ py: 8, textAlign: 'center', color: T.textSub, borderBottom: 'none' }}>No locations found.</TableCell></TableRow>
                ) : filteredAdmins.map(row => {
                  const rest = row.restaurantId;
                  const isActive = row.isActive !== false;
                  const disabled = row.disabledFeatures || [];
                  const isExpanded = expandedId === row._id;
                  const curSub = subEditing[row._id] ?? rest?.subscriptionStatus ?? 'trial';
                  return (
                    <React.Fragment key={row._id}>
                      <TableRow sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                        <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 38, height: 38, borderRadius: 1, bgcolor: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#f97316', fontSize: '0.9rem', flexShrink: 0 }}>{(rest?.name || '?')[0].toUpperCase()}</Box>
                            <Box><Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>{rest?.name || '—'}</Typography><Typography sx={{ fontSize: '0.7rem', color: T.textMuted, fontFamily: 'Inter, sans-serif' }}>/{rest?.slug}</Typography></Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}`, color: T.textSub, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>{row.email}</TableCell>
                        <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                          {subEditing[row._id] !== undefined ? (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Box component="select" value={curSub} onChange={e => setSubEditing(p => ({ ...p, [row._id]: e.target.value }))} sx={{ bgcolor: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: '0.375rem', px: 1, py: 0.5, fontSize: '0.8rem', color: T.text, outline: 'none', fontFamily: 'Inter, sans-serif' }}>
                                {['trial', 'active', 'inactive'].map(s => <option key={s} value={s}>{s}</option>)}
                              </Box>
                              <Box component="button" onClick={() => handleSubSave(row)} disabled={savingId === row._id} sx={{ p: 0.75, border: 'none', bgcolor: '#f97316', color: '#fff', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex' }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span></Box>
                              <Box component="button" onClick={() => setSubEditing(p => { const n = { ...p }; delete n[row._id]; return n; })} sx={{ p: 0.75, border: 'none', bgcolor: T.surfaceHigh, color: T.textSub, borderRadius: '0.375rem', cursor: 'pointer', display: 'flex' }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span></Box>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => setSubEditing(p => ({ ...p, [row._id]: rest?.subscriptionStatus }))}>
                              <SubBadge status={rest?.subscriptionStatus || 'trial'} />
                              <span className="material-symbols-outlined" style={{ fontSize: 14, color: T.textMuted }}>edit</span>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => togglingId !== row._id && handleToggleActive(row)}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isActive ? '#006c49' : '#884800' }} />
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: isActive ? '#006c49' : '#884800', fontFamily: 'Inter, sans-serif' }}>{togglingId === row._id ? '…' : (isActive ? 'Active' : 'Disabled')}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}`, color: T.textSub, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>{fmtDate(row.createdAt)}</TableCell>
                        <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box component="button" title="Manage Features" onClick={() => setExpandedId(isExpanded ? null : row._id)} sx={{ p: 1, border: 'none', bgcolor: isExpanded ? 'rgba(249,115,22,0.1)' : 'transparent', color: isExpanded ? '#f97316' : T.textMuted, borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', '&:hover': { bgcolor: T.surfaceHigh } }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>tune</span>
                            </Box>
                            <Box component="button" title="Resend Credentials" onClick={() => openResend(row)} sx={{ p: 1, border: 'none', bgcolor: 'transparent', color: T.textMuted, borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', '&:hover': { color: '#f97316', bgcolor: 'rgba(249,115,22,0.08)' } }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>forward_to_inbox</span>
                            </Box>
                            <Box component="button" title="Delete" onClick={() => !deletingId && handleDelete(row._id)} sx={{ p: 1, border: 'none', bgcolor: 'transparent', color: T.textMuted, borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', '&:hover': { color: '#ba1a1a', bgcolor: 'rgba(186,26,26,0.08)' } }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{deletingId === row._id ? 'hourglass_empty' : 'delete'}</span>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ px: 3, py: 2, bgcolor: 'rgba(249,115,22,0.04)', borderBottom: `1px solid ${T.border}` }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5, fontFamily: 'Inter, sans-serif' }}>Feature Access</Typography>
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                              {SA_FEATURES.map(f => {
                                const enabled = !disabled.includes(f);
                                return (
                                  <Box key={f} component="button" onClick={() => handleFeatureToggle(row, f)} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 2, py: 0.75, borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s', bgcolor: enabled ? 'rgba(0,108,73,0.1)' : T.surfaceHigh, color: enabled ? '#006c49' : T.textMuted }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{enabled ? 'check_circle' : 'cancel'}</span>{f}
                                  </Box>
                                );
                              })}
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Resend credentials modal — restaurant ID / email / a fresh password, emailed to the admin */}
      {resendTarget && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <Box onClick={closeResend} sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <Box sx={{ position: 'relative', zIndex: 1, bgcolor: T.surface, borderRadius: '1rem', p: 4, width: '100%', maxWidth: 420, boxShadow: '0 24px 56px rgba(0,0,0,0.2)' }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: T.text, mb: 0.5 }}>Resend Credentials</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: T.textMuted, mb: 2.5 }}>{resendTarget.restaurantId?.name} · {resendTarget.email}</Typography>

            {!resendSent && (
              <Typography sx={{ fontSize: '0.78rem', color: T.textSub, mb: 2, lineHeight: 1.5 }}>
                This generates a new temporary password and emails the restaurant ID, login email and password to <strong>{resendTarget.email}</strong>. Their old password stops working immediately.
              </Typography>
            )}

            <Box sx={{ bgcolor: T.surfaceAlt, borderRadius: '0.75rem', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
              {[
                { label: 'Restaurant ID', value: resendTarget.restaurantId?._id },
                { label: 'Admin Email', value: resendTarget.email },
                { label: 'New Password', value: resendPw },
              ].map(r => (
                <Box key={r.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, fontWeight: 600, flexShrink: 0 }}>{r.label}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: T.text, fontFamily: r.label === 'Admin Email' ? 'inherit' : 'monospace', wordBreak: 'break-all', textAlign: 'right' }}>{r.value}</Typography>
                </Box>
              ))}
              {!resendSent && (
                <Box component="button" onClick={() => setResendPw(generatePassword())} disabled={resendSending} sx={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 0.5, border: 'none', bgcolor: 'transparent', color: '#f97316', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 700, cursor: resendSending ? 'not-allowed' : 'pointer', p: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>Regenerate
                </Box>
              )}
            </Box>

            {resendError && <Box sx={{ p: 1.5, borderRadius: '0.5rem', bgcolor: 'rgba(186,26,26,0.08)', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ba1a1a' }}>error</span><Typography sx={{ fontSize: '0.78rem', color: '#ba1a1a', fontWeight: 600 }}>{resendError}</Typography></Box>}
            {resendSent && <Box sx={{ p: 1.5, borderRadius: '0.5rem', bgcolor: 'rgba(0,108,73,0.1)', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><span className="material-symbols-outlined" style={{ fontSize: 16, color: '#006c49' }}>check_circle</span><Typography sx={{ fontSize: '0.78rem', color: '#006c49', fontWeight: 600 }}>Credentials sent to {resendTarget.email}.</Typography></Box>}

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box component="button" title="Copy to clipboard" onClick={copyResendCredentials} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1.5, px: 2, borderRadius: '0.5rem', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem', border: `1.5px solid ${resendCopied ? '#006c49' : T.surfaceHigh}`, color: resendCopied ? '#006c49' : T.textSub, bgcolor: 'transparent', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{resendCopied ? 'check' : 'content_copy'}</span>
              </Box>
              <Box component="button" onClick={closeResend} sx={{ flex: 1, py: 1.5, border: `1.5px solid ${T.surfaceHigh}`, bgcolor: 'transparent', color: T.textSub, borderRadius: '0.5rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.875rem' }}>{resendSent ? 'Close' : 'Cancel'}</Box>
              {!resendSent && (
                <Box component="button" onClick={sendResendCredentials} disabled={resendSending} sx={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 1.5, border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', borderRadius: '0.5rem', cursor: resendSending ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem', opacity: resendSending ? 0.7 : 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                  {resendSending ? 'Sending…' : 'Send New Credentials'}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </M>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: SUBSCRIPTIONS
═══════════════════════════════════════════════════════════════ */
function SubscriptionsView({ admins, setAdmins }) {
  const T = useTokens();
  const [filter, setFilter] = useState('all');
  const [savingId, setSavingId] = useState(null);

  const counts = { all: admins.length, active: admins.filter(a => a.restaurantId?.subscriptionStatus === 'active').length, trial: admins.filter(a => a.restaurantId?.subscriptionStatus === 'trial').length, inactive: admins.filter(a => a.restaurantId?.subscriptionStatus === 'inactive').length };
  const displayed = filter === 'all' ? admins : admins.filter(a => a.restaurantId?.subscriptionStatus === filter);

  async function changeSub(row, newStatus) {
    if (newStatus === row.restaurantId?.subscriptionStatus) return;
    setSavingId(row._id);
    try {
      await api.put(`/api/superadmin/restaurants/${row.restaurantId._id}`, { subscriptionStatus: newStatus });
      setAdmins(p => p.map(a => a._id === row._id ? { ...a, restaurantId: { ...a.restaurantId, subscriptionStatus: newStatus } } : a));
    } catch { } finally { setSavingId(null); }
  }

  const SUB_COLORS = { active: { bg: '#e6fff4', c: '#006c49', icon: 'verified' }, trial: { bg: '#fff4e6', c: '#884800', icon: 'timer' }, inactive: { bg: '#ffd6d6', c: '#ba1a1a', icon: 'block' } };

  return (
    <M initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 900, color: T.text, letterSpacing: '-0.025em' }}>Subscriptions</Typography>
        <Typography sx={{ color: T.textSub, fontWeight: 500, mt: 0.5 }}>Manage subscription status for all restaurants.</Typography>
      </Box>

      {/* Summary cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 5 }}>
        {[
          { label: 'All', key: 'all', icon: 'storefront', c: '#f97316' },
          { label: 'Active', key: 'active', icon: 'verified', c: '#006c49' },
          { label: 'Trial', key: 'trial', icon: 'timer', c: '#884800' },
          { label: 'Inactive', key: 'inactive', icon: 'block', c: '#ba1a1a' }
        ].map(item => (
          <StatCard
            key={item.key}
            label={item.label}
            value={counts[item.key]}
            icon={item.icon}
            color={item.c}
            onClick={() => setFilter(item.key)}
            active={filter === item.key}
            T={T}
          />
        ))}
      </Box>

      {/* Cards grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 3 }}>
        {displayed.map(row => {
          const sub = row.restaurantId?.subscriptionStatus || 'trial';
          const sc = SUB_COLORS[sub] || SUB_COLORS.trial;
          const isSaving = savingId === row._id;
          return (
            <Box key={row._id} sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 3, boxShadow: T.shadow, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '0.75rem', bgcolor: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 22, color: sc.c, fontVariationSettings: "'FILL' 1" }}>{sc.icon}</span></Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.restaurantId?.name}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>/{row.restaurantId?.slug}</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>{row.email}</Typography>
              <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>Change Status</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['trial', 'active', 'inactive'].map(s => (
                    <Box key={s} component="button" onClick={() => !isSaving && changeSub(row, s)} disabled={isSaving} sx={{
                      flex: 1, py: 0.75, border: `2px solid ${sub === s ? SUB_COLORS[s].c : T.surfaceHigh}`, bgcolor: sub === s ? `${SUB_COLORS[s].c}15` : 'transparent',
                      color: sub === s ? SUB_COLORS[s].c : T.textMuted, borderRadius: '0.5rem', cursor: isSaving ? 'not-allowed' : 'pointer',
                      fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', transition: 'all 0.2s',
                    }}>{s}</Box>
                  ))}
                </Box>
              </Box>
              {isSaving && <Typography sx={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 600 }}>Saving…</Typography>}
            </Box>
          );
        })}
      </Box>
    </M>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: ANALYTICS
═══════════════════════════════════════════════════════════════ */
function AnalyticsView({ otpStats, admins, onViewChange }) {
  const T = useTokens();
  const [restStats, setRestStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('Weekly');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [startDate, setStartDate] = useState(() => defaultDateRange(7).start);
  const [endDate, setEndDate] = useState(() => defaultDateRange(7).end);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [periodLoading, setPeriodLoading] = useState(true);

  useEffect(() => {
    api.get('/api/superadmin/restaurant-stats')
      .then(r => setRestStats(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = { from: startDate, to: endDate };
    Promise.all([
      api.get('/api/superadmin/orders/summary', { params }),
      api.get('/api/superadmin/orders/trends', { params }),
    ]).then(([summaryRes, trendsRes]) => {
      setSummary(summaryRes.data);
      setTrends(trendsRes.data);
    }).catch(() => { }).finally(() => setPeriodLoading(false));
  }, [startDate, endDate]);

  // Update date ranges automatically when timeframe segment button is clicked
  const handleTimeframeChange = (t) => {
    setTimeframe(t);
    setPage(1);
    const days = t === 'Daily' ? 1 : t === 'Weekly' ? 7 : 30;
    const range = defaultDateRange(days);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  // Format date range nicely for user display
  const formatDateDisplay = (start, end) => {
    try {
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      const sStr = new Date(start).toLocaleDateString('en-US', options);
      const eStr = new Date(end).toLocaleDateString('en-US', options);
      return `${sStr} - ${eStr}`;
    } catch {
      return `${start} - ${end}`;
    }
  };
  const dateRangeDisplay = formatDateDisplay(startDate, endDate);

  // Compute OTP totals
  const totalSent = otpStats?.reduce((s, r) => s + r.sent, 0) ?? 0;
  const totalVerified = otpStats?.reduce((s, r) => s + r.verified, 0) ?? 0;
  const conversionRate = totalSent > 0 ? Math.round(totalVerified / totalSent * 100) : 0;

  const totalOrdersVal = trends ? trends.current.reduce((a, b) => a + b, 0) : 0;
  const totalRevenueVal = summary?.totalVolume || 0;
  const avgOrderValue = summary?.avgOrderValue || 0;
  const volumeTrend = formatPct(summary?.totalVolumeChangePct);
  const avgOrderTrend = formatPct(summary?.avgOrderValueChangePct);

  // Sort restaurants based on timeframe/criteria
  const sortedPerformers = [...restStats].sort((a, b) => {
    if (timeframe === 'Daily') {
      return (b.recentOrders || 0) - (a.recentOrders || 0);
    }
    return (b.totalRevenue || 0) - (a.totalRevenue || 0);
  });

  // Top 3 performers
  const topPerformers = sortedPerformers.slice(0, 3);

  // Pagination for OTP stats
  const itemsPerPage = 4;
  const totalPages = Math.ceil((otpStats?.length || 0) / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedOtpStats = (otpStats || []).slice(startIndex, startIndex + itemsPerPage);

  return (
    <M initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

      {/* ─── Top Filter Controls ─── */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 4 }}>

        {/* Daily / Weekly / Monthly toggle */}
        <Box sx={{ display: 'flex', bgcolor: T.surface, p: 0.5, borderRadius: '9999px', border: `1px solid ${T.border || 'rgba(0,0,0,0.06)'}`, width: 'fit-content', boxShadow: T.shadow }}>
          {['Daily', 'Weekly', 'Monthly'].map(t => (
            <Box
              component="button"
              key={t}
              onClick={() => handleTimeframeChange(t)}
              sx={{
                px: { xs: 2.5, sm: 4 }, py: 1, borderRadius: '9999px', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700,
                bgcolor: timeframe === t ? '#f97316' : 'transparent',
                color: timeframe === t ? '#fff' : T.textSub,
                transition: 'all 0.2s',
              }}
            >
              {t}
            </Box>
          ))}
        </Box>

        {/* Date Selector & Action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>

          {/* Date range picker selector container */}
          <Box sx={{ position: 'relative' }}>
            <Box
              onClick={() => setDateMenuOpen(!dateMenuOpen)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25,
                bgcolor: T.surface, border: `1.5px solid ${T.border || 'rgba(0,0,0,0.06)'}`,
                borderRadius: '0.5rem', boxShadow: T.shadow, cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: T.surfaceAlt }
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.textSub }}>calendar_month</span>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: T.textSub }}>
                {dateRangeDisplay}
              </Typography>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.textMuted }}>keyboard_arrow_down</span>
            </Box>

            {/* Date Range Dropdown Popover */}
            {dateMenuOpen && (
              <Box sx={{
                position: 'absolute', top: '120%', right: 0, zIndex: 100,
                width: 280, bgcolor: T.surface, p: 2.5, borderRadius: '0.75rem',
                border: `1.5px solid ${T.border || 'rgba(0,0,0,0.06)'}`,
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                display: 'flex', flexDirection: 'column', gap: 2
              }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: T.text }}>Date Range Presets</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {[
                    { label: 'Today (1 day)', days: 1 },
                    { label: 'Last 7 Days', days: 7 },
                    { label: 'Last 30 Days', days: 30 }
                  ].map(preset => (
                    <Box
                      component="button"
                      key={preset.label}
                      onClick={() => {
                        const range = defaultDateRange(preset.days);
                        setStartDate(range.start);
                        setEndDate(range.end);
                        setDateMenuOpen(false);
                      }}
                      sx={{
                        textAlign: 'left', p: 1, border: 'none', bgcolor: 'transparent',
                        borderRadius: '0.375rem', cursor: 'pointer', color: T.textSub,
                        fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.15s',
                        '&:hover': { bgcolor: T.surfaceAlt, color: '#f97316' }
                      }}
                    >
                      {preset.label}
                    </Box>
                  ))}
                </Box>
                <Box sx={{ borderTop: `1px solid ${T.border || 'rgba(0,0,0,0.06)'}`, pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: T.textSub, mb: 0.5, textTransform: 'uppercase' }}>Start Date</Typography>
                    <Box component="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} sx={{ width: '100%', px: 1.5, py: 1, border: `1px solid ${T.border || 'rgba(0,0,0,0.06)'}`, borderRadius: '0.375rem', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: T.text, bgcolor: T.surfaceAlt }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: T.textSub, mb: 0.5, textTransform: 'uppercase' }}>End Date</Typography>
                    <Box component="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} sx={{ width: '100%', px: 1.5, py: 1, border: `1px solid ${T.border || 'rgba(0,0,0,0.06)'}`, borderRadius: '0.375rem', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: T.text, bgcolor: T.surfaceAlt }} />
                  </Box>
                  <Box component="button" onClick={() => setDateMenuOpen(false)} sx={{ py: 1, bgcolor: '#f97316', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', '&:hover': { bgcolor: '#ea580c' } }}>
                    Apply Custom Range
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Advanced Filters */}
          <Box
            component="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 3.5, py: 1.5,
              bgcolor: '#f97316', color: '#fff', borderRadius: '0.5rem', border: 'none',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700,
              boxShadow: '0 4px 12px rgba(249,115,22,0.15)',
              '&:hover': { bgcolor: '#ea580c' }, transition: 'all 0.2s'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_alt</span>
            Advanced Filters
          </Box>

          {/* Download button */}
          <Box
            component="button"
            title="Download CSV"
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1.5,
              bgcolor: T.surface, border: `1.5px solid ${T.border || 'rgba(0,0,0,0.06)'}`, borderRadius: '0.5rem',
              cursor: 'pointer', color: T.textSub, '&:hover': { bgcolor: T.surfaceAlt }, transition: 'all 0.2s',
              height: 46, width: 46, boxSizing: 'border-box'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
          </Box>

        </Box>
      </Box>

      {/* Advanced Filters dropdown panel */}
      {filtersOpen && (
        <M
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          sx={{ mb: 4, bgcolor: T.surface, p: 3, borderRadius: '0.75rem', border: `1.5px solid ${T.border || 'rgba(0,0,0,0.06)'}`, boxShadow: T.shadow }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: T.text, mb: 1.5 }}>Filter by Restaurant</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Box component="button" sx={{ px: 2.5, py: 1, bgcolor: '#f9731615', border: '1.5px solid #f97316', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#f97316', cursor: 'pointer' }}>All Restaurants</Box>
            {restStats.map(r => (
              <Box key={r.name} component="button" sx={{ px: 2.5, py: 1, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: T.textSub, cursor: 'pointer', '&:hover': { borderColor: '#f97316', color: '#f97316' } }}>{r.name}</Box>
            ))}
          </Box>
        </M>
      )}

      {/* ─── Cards Grid ─── */}
      {!periodLoading && summary && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 3 }, mb: 4 }}>
          <StatCard
            label="Total Order Volume"
            value={formatCurrency(totalRevenueVal)}
            icon="bar_chart"
            color="#f97316"
            trend={{ direction: volumeTrend.color === '#22c55e' ? 'up' : 'down', text: `${volumeTrend.text} vs previous period` }}
            T={T}
          />
          <StatCard
            label="Avg. Order Value"
            value={formatCurrency(avgOrderValue)}
            icon="payments"
            color="#3b82f6"
            trend={{ direction: avgOrderTrend.color === '#22c55e' ? 'up' : 'down', text: `${avgOrderTrend.text} vs previous period` }}
            T={T}
          />
          <StatCard
            label="Total Orders"
            value={totalOrdersVal}
            icon="shopping_bag"
            color="#006c49"
            subtext={`${admins.length} active locations`}
            T={T}
          />
        </Box>
      )}

      {/* ─── Middle Section: Restaurant Performance Insights & Top Performers ─── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4, mb: 4 }}>

        {/* Left Side: Restaurant Performance Insights */}
        <Box sx={{ bgcolor: T.surface, p: 3.5, borderRadius: '1rem', border: `1.5px solid ${T.border || 'rgba(0,0,0,0.06)'}`, boxShadow: T.shadow }}>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: T.text }}>Restaurant Performance</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: T.textMuted, mt: 0.25 }}>Real-time platform sales and order distributions</Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#f97316' }} />
            </Box>
          ) : sortedPerformers.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center', color: T.textSub }}>No restaurant data found.</Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: T.surfaceAlt || 'rgba(0,0,0,0.02)' }}>
                    {['Rank', 'Restaurant', 'Orders', 'Recent Orders', 'Revenue'].map((h, i) => (
                      <TableCell key={h} sx={{ py: 1.5, px: 2, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textSub, borderBottom: 'none' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedPerformers.slice(0, 5).map((row, idx) => (
                    <TableRow key={String(row.restaurantId)} sx={{ '&:hover': { bgcolor: T.surfaceAlt || 'rgba(0,0,0,0.01)' } }}>
                      <TableCell sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${T.border || 'rgba(0,0,0,0.05)'}`, fontWeight: 800, color: '#f97316', fontSize: '0.85rem' }}>
                        #{idx + 1}
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${T.border || 'rgba(0,0,0,0.05)'}` }}>
                        <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.85rem' }}>{row.name}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: T.textMuted }}>/{row.slug}</Typography>
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${T.border || 'rgba(0,0,0,0.05)'}`, fontWeight: 700, color: T.textSub, fontSize: '0.85rem' }}>
                        {row.totalOrders}
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${T.border || 'rgba(0,0,0,0.05)'}`, fontWeight: 700, color: T.textSub, fontSize: '0.85rem' }}>
                        {row.recentOrders || 0}
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${T.border || 'rgba(0,0,0,0.05)'}`, fontWeight: 800, color: T.text, fontSize: '0.875rem' }}>
                        {formatCurrency(row.totalRevenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Right Side: Top Performers (Styled dark capsule box matching design layout) */}
        <Box sx={{
          bgcolor: '#1f130b', color: '#fff', p: 3.5, borderRadius: '1rem',
          boxShadow: T.shadow, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', mb: 3 }}>Top Performers</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} sx={{ color: '#f97316' }} /></Box>
            ) : topPerformers.length === 0 ? (
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>No data available</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                {topPerformers.map((rest, i) => (
                  <Box key={rest.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* Rank Circle */}
                      <Box sx={{
                        width: 28, height: 28, borderRadius: '50%', bgcolor: '#f97316',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.8rem', color: '#fff'
                      }}>
                        {i + 1}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.875rem' }}>{rest.name}</Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{rest.totalOrders} Orders</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{formatCurrency(rest.totalRevenue)}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box
            component="button"
            onClick={() => onViewChange('restaurants')}
            sx={{
              width: '100%', py: 1.75, mt: 4, bgcolor: 'transparent', color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: '9999px',
              fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: '#fff' }
            }}
          >
            View All Locations
          </Box>
        </Box>
      </Box>

      {/* ─── Bottom Section: OTP Verification Rates Table ─── */}
      {otpStats && otpStats.length > 0 && (
        <Box sx={{ bgcolor: T.surface, borderRadius: '1rem', overflow: 'hidden', border: `1.5px solid ${T.border || 'rgba(0,0,0,0.06)'}`, boxShadow: T.shadow, mb: 4 }}>

          {/* Table Header Controls */}
          <Box sx={{ p: 3, borderBottom: `1px solid ${T.border || 'rgba(0,0,0,0.06)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: T.text }}>OTP Verification Rates</Typography>
            <Box
              component="button"
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5, px: 2, py: 1,
                bgcolor: T.surfaceAlt, border: `1px solid ${T.border || 'rgba(0,0,0,0.06)'}`, borderRadius: '0.5rem',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: T.textSub
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>table_chart</span>
              Table View
            </Box>
          </Box>

          {/* OTP Table */}
          <TableContainer>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: T.surfaceAlt || 'rgba(0,0,0,0.02)' }}>
                  {['Restaurant', 'OTPs Sent', 'Verified', 'Conversion Rate'].map(h => (
                    <TableCell key={h} sx={{ py: 2, px: 3, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textSub, borderBottom: 'none' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOtpStats.map(row => {
                  const rate = row.sent > 0 ? Math.round(row.verified / row.sent * 100) : 0;
                  return (
                    <TableRow key={String(row.restaurantId)} sx={{ '&:hover': { bgcolor: T.surfaceAlt || 'rgba(0,0,0,0.01)' } }}>
                      {/* Restaurant */}
                      <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border || 'rgba(0,0,0,0.05)'}` }}>
                        <Typography sx={{ fontWeight: 800, color: T.text, fontSize: '0.875rem' }}>{row.name}</Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: T.textMuted }}>/{row.slug}</Typography>
                      </TableCell>
                      {/* Sent */}
                      <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border || 'rgba(0,0,0,0.05)'}`, fontWeight: 800, color: T.text, fontSize: '0.85rem' }}>
                        {row.sent}
                      </TableCell>
                      {/* Verified */}
                      <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border || 'rgba(0,0,0,0.05)'}`, fontWeight: 800, color: '#22c55e', fontSize: '0.85rem' }}>
                        {row.verified}
                      </TableCell>
                      {/* Conversion */}
                      <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border || 'rgba(0,0,0,0.05)'}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ flex: 1, height: 6, bgcolor: T.surfaceAlt || 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                            <Box sx={{
                              height: '100%', width: `${rate}%`,
                              bgcolor: rate > 75 ? '#22c55e' : rate > 30 ? '#ea580c' : '#ef4444',
                              borderRadius: 3, transition: 'width 0.5s ease-out'
                            }} />
                          </Box>
                          <Typography sx={{ fontWeight: 850, color: T.text, fontSize: '0.85rem', minWidth: 36, textAlign: 'right' }}>
                            {rate}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Pagination Footer */}
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: T.surfaceAlt || 'rgba(0,0,0,0.02)' }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, otpStats.length)} of {otpStats.length} locations
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Prev Page Button */}
              <Box
                component="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                sx={{
                  px: 1.5, py: 1, border: `1px solid ${T.border || 'rgba(0,0,0,0.06)'}`,
                  bgcolor: T.surface, color: T.textSub, borderRadius: '0.375rem', cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_left</span>
              </Box>
              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <Box
                  component="button"
                  key={n}
                  onClick={() => setPage(n)}
                  sx={{
                    width: 32, height: 32, border: 'none',
                    bgcolor: page === n ? '#f97316' : 'transparent',
                    color: page === n ? '#fff' : T.textSub,
                    borderRadius: '0.375rem', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.8rem',
                    transition: 'all 0.15s'
                  }}
                >
                  {n}
                </Box>
              ))}
              {/* Next Page Button */}
              <Box
                component="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                sx={{
                  px: 1.5, py: 1, border: `1px solid ${T.border || 'rgba(0,0,0,0.06)'}`,
                  bgcolor: T.surface, color: T.textSub, borderRadius: '0.375rem', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
              </Box>
            </Box>
          </Box>

        </Box>
      )}

    </M>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: USERS
═══════════════════════════════════════════════════════════════ */
function UsersView({ admins, setAdmins }) {
  const T = useTokens();
  const [search, setSearch] = useState('');
  const [resetTarget, setResetTarget] = useState(null); // { _id, email }
  const [newPw, setNewPw] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const filtered = admins.filter(a => {
    const q = search.toLowerCase();
    return a.email.toLowerCase().includes(q) || (a.restaurantId?.name || '').toLowerCase().includes(q);
  });

  async function handleToggleActive(row) {
    setTogglingId(row._id);
    try {
      const { data } = await api.put(`/api/superadmin/admins/${row._id}`, { isActive: !row.isActive });
      setAdmins(p => p.map(a => a._id === data._id ? data : a));
    } catch { } finally { setTogglingId(null); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this admin account?')) return;
    setDeletingId(id);
    try { await api.delete(`/api/superadmin/admins/${id}`); setAdmins(p => p.filter(a => a._id !== id)); }
    catch { } finally { setDeletingId(null); }
  }

  async function handleResetPassword() {
    if (!newPw || newPw.length < 6) return;
    setResetting(true); setResetMsg('');
    try {
      await api.post(`/api/superadmin/admins/${resetTarget._id}/reset-password`, { newPassword: newPw });
      setResetMsg('Password reset successfully.');
      setTimeout(() => { setResetTarget(null); setNewPw(''); setResetMsg(''); }, 1500);
    } catch (err) { setResetMsg(err.response?.data?.message || 'Failed'); }
    finally { setResetting(false); }
  }

  return (
    <M initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5, gap: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 900, color: T.text, letterSpacing: '-0.025em' }}>Admin Users</Typography>
          <Typography sx={{ color: T.textSub, fontWeight: 500, mt: 0.5 }}>{admins.length} admin accounts</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: T.surface, px: 2, py: 1, borderRadius: '9999px', border: `1px solid ${T.border}`, gap: 1, minWidth: 240 }}>
          <span className="material-symbols-outlined" style={{ color: T.textMuted, fontSize: 16 }}>search</span>
          <Box component="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" sx={{ border: 'none', bgcolor: 'transparent', outline: 'none', fontSize: '0.875rem', color: T.text, fontFamily: 'Inter, sans-serif', width: '100%', '&::placeholder': { color: T.textMuted } }} />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)', xl: 'repeat(3,1fr)' }, gap: 3 }}>
        {filtered.map(row => {
          const isActive = row.isActive !== false;
          return (
            <Box key={row._id} sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 3, boxShadow: T.shadow, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(249,115,22,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#f97316', fontSize: '1.1rem', flexShrink: 0 }}>{row.email[0].toUpperCase()}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.email}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>Restaurant: {row.restaurantId?.name || '—'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isActive ? '#006c49' : '#ba1a1a' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? '#006c49' : '#ba1a1a' }}>{isActive ? 'Active' : 'Off'}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, pt: 1, borderTop: `1px solid ${T.surfaceHigh}` }}>
                <Box component="button" onClick={() => handleToggleActive(row)} disabled={togglingId === row._id} sx={{ flex: 1, py: 1, border: `1px solid ${T.border}`, bgcolor: 'transparent', color: T.textSub, borderRadius: '0.5rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.2s', '&:hover': { borderColor: isActive ? '#ba1a1a' : '#006c49', color: isActive ? '#ba1a1a' : '#006c49' } }}>
                  {togglingId === row._id ? '…' : (isActive ? 'Disable' : 'Enable')}
                </Box>
                <Box component="button" onClick={() => { setResetTarget({ _id: row._id, email: row.email }); setNewPw(''); setResetMsg(''); }} sx={{ flex: 1, py: 1, border: `1px solid ${T.border}`, bgcolor: 'transparent', color: T.textSub, borderRadius: '0.5rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.2s', '&:hover': { borderColor: '#f97316', color: '#f97316' } }}>
                  Reset Pwd
                </Box>
                <Box component="button" onClick={() => handleDelete(row._id)} disabled={deletingId === row._id} sx={{ py: 1, px: 1.5, border: `1px solid ${T.border}`, bgcolor: 'transparent', color: T.textMuted, borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', '&:hover': { borderColor: '#ba1a1a', color: '#ba1a1a' } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{deletingId === row._id ? 'hourglass_empty' : 'delete'}</span>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.7rem', color: T.textMuted }}>Joined {fmtDate(row.createdAt)} · {(row.disabledFeatures || []).length === 0 ? 'All features on' : `${(row.disabledFeatures || []).length} feature(s) disabled`}</Typography>
            </Box>
          );
        })}
      </Box>

      {/* Reset password modal */}
      {resetTarget && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <Box onClick={() => setResetTarget(null)} sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <Box sx={{ position: 'relative', zIndex: 1, bgcolor: T.surface, borderRadius: '1rem', p: 4, width: '100%', maxWidth: 400, boxShadow: '0 24px 56px rgba(0,0,0,0.2)' }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: T.text, mb: 0.5 }}>Reset Password</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: T.textMuted, mb: 3 }}>{resetTarget.email}</Typography>
            <Box component="input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password (min. 6 chars)" sx={{ width: '100%', px: 2, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', color: T.text, outline: 'none', boxSizing: 'border-box', mb: 2, '&:focus': { borderColor: '#f97316' } }} />
            {resetMsg && <Typography sx={{ fontSize: '0.8rem', color: resetMsg.includes('success') ? '#006c49' : '#ba1a1a', mb: 2, fontWeight: 600 }}>{resetMsg}</Typography>}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box component="button" onClick={() => setResetTarget(null)} sx={{ flex: 1, py: 1.5, border: `1.5px solid ${T.surfaceHigh}`, bgcolor: 'transparent', color: T.textSub, borderRadius: '0.5rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.875rem' }}>Cancel</Box>
              <Box component="button" onClick={handleResetPassword} disabled={resetting || newPw.length < 6} sx={{ flex: 2, py: 1.5, border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', borderRadius: '0.5rem', cursor: resetting || newPw.length < 6 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem', opacity: resetting || newPw.length < 6 ? 0.6 : 1 }}>{resetting ? 'Resetting…' : 'Reset Password'}</Box>
            </Box>
          </Box>
        </Box>
      )}
    </M>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: TICKETS (placeholder)
═══════════════════════════════════════════════════════════════ */
function TicketsView() {
  const T = useTokens();
  const MOCK = [
    { id: 'TKT-001', restaurant: 'The Spice Garden', issue: 'Menu images not loading', priority: 'high', time: '2h ago' },
    { id: 'TKT-002', restaurant: 'Coastal Bites', issue: 'QR code not scanning', priority: 'medium', time: '5h ago' },
    { id: 'TKT-003', restaurant: 'Urban Plates', issue: 'Password reset request', priority: 'low', time: '1d ago' },
  ];
  const PCOL = { high: ['#ba1a1a', '#ffd6d6'], medium: ['#884800', '#fff4e6'], low: ['#2563eb', '#dbeafe'] };

  return (
    <M initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 900, color: T.text, letterSpacing: '-0.025em' }}>Support Tickets</Typography>
        <Typography sx={{ color: T.textSub, fontWeight: 500, mt: 0.5 }}>Restaurant support requests and issues.</Typography>
      </Box>

      <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 5, textAlign: 'center', mb: 4, boxShadow: T.shadow }}>
        <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#f97316' }}>support_agent</span>
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: T.text, mb: 0.5 }}>Ticketing System — Coming Soon</Typography>
        <Typography sx={{ color: T.textSub, fontSize: '0.875rem' }}>A full support ticket system with status tracking and email notifications is planned.</Typography>
      </Box>

      <Typography sx={{ fontWeight: 700, color: T.text, mb: 2, fontSize: '1rem' }}>Sample Queue</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {MOCK.map(t => {
          const [c, bg] = PCOL[t.priority];
          return (
            <Box key={t.id} sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 3, boxShadow: T.shadow, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '0.75rem', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="material-symbols-outlined" style={{ fontSize: 22, color: c }}>confirmation_number</span></Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9rem' }}>{t.issue}</Typography>
                  <Box component="span" sx={{ px: 1.25, py: 0.25, borderRadius: '4px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: c, bgcolor: bg }}>{t.priority}</Box>
                </Box>
                <Typography sx={{ fontSize: '0.78rem', color: T.textMuted }}>{t.restaurant} · {t.id} · {t.time}</Typography>
              </Box>
              <Box component="button" sx={{ px: 2, py: 0.75, border: `1px solid ${T.border}`, bgcolor: 'transparent', color: T.textSub, borderRadius: '0.5rem', cursor: 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600, opacity: 0.5 }}>Open</Box>
            </Box>
          );
        })}
      </Box>
    </M>
  );
}

function InquiriesView() {
  const T = useTokens();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/api/superadmin/inquiries')
      .then(res => { if (active) setInquiries(res.data); })
      .catch(err => console.error('Failed to load inquiries', err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <M initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 900, color: T.text, letterSpacing: '-0.025em' }}>Inquiries</Typography>
        <Typography sx={{ color: T.textSub, fontWeight: 500, mt: 0.5 }}>Messages submitted through the website contact form.</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} sx={{ color: '#f97316' }} /></Box>
      ) : inquiries.length === 0 ? (
        <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 5, textAlign: 'center', boxShadow: T.shadow }}>
          <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#f97316' }}>mail</span>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: T.text, mb: 0.5 }}>No inquiries yet</Typography>
          <Typography sx={{ color: T.textSub, fontSize: '0.875rem' }}>Submissions from the website "Contact Us" form will appear here.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {inquiries.map(inq => {
            const isOpen = expanded === inq._id;
            return (
              <Box key={inq._id} onClick={() => setExpanded(isOpen ? null : inq._id)}
                sx={{ bgcolor: T.surface, borderRadius: '0.75rem', p: 3, boxShadow: T.shadow, cursor: 'pointer' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '0.75rem', bgcolor: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#ea580c' }}>mail</span>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9rem' }}>{inq.name}</Typography>
                      {inq.subject && (
                        <Box component="span" sx={{ px: 1.25, py: 0.25, borderRadius: '4px', fontSize: '10px', fontWeight: 700, color: '#ea580c', bgcolor: 'rgba(249,115,22,0.1)' }}>{inq.subject}</Box>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '0.78rem', color: T.textMuted }}>{inq.email}{inq.phone ? ` · ${inq.phone}` : ''} · {fmtDate(inq.createdAt)}</Typography>
                    {!isOpen && (
                      <Typography sx={{ fontSize: '0.82rem', color: T.textSub, mt: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inq.message}</Typography>
                    )}
                  </Box>
                  <span className="material-symbols-outlined" style={{ color: T.textMuted, fontSize: 20, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>expand_more</span>
                </Box>
                {isOpen && (
                  <Typography sx={{ fontSize: '0.85rem', color: T.text, mt: 2, pt: 2, borderTop: `1px solid ${T.border || 'rgba(0,0,0,0.06)'}`, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{inq.message}</Typography>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </M>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LAYOUT
═══════════════════════════════════════════════════════════════ */
const SA_NAV = [
  { label: 'Dashboard', icon: 'dashboard', view: 'dashboard' },
  { label: 'Restaurants', icon: 'restaurant', view: 'restaurants' },
  { label: 'Subscriptions', icon: 'payments', view: 'subscriptions' },
  { label: 'Analytics', icon: 'analytics', view: 'analytics' },
  { label: 'Users', icon: 'group', view: 'users' },
  { label: 'Inquiries', icon: 'mail', view: 'inquiries' },
  { label: 'Tickets', icon: 'support_agent', view: 'tickets' },
];

export default function SuperAdminDashboard() {
  const T = useTokens();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState(() => {
    return sessionStorage.getItem('sa_active_view') || 'dashboard';
  });

  useEffect(() => {
    sessionStorage.setItem('sa_active_view', activeView);
  }, [activeView]);

  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [otpStats, setOtpStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  function handleRestaurantCreated(data) {
    setAdmins(prev => [{
      _id: data.admin._id, email: data.admin.email,
      restaurantId: data.restaurant, isActive: data.admin.isActive, createdAt: data.admin.createdAt,
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
    } catch (err) {
      console.error("Failed to load superadmin stats", err);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = () => { localStorage.removeItem('saToken'); navigate('/superadmin-login'); };

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo Header */}
      <Box sx={{ px: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1.5 }}>
        {!collapsed ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="img" src={logo} alt="ScanIt" sx={{ height: '8vh', maxHeight: '50px', width: 'auto' }} />
          </Box>
        ) : (
          <Box component="img" src={logo} alt="ScanIt" sx={{ height: 100, width: 32, objectFit: 'contain' }} />
        )}
      </Box>

      {!collapsed && (
        <Typography sx={{ px: 2, mb: 2, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, fontWeight: 700, textAlign: 'center' }}>
          Premium Dining Admin
        </Typography>
      )}

      {/* Navigation */}
      <Box component="nav" sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, overflowY: 'auto' }}>
        {SA_NAV.map(item => {
          const isActive = activeView === item.view;
          return (
            <Box component="button" key={item.label}
              onClick={() => { setActiveView(item.view); setMobileSidebarOpen(false); }}
              title={collapsed ? item.label : undefined}
              sx={{
                display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 1.5, px: collapsed ? 0 : 2, py: 1.5,
                borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s', width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
                color: isActive ? '#ea580c' : T.textMuted, fontWeight: isActive ? 700 : 500,
                bgcolor: isActive ? T.surfaceAlt : 'transparent',
                boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                '&:hover': { color: '#ea580c', bgcolor: isActive ? T.surfaceAlt : 'rgba(255,255,255,0.5)' }
              }}
            >
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1", fontSize: 20 } : { fontSize: 20 }}>{item.icon}</span>
              {!collapsed && (
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 'inherit', color: 'inherit', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.label}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Footer Controls */}
      <Box sx={{ mt: 'auto', px: 2, py: 2, borderTop: `1px solid ${T.border || 'rgba(0,0,0,0.06)'}`, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {!collapsed ? (
          <Box
            component="button"
            onClick={() => setOnboardOpen(true)}
            sx={{
              width: '100%',
              background: 'linear-gradient(to bottom right, #f97316, #ea580c)',
              color: '#fff',
              py: 1.5,
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.875rem',
              boxShadow: '0 4px 12px rgba(249,115,22,0.2)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              '&:active': { transform: 'scale(0.95)' }
            }}
          >
            + New Restaurant
          </Box>
        ) : (
          <Box
            component="button"
            onClick={() => setOnboardOpen(true)}
            title="New Restaurant"
            sx={{
              width: 36, height: 36, mx: 'auto',
              background: 'linear-gradient(to bottom right, #f97316, #ea580c)',
              color: '#fff',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(249,115,22,0.2)',
              border: 'none',
              cursor: 'pointer',
              '&:active': { transform: 'scale(0.95)' }
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          </Box>
        )}

        <Box
          component="button"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          sx={{
            display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 1.5, py: 1, px: collapsed ? 1 : 2,
            width: collapsed ? 'auto' : '100%', justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: '9999px', border: 'none', bgcolor: 'transparent', cursor: 'pointer',
            color: T.textSub, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            '&:hover': { color: '#ba1a1a', bgcolor: 'rgba(186,26,26,0.06)' }
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
          {!collapsed && (
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Logout
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text }}>

      {/* ─── Top Nav ─── */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: { md: collapsed ? '72px' : '256px' },
          zIndex: 50,
          display: 'flex',
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
          {/* Mobile hamburger */}
          <Box component="button" onClick={() => setMobileSidebarOpen(v => !v)} sx={{ display: { md: 'none' }, p: 1, border: 'none', bgcolor: 'transparent', cursor: 'pointer', color: T.textSub }}>
            <span className="material-symbols-outlined">menu</span>
          </Box>
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
          <Box sx={{ position: 'relative', display: 'flex', cursor: 'pointer', p: 1, borderRadius: '50%', '&:hover': { bgcolor: T.surfaceAlt } }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: T.textSub }}>notifications</span>
            <Box sx={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, bgcolor: '#ea580c', borderRadius: '50%', border: '2px solid #fff' }} />
          </Box>
          <Box component="button" onClick={fetchAll} sx={{ p: 1, borderRadius: '50%', color: T.textSub, border: 'none', cursor: 'pointer', bgcolor: 'transparent', display: 'flex', '&:hover': { bgcolor: T.surfaceAlt } }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>refresh</span>
          </Box>
          <Box sx={{ width: '1.5px', height: 24, bgcolor: T.border || 'rgba(0,0,0,0.08)', mx: 1.5, flexShrink: 0 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: T.text, lineHeight: 1.1, whiteSpace: 'nowrap' }}>Super Admin</Typography>
              <Typography sx={{ fontSize: '9px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em', mt: 0.25, whiteSpace: 'nowrap' }}>OPERATIONAL MODE</Typography>
            </Box>
            <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>SA</Box>
          </Box>
        </Box>
      </Box>

      {/* ─── Mobile sidebar overlay ─── */}
      {mobileSidebarOpen && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 45 }}>
          <Box onClick={() => setMobileSidebarOpen(false)} sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)' }} />
          <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 280, bgcolor: T.bg, p: 3, pt: 10, zIndex: 1, overflowY: 'auto' }}>{sidebarContent}</Box>
        </Box>
      )}

      {/* ─── Desktop Side Nav ─── */}
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
        }}
      >
        {sidebarContent}
      </M>

      {/* ─── Main Content ─── */}
      <Box
        component="main"
        sx={{
          ml: { md: collapsed ? '72px' : '256px' },
          pt: 12,
          pb: 6,
          px: { xs: 3, md: 6 },
          minHeight: '100vh',
          width: '100%',
          maxWidth: { md: collapsed ? 'calc(100% - 72px)' : 'calc(100% - 256px)', xl: 1280 },
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto', pt: 4 }}>
          {activeView === 'dashboard' && <DashboardView stats={stats} admins={admins} otpStats={otpStats} loading={loading} onViewChange={setActiveView} />}
          {activeView === 'restaurants' && <RestaurantsView stats={stats} admins={admins} setAdmins={setAdmins} otpStats={otpStats} loading={loading} onViewChange={setActiveView} />}
          {activeView === 'subscriptions' && <SubscriptionsView admins={admins} setAdmins={setAdmins} />}
          {activeView === 'analytics' && <AnalyticsView stats={stats} otpStats={otpStats} admins={admins} onViewChange={setActiveView} />}
          {activeView === 'users' && <UsersView admins={admins} setAdmins={setAdmins} />}
          {activeView === 'inquiries' && <InquiriesView />}
          {activeView === 'tickets' && <TicketsView />}
        </Box>
      </Box>

      <OnboardingModal open={onboardOpen} onClose={() => setOnboardOpen(false)} onCreated={handleRestaurantCreated} />
    </Box>
  );
}
