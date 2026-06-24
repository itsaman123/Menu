import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
} from '@mui/material';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

const M = motion.create(Box);
const SA_FEATURES = ['menu', 'orders', 'qr', 'employees'];

/* ─── helpers ─────────────────────────────────────────────────── */
function toSlug(v) { return v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
function formatCurrency(n) {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000)   return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${n.toFixed(0)}`;
}
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

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
            {STEPS.map((label, i) => { const idx = i + 1; const done = step > idx; const active = step === idx; return (
              <Box key={label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: '100%', height: 4, borderRadius: 2, bgcolor: done || active ? '#f97316' : T.surfaceHigh, transition: 'background-color 0.3s' }} />
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: done || active ? '#f97316' : T.textMuted }}>{done ? '✓ ' : ''}{label}</Typography>
              </Box>
            ); })}
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
  const CHART_BARS = [
    { label: 'Jan', h: '40%' }, { label: 'Feb', h: '28%' }, { label: 'Mar', h: '35%' },
    { label: 'Apr', h: '50%', primary: true }, { label: 'May', h: '42%' }, { label: 'Jun', h: '60%', primary: true },
  ];
  const STAT_CARDS = stats ? [
    { label: 'Total Restaurants', value: String(stats.totalAdmins),   icon: 'storefront',    sub: `${stats.activeAdmins} active` },
    { label: 'Total Orders',      value: stats.totalOrders >= 1000 ? `${(stats.totalOrders/1000).toFixed(1)}k` : String(stats.totalOrders), icon: 'shopping_bag', sub: 'all time' },
    { label: 'Platform Revenue',  value: formatCurrency(stats.totalRevenue), icon: 'payments', sub: 'all time' },
    { label: 'Active Accounts',   value: String(stats.activeAdmins),  icon: 'verified_user', sub: `${stats.totalAdmins > 0 ? Math.round(stats.activeAdmins/stats.totalAdmins*100) : 0}% retention` },
  ] : [];

  return (
    <M initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 900, color: T.text, mb: 0.5, letterSpacing: '-0.025em' }}>Platform Overview</Typography>
        <Typography sx={{ color: T.textSub, fontWeight: 500 }}>{loading ? 'Loading…' : `Monitoring growth across ${stats?.totalAdmins ?? 0} partner locations.`}</Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' }, gap: 3, mb: 5 }}>
        {loading ? <Box sx={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#f97316' }} /></Box>
          : STAT_CARDS.map(s => (
            <Box key={s.label} sx={{ bgcolor: T.surface, p: 3, borderRadius: '0.5rem', position: 'relative', overflow: 'hidden', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.02)' } }}>
              <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, opacity: 0.1 }}><span className="material-symbols-outlined" style={{ fontSize: 60, color: '#f97316' }}>{s.icon}</span></Box>
              <Typography sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, fontWeight: 700, mb: 1 }}>{s.label}</Typography>
              <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: T.text }}>{s.value}</Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: '#006c49', fontSize: '0.875rem', fontWeight: 700 }}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4 }}>info</span>{s.sub}</Box>
            </Box>
          ))}
      </Box>

      {/* Chart + Promo */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4, mb: 5 }}>
        <Box sx={{ bgcolor: T.surface, p: 4, borderRadius: '0.5rem' }}>
          <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, color: T.text, mb: 0.5 }}>Monthly Revenue Growth</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: T.textSub, mb: 4 }}>Performance across fiscal year</Typography>
          <Box sx={{ height: 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
            {CHART_BARS.map(bar => (
              <Box key={bar.label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: '100%', bgcolor: bar.primary ? '#f97316' : T.surfaceHigh, borderRadius: '0.5rem 0.5rem 0 0', height: bar.h, transition: 'background-color 0.3s', '&:hover': { bgcolor: '#ea580c' } }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: bar.primary ? '#f97316' : T.textSub, mt: 1.5 }}>{bar.label}</Typography>
              </Box>
            ))}
          </Box>
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
function RestaurantsView({ admins, setAdmins }) {
  const T = useTokens();
  const [search, setSearch]         = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [subEditing, setSubEditing] = useState({}); // { [adminId]: status }
  const [savingId, setSavingId]     = useState(null);

  const filtered = admins.filter(a => {
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

  return (
    <M initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5, gap: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 900, color: T.text, letterSpacing: '-0.025em' }}>Restaurants</Typography>
          <Typography sx={{ color: T.textSub, fontWeight: 500, mt: 0.5 }}>{admins.length} total restaurants onboarded</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: T.surface, px: 2, py: 1, borderRadius: '9999px', border: `1px solid ${T.border}`, gap: 1, minWidth: 240 }}>
          <span className="material-symbols-outlined" style={{ color: T.textMuted, fontSize: 16 }}>search</span>
          <Box component="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants…" sx={{ border: 'none', bgcolor: 'transparent', outline: 'none', fontSize: '0.875rem', color: T.text, fontFamily: 'Inter, sans-serif', width: '100%', '&::placeholder': { color: T.textMuted } }} />
        </Box>
      </Box>

      <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: T.shadow }}>
        <TableContainer><Table sx={{ minWidth: 700 }}>
          <TableHead><TableRow sx={{ bgcolor: T.surfaceAlt }}>
            {['Restaurant', 'Admin Email', 'Subscription', 'Account', 'Joined', 'Actions'].map(h => (
              <TableCell key={h} sx={{ py: 2, px: 3, color: T.textSub, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, borderBottom: 'none' }}>{h}</TableCell>
            ))}
          </TableRow></TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} sx={{ py: 8, textAlign: 'center', color: T.textSub, borderBottom: 'none' }}>No restaurants found.</TableCell></TableRow>
            ) : filtered.map(row => {
              const rest    = row.restaurantId;
              const isActive = row.isActive !== false;
              const disabled = row.disabledFeatures || [];
              const isExpanded = expandedId === row._id;
              const curSub  = subEditing[row._id] ?? rest?.subscriptionStatus ?? 'trial';
              return (
                <React.Fragment key={row._id}>
                  <TableRow sx={{ '&:hover': { bgcolor: T.surfaceAlt }, transition: 'background 0.15s' }}>
                    {/* Restaurant */}
                    <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 38, height: 38, borderRadius: 1, bgcolor: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#f97316', fontSize: '0.9rem', flexShrink: 0 }}>{(rest?.name || '?')[0].toUpperCase()}</Box>
                        <Box><Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem' }}>{rest?.name || '—'}</Typography><Typography sx={{ fontSize: '0.7rem', color: T.textMuted }}>/{rest?.slug}</Typography></Box>
                      </Box>
                    </TableCell>
                    {/* Email */}
                    <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}`, color: T.textSub, fontSize: '0.875rem' }}>{row.email}</TableCell>
                    {/* Subscription */}
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
                    {/* Account status */}
                    <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => togglingId !== row._id && handleToggleActive(row)}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isActive ? '#006c49' : '#884800' }} />
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: isActive ? '#006c49' : '#884800' }}>{togglingId === row._id ? '…' : (isActive ? 'Active' : 'Disabled')}</Typography>
                      </Box>
                    </TableCell>
                    {/* Joined */}
                    <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}`, color: T.textSub, fontSize: '0.875rem' }}>{fmtDate(row.createdAt)}</TableCell>
                    {/* Actions */}
                    <TableCell sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box component="button" title="Manage Features" onClick={() => setExpandedId(isExpanded ? null : row._id)} sx={{ p: 1, border: 'none', bgcolor: isExpanded ? 'rgba(249,115,22,0.1)' : 'transparent', color: isExpanded ? '#f97316' : T.textMuted, borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', '&:hover': { bgcolor: T.surfaceHigh } }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>tune</span>
                        </Box>
                        <Box component="button" title="Delete" onClick={() => !deletingId && handleDelete(row._id)} sx={{ p: 1, border: 'none', bgcolor: 'transparent', color: T.textMuted, borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', '&:hover': { color: '#ba1a1a', bgcolor: 'rgba(186,26,26,0.08)' } }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{deletingId === row._id ? 'hourglass_empty' : 'delete'}</span>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                  {/* Feature toggles row */}
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ px: 3, py: 2, bgcolor: 'rgba(249,115,22,0.04)', borderBottom: `1px solid ${T.border}` }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>Feature Access</Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                          {SA_FEATURES.map(f => {
                            const enabled = !disabled.includes(f);
                            return (
                              <Box key={f} component="button" onClick={() => handleFeatureToggle(row, f)} sx={{
                                display: 'flex', alignItems: 'center', gap: 0.75, px: 2, py: 0.75, borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s',
                                bgcolor: enabled ? 'rgba(0,108,73,0.1)' : T.surfaceHigh,
                                color: enabled ? '#006c49' : T.textMuted,
                              }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{enabled ? 'check_circle' : 'cancel'}</span>
                                {f}
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
        </Table></TableContainer>
      </Box>
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 3, mb: 5 }}>
        {[{ label: 'All', key: 'all', icon: 'storefront', c: '#f97316' }, { label: 'Active', key: 'active', icon: 'verified', c: '#006c49' }, { label: 'Trial', key: 'trial', icon: 'timer', c: '#884800' }, { label: 'Inactive', key: 'inactive', icon: 'block', c: '#ba1a1a' }].map(item => (
          <Box key={item.key} onClick={() => setFilter(item.key)} sx={{ bgcolor: T.surface, p: 3, borderRadius: '0.75rem', cursor: 'pointer', border: `2px solid ${filter === item.key ? item.c : 'transparent'}`, transition: 'all 0.2s', '&:hover': { borderColor: item.c } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: `${item.c}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 18, color: item.c }}>{item.icon}</span></Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</Typography>
            </Box>
            <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: item.c }}>{counts[item.key]}</Typography>
          </Box>
        ))}
      </Box>

      {/* Cards grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 3 }}>
        {displayed.map(row => {
          const sub = row.restaurantId?.subscriptionStatus || 'trial';
          const sc  = SUB_COLORS[sub] || SUB_COLORS.trial;
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
function AnalyticsView({ stats, otpStats }) {
  const T = useTokens();
  const [restStats, setRestStats]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [sortBy, setSortBy]         = useState('revenue');

  useEffect(() => {
    api.get('/api/superadmin/restaurant-stats')
      .then(r => setRestStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...restStats].sort((a, b) => sortBy === 'revenue' ? b.totalRevenue - a.totalRevenue : b.totalOrders - a.totalOrders);
  const maxRev = sorted.length ? sorted[0].totalRevenue : 1;

  return (
    <M initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 900, color: T.text, letterSpacing: '-0.025em' }}>Analytics</Typography>
        <Typography sx={{ color: T.textSub, fontWeight: 500, mt: 0.5 }}>Platform-wide performance breakdown.</Typography>
      </Box>

      {/* Top-level totals */}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 3, mb: 5 }}>
          {[
            { label: 'Total Restaurants', value: stats.totalAdmins, icon: 'storefront', c: '#f97316' },
            { label: 'Total Orders',      value: stats.totalOrders, icon: 'receipt_long', c: '#006c49' },
            { label: 'Platform Revenue',  value: formatCurrency(stats.totalRevenue), icon: 'payments', c: '#884800' },
            { label: 'OTP Conversions',   value: `${otpStats.reduce((s,r)=>s+r.verified,0)} / ${otpStats.reduce((s,r)=>s+r.sent,0)}`, icon: 'phone_in_talk', c: '#2563eb' },
          ].map(s => (
            <Box key={s.label} sx={{ bgcolor: T.surface, p: 3, borderRadius: '0.75rem', boxShadow: T.shadow }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: `${s.c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}><span className="material-symbols-outlined" style={{ fontSize: 18, color: s.c }}>{s.icon}</span></Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>{s.label}</Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: T.text }}>{typeof s.value === 'number' ? s.value.toLocaleString('en-IN') : s.value}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Per-restaurant table */}
      <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: T.shadow, mb: 5 }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '1.125rem' }}>Revenue by Restaurant</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[{ v: 'revenue', label: 'By Revenue' }, { v: 'orders', label: 'By Orders' }].map(s => (
              <Box key={s.v} component="button" onClick={() => setSortBy(s.v)} sx={{ px: 2, py: 0.75, border: 'none', borderRadius: '9999px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700, bgcolor: sortBy === s.v ? '#f97316' : T.surfaceAlt, color: sortBy === s.v ? '#fff' : T.textSub, transition: 'all 0.2s' }}>{s.label}</Box>
            ))}
          </Box>
        </Box>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#f97316' }} /></Box>
          : sorted.length === 0 ? <Box sx={{ py: 8, textAlign: 'center', color: T.textSub }}>No order data yet.</Box>
          : (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {sorted.map((row, i) => {
                const pct = maxRev > 0 ? (row.totalRevenue / maxRev) * 100 : 0;
                return (
                  <Box key={String(row.restaurantId)}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: i < 3 ? '#f97316' : T.surfaceHigh, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, color: i < 3 ? '#fff' : T.textMuted }}>{i + 1}</Box>
                        <Box><Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem' }}>{row.name}</Typography><Typography sx={{ fontSize: '0.7rem', color: T.textMuted }}>/{row.slug}</Typography></Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 900, color: T.text, fontSize: '0.9375rem' }}>{formatCurrency(row.totalRevenue)}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: T.textMuted }}>{row.totalOrders} orders · {row.recentOrders} last 30d</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ height: 6, bgcolor: T.surfaceHigh, borderRadius: 3, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: i < 3 ? '#f97316' : T.textMuted, borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
      </Box>

      {/* OTP table */}
      {otpStats.length > 0 && (
        <Box sx={{ bgcolor: T.surface, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: T.shadow }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${T.border}` }}>
            <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '1.125rem' }}>OTP Verification Rates</Typography>
          </Box>
          <TableContainer><Table>
            <TableHead><TableRow sx={{ bgcolor: T.surfaceAlt }}>
              {['Restaurant', 'OTPs Sent', 'Verified', 'Conversion'].map(h => <TableCell key={h} sx={{ py: 1.5, px: 3, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, borderBottom: 'none' }}>{h}</TableCell>)}
            </TableRow></TableHead>
            <TableBody>
              {otpStats.map(row => {
                const rate = row.sent > 0 ? Math.round(row.verified / row.sent * 100) : 0;
                return (
                  <TableRow key={String(row.restaurantId)}>
                    <TableCell sx={{ px: 3, py: 2, borderBottom: `1px solid ${T.border}` }}>
                      <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem' }}>{row.name}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: T.textMuted }}>/{row.slug}</Typography>
                    </TableCell>
                    <TableCell sx={{ px: 3, py: 2, borderBottom: `1px solid ${T.border}`, fontWeight: 700, color: T.text }}>{row.sent}</TableCell>
                    <TableCell sx={{ px: 3, py: 2, borderBottom: `1px solid ${T.border}`, fontWeight: 700, color: '#006c49' }}>{row.verified}</TableCell>
                    <TableCell sx={{ px: 3, py: 2, borderBottom: `1px solid ${T.border}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ flex: 1, height: 6, bgcolor: T.surfaceHigh, borderRadius: 3, overflow: 'hidden' }}><Box sx={{ height: '100%', width: `${rate}%`, bgcolor: rate > 60 ? '#006c49' : rate > 30 ? '#884800' : '#ba1a1a', borderRadius: 3 }} /></Box>
                        <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem', minWidth: 36 }}>{rate}%</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table></TableContainer>
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
  const [search, setSearch]             = useState('');
  const [resetTarget, setResetTarget]   = useState(null); // { _id, email }
  const [newPw, setNewPw]               = useState('');
  const [resetting, setResetting]       = useState(false);
  const [resetMsg, setResetMsg]         = useState('');
  const [togglingId, setTogglingId]     = useState(null);
  const [deletingId, setDeletingId]     = useState(null);

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
    { id: 'TKT-002', restaurant: 'Coastal Bites',    issue: 'QR code not scanning',    priority: 'medium', time: '5h ago' },
    { id: 'TKT-003', restaurant: 'Urban Plates',     issue: 'Password reset request',   priority: 'low',    time: '1d ago' },
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

/* ═══════════════════════════════════════════════════════════════
   MAIN LAYOUT
═══════════════════════════════════════════════════════════════ */
const SA_NAV = [
  { label: 'Dashboard',     icon: 'dashboard',     view: 'dashboard' },
  { label: 'Restaurants',   icon: 'restaurant',    view: 'restaurants' },
  { label: 'Subscriptions', icon: 'payments',      view: 'subscriptions' },
  { label: 'Analytics',     icon: 'analytics',     view: 'analytics' },
  { label: 'Users',         icon: 'group',         view: 'users' },
  { label: 'Tickets',       icon: 'support_agent', view: 'tickets' },
];

export default function SuperAdminDashboard() {
  const T = useTokens();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats]           = useState(null);
  const [admins, setAdmins]         = useState([]);
  const [otpStats, setOtpStats]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = () => { localStorage.removeItem('saToken'); navigate('/superadmin-login'); };

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ mb: 4, px: 2, pt: { xs: 2, md: 0 } }}>
        <Typography sx={{ fontWeight: 900, color: '#c2410c', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '-0.025em' }}>SaaS Admin</Typography>
        <Typography sx={{ color: T.textMuted, fontSize: '0.75rem', fontWeight: 500 }}>Management Portal</Typography>
      </Box>
      <Box component="nav" sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {SA_NAV.map(item => {
          const isActive = activeView === item.view;
          return (
            <Box component="button" key={item.label}
              onClick={() => { setActiveView(item.view); setMobileSidebarOpen(false); }}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', width: '100%', textAlign: 'left', color: isActive ? '#4f46e5' : T.textMuted, fontWeight: isActive ? 700 : 500, bgcolor: isActive ? T.surface : 'transparent', boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', '&:hover': { color: '#6366f1', bgcolor: isActive ? T.surface : T.surfaceAlt } }}>
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 'inherit', color: 'inherit' }}>{item.label}</Typography>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ mt: 'auto', px: 2, py: 3, borderTop: `1px solid ${T.border}` }}>
        <Box component="button" onClick={() => setOnboardOpen(true)} sx={{ width: '100%', background: 'linear-gradient(to bottom right, #f97316, #ea580c)', color: '#fff', py: 1.5, borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 10px 15px -3px rgba(199,210,254,0.6)', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', mb: 2, '&:active': { transform: 'scale(0.95)' } }}>+ New Restaurant</Box>
        <Box component="button" onClick={handleLogout} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', '&:hover': { color: '#ba1a1a' }, p: 0 }}>
          <span className="material-symbols-outlined">logout</span>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Logout</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text }}>

      {/* ─── Top Nav ─── */}
      <Box component="nav" sx={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, height: 64, bgcolor: T.navBg, backdropFilter: 'blur(24px)', boxShadow: T.shadowHov }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Mobile hamburger */}
          <Box component="button" onClick={() => setMobileSidebarOpen(v => !v)} sx={{ display: { md: 'none' }, p: 1, border: 'none', bgcolor: 'transparent', cursor: 'pointer', color: T.textSub }}>
            <span className="material-symbols-outlined">menu</span>
          </Box>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, background: 'linear-gradient(to bottom right, #f97316, #ea580c)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            MenuFlow
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="button" onClick={fetchAll} sx={{ p: 1, borderRadius: '50%', color: T.textSub, border: 'none', cursor: 'pointer', bgcolor: 'transparent', display: 'flex', '&:hover': { bgcolor: T.surfaceHigh } }}>
            <span className="material-symbols-outlined">refresh</span>
          </Box>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>SA</Box>
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
      <Box component="aside" sx={{ position: 'fixed', left: 0, top: 0, height: '100vh', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', p: 2, pt: 10, bgcolor: T.bg, width: 256, borderRight: `1px solid ${T.border}`, zIndex: 40, overflowY: 'auto' }}>
        {sidebarContent}
      </Box>

      {/* ─── Main Content ─── */}
      <Box component="main" sx={{ ml: { md: '256px' }, pt: 10, pb: 6, px: { xs: 2, md: 4 }, minHeight: '100vh', width: '100%' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', pt: 4 }}>
          {activeView === 'dashboard'     && <DashboardView     stats={stats} admins={admins} otpStats={otpStats} loading={loading} onViewChange={setActiveView} />}
          {activeView === 'restaurants'   && <RestaurantsView   admins={admins} setAdmins={setAdmins} />}
          {activeView === 'subscriptions' && <SubscriptionsView admins={admins} setAdmins={setAdmins} />}
          {activeView === 'analytics'     && <AnalyticsView     stats={stats} otpStats={otpStats} />}
          {activeView === 'users'         && <UsersView         admins={admins} setAdmins={setAdmins} />}
          {activeView === 'tickets'       && <TicketsView />}
        </Box>
      </Box>

      <OnboardingModal open={onboardOpen} onClose={() => setOnboardOpen(false)} onCreated={handleRestaurantCreated} />
    </Box>
  );
}
