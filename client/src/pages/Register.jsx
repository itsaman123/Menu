import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { fadeUp, slideLeft, staggerContainer } from '../hooks/useScrollAnimation';
import axios from 'axios';

const M = motion.create(Box);
const MTypo = motion.create(Typography);

function toSlug(value) {
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function Register() {
  const T = useTokens();
  const navigate = useNavigate();
  const [form, setForm] = useState({ restaurantName: '', slug: '', email: '', password: '' });
  const [slugManual, setSlugManual] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    if (field === 'restaurantName') {
      setForm(prev => ({
        ...prev,
        restaurantName: value,
        slug: slugManual ? prev.slug : toSlug(value),
      }));
    } else if (field === 'slug') {
      setSlugManual(true);
      setForm(prev => ({ ...prev, slug: toSlug(value) }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        email: data.email,
        restaurantId: data.restaurantId,
        restaurantName: data.restaurantName,
        slug: data.slug,
        disabledFeatures: data.disabledFeatures || [],
      }));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    width: '100%', height: 56, pl: '48px', pr: 2,
    bgcolor: T.surfaceAlt, border: 'none', borderRadius: '1rem',
    color: T.text, outline: 'none', fontSize: '0.875rem',
    fontFamily: 'Inter, sans-serif', transition: 'all 0.3s',
    '&:focus': { boxShadow: '0 0 0 2px rgba(83,65,205,0.2)', bgcolor: T.surface },
    '&::placeholder': { color: T.textMuted },
  };

  const labelSx = {
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em',
    fontWeight: 700, color: T.textSub, ml: 0.5,
  };

  return (
    <Box sx={{
      bgcolor: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      p: 3, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif',
    }}>
      {/* Background Decor */}
      <M
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        sx={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, bgcolor: 'rgba(83,65,205,0.05)', borderRadius: '50%', filter: 'blur(64px)', pointerEvents: 'none' }}
      />
      <M
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        sx={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, bgcolor: 'rgba(0,108,73,0.05)', borderRadius: '50%', filter: 'blur(64px)', pointerEvents: 'none' }}
      />

      {/* Main Card */}
      <M
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        component="main"
        sx={{
          width: '100%', maxWidth: 1200,
          display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          bgcolor: T.surface, borderRadius: '1rem', overflow: 'hidden',
          boxShadow: T.shadowHov, minHeight: 700, position: 'relative', zIndex: 10,
        }}
      >
        {/* ─── Left Column: Brand ─── */}
        <M
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          component="section"
          sx={{
            display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between',
            p: 6, bgcolor: T.surfaceAlt, position: 'relative', overflow: 'hidden',
          }}
        >
          <M variants={slideLeft} sx={{ position: 'relative', zIndex: 10 }}>
            <Box sx={{ mb: 6 }}>
              <Typography sx={{
                fontSize: '1.25rem', fontWeight: 900,
                background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)',
                WebkitBackgroundClip: 'text', color: 'transparent', letterSpacing: '-0.025em',
              }}>
                The Curated Canvas
              </Typography>
            </Box>
            <Typography variant="h1" sx={{ fontSize: '3rem', fontWeight: 900, color: T.text, letterSpacing: '-0.05em', lineHeight: 1.1, mb: 3 }}>
              Your restaurant,<br /> online in minutes.
            </Typography>
            <Typography sx={{ color: T.textSub, fontSize: '1.125rem', maxWidth: 400, lineHeight: 1.625 }}>
              Create your digital menu, accept orders, and manage your restaurant from one beautiful dashboard.
            </Typography>
          </M>

          <M variants={fadeUp} custom={2} sx={{ mt: 4, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              { icon: 'qr_code_2', text: 'Instant QR code for your tables' },
              { icon: 'restaurant_menu', text: 'Beautiful digital menu editor' },
              { icon: 'receipt_long', text: 'Real-time order management' },
            ].map(({ icon, text }) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#6cf8bb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00714d', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.text }}>{text}</Typography>
              </Box>
            ))}
          </M>
        </M>

        {/* ─── Right Column: Registration Form ─── */}
        <M
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          component="section"
          sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: { xs: 4, md: 8 }, bgcolor: T.surface }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>

            {/* Mobile Logo */}
            <Box sx={{ display: { md: 'none' }, mb: 6, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                The Curated Canvas
              </Typography>
            </Box>

            <Box component="header" sx={{ mb: 5 }}>
              <Typography variant="h2" sx={{ fontSize: '1.875rem', fontWeight: 800, color: T.text, letterSpacing: '-0.025em', mb: 1 }}>
                Create your account.
              </Typography>
              <Typography sx={{ color: T.textSub, fontWeight: 500 }}>
                Set up your restaurant in under 2 minutes.
              </Typography>
            </Box>

            {error && (
              <Typography sx={{ color: T.red, mb: 3, textAlign: 'center', bgcolor: T.redDim, p: 1.5, borderRadius: 1, fontSize: '0.875rem' }}>
                {error}
              </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Restaurant Name */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography component="label" sx={labelSx}>Restaurant Name</Typography>
                <Box sx={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 20 }}>store</span>
                  <Box component="input" type="text" required value={form.restaurantName}
                    onChange={handleChange('restaurantName')}
                    placeholder="e.g. The Curated Canvas"
                    sx={inputSx}
                  />
                </Box>
              </Box>

              {/* Slug */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography component="label" sx={labelSx}>Menu URL</Typography>
                <Box sx={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 20 }}>link</span>
                  <Box component="input" type="text" required value={form.slug}
                    onChange={handleChange('slug')}
                    placeholder="your-restaurant"
                    sx={inputSx}
                  />
                </Box>
                {form.slug && (
                  <Typography sx={{ fontSize: '11px', color: T.textMuted, ml: 0.5 }}>
                    yourapp.com/menu/<Box component="span" sx={{ color: T.accent, fontWeight: 600 }}>{form.slug}</Box>
                  </Typography>
                )}
              </Box>

              {/* Email */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography component="label" sx={labelSx}>Email address</Typography>
                <Box sx={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 20 }}>mail</span>
                  <Box component="input" type="email" required value={form.email}
                    onChange={handleChange('email')}
                    placeholder="name@restaurant.com"
                    sx={inputSx}
                  />
                </Box>
              </Box>

              {/* Password */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography component="label" sx={labelSx}>Password</Typography>
                <Box sx={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 20 }}>lock</span>
                  <Box component="input" type="password" required value={form.password}
                    onChange={handleChange('password')}
                    placeholder="••••••••"
                    sx={inputSx}
                  />
                </Box>
              </Box>

              {/* CTA */}
              <Box component="button" type="submit" disabled={loading} sx={{
                width: '100%', height: 56,
                background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)',
                color: '#faf6ff', fontWeight: 700, borderRadius: '1rem',
                boxShadow: '0 10px 20px rgba(83,65,205,0.2)', cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                fontFamily: 'Inter, sans-serif', fontSize: '1rem',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
                '&:hover': { transform: loading ? 'none' : 'scale(1.02)' },
                '&:active': { transform: 'scale(0.95)' },
              }}>
                <span>{loading ? 'Creating account…' : 'Create Account'}</span>
                {!loading && <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>}
              </Box>
            </Box>

            {/* Footer */}
            <Box component="footer" sx={{ mt: 6, textAlign: 'center' }}>
              <Typography sx={{ color: T.textSub, fontWeight: 500 }}>
                Already have an account?
                <Typography component="span" onClick={() => navigate('/login')} sx={{
                  color: T.text, fontWeight: 700, ml: 1, cursor: 'pointer',
                  transition: 'color 0.3s', '&:hover': { color: T.accent },
                }}>Sign in</Typography>
              </Typography>
            </Box>
          </Box>
        </M>
      </M>

      {/* Security badge */}
      <M
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1, ease: [0.22, 1, 0.36, 1] }}
        sx={{
          position: 'fixed', bottom: 32, left: 32,
          display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1.5, p: 1.5,
          bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(24px)',
          borderRadius: '9999px', boxShadow: T.shadowHov,
          border: '1px solid rgba(255,255,255,0.4)', zIndex: 50,
        }}
      >
        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#6cf8bb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#006c49' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>security</span>
        </Box>
        <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: T.textSub, pr: 1 }}>
          Secure Cloud Infrastructure
        </Typography>
      </M>
    </Box>
  );
}
