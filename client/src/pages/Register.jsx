import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { fadeUp, slideRight, staggerContainer, scaleUp, scrollViewport } from '../hooks/useScrollAnimation';
import axios from 'axios';

const M = motion.create(Box);
const MTypo = motion.create(Typography);

export default function Register() {
  const T = useTokens();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', restaurantName: '' });
  const [error, setError] = useState('');
  const [step] = useState(3); // Onboarding step shown

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', color: T.text, fontFamily: 'Inter, sans-serif' }}>

      {/* ─── Stepper Header ─── */}
      <M
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        component="header"
        sx={{
          position: 'fixed', top: 0, width: '100%', zIndex: 50, height: 96,
          display: 'flex', alignItems: 'center',
          bgcolor: T.navBg, backdropFilter: 'blur(20px)',
          boxShadow: '0px 20px 40px rgba(18,28,42,0.06)',
        }}
      >
        <Box sx={{ maxWidth: 960, mx: 'auto', width: '100%', px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em', color: T.text }}>The Curated Canvas</Typography>
            <Typography sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>
              Step {step} of 5: Menu Setup
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '6px' }}>
            {[1,2,3,4,5].map(s => (
              <Box key={s} sx={{
                height: 6, borderRadius: '9999px',
                width: s === step ? 48 : 32,
                bgcolor: s <= step ? T.accent : T.surfaceHigh,
              }} />
            ))}
          </Box>
        </Box>
      </M>

      {/* ─── Main Content ─── */}
      <Box component="main" sx={{ pt: 16, pb: 10, maxWidth: 960, mx: 'auto', px: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 3 }}>

          {/* Left: Hero Description */}
          <M
            variants={staggerContainer}
            initial="hidden" animate="visible"
            sx={{ gridColumn: { xs: 'span 12', md: 'span 5' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', pr: { md: 4 }, mb: { xs: 4, md: 0 } }}
          >
            <MTypo variants={fadeUp} custom={0} sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: T.accent, mb: 2 }}>
              First Impressions
            </MTypo>
            <MTypo variants={fadeUp} custom={1} variant="h1" sx={{ fontSize: { xs: '2.25rem', md: '3rem' }, fontWeight: 800, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, mb: 3 }}>
              Craft your <br />
              <Box component="span" sx={{ background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                editorial
              </Box>{' '}
              menu.
            </MTypo>
            <MTypo variants={fadeUp} custom={2} sx={{ fontSize: '1.125rem', color: T.textSub, lineHeight: 1.625, fontWeight: 500 }}>
              Upload your first dish. This is how your customers will see your digital experience. Physical layers, digital magic.
            </MTypo>
            <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {['Account created successfully', 'Branding & Theme applied'].map(text => (
                <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#6cf8bb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00714d' }}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.text }}>{text}</Typography>
                </Box>
              ))}
            </Box>
          </M>

          {/* Right: Onboarding Form */}
          <M
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            sx={{ gridColumn: { xs: 'span 12', md: 'span 7' } }}
          >
            <Box sx={{ bgcolor: T.surface, p: { xs: 4, md: 5 }, borderRadius: '1.5rem', boxShadow: T.shadowHov }}>

              {error && (
                <Typography sx={{ color: T.red, mb: 3, bgcolor: T.redDim, p: 1.5, borderRadius: 1, fontSize: '0.875rem', textAlign: 'center' }}>
                  {error}
                </Typography>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Category name */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography component="label" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>
                    Category name
                  </Typography>
                  <Box component="input" type="text"
                    placeholder="e.g. Signature Mains"
                    sx={{
                      width: '100%', height: 56, px: 3, borderRadius: '1rem',
                      bgcolor: T.surfaceAlt, border: 'none', color: T.text, outline: 'none',
                      fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '0.875rem',
                      '&:focus': { boxShadow: '0 0 0 2px rgba(83,65,205,0.2)', bgcolor: T.surface },
                      '&::placeholder': { color: T.textMuted },
                    }}
                  />
                </Box>

                {/* Item Name + Price */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography component="label" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>
                      Item name
                    </Typography>
                    <Box component="input" type="text"
                      placeholder="Truffle Pasta"
                      sx={{
                        width: '100%', height: 56, px: 3, borderRadius: '1rem',
                        bgcolor: T.surfaceAlt, border: 'none', color: T.text, outline: 'none',
                        fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '0.875rem',
                        '&:focus': { boxShadow: '0 0 0 2px rgba(83,65,205,0.2)', bgcolor: T.surface },
                        '&::placeholder': { color: T.textMuted },
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography component="label" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>
                      Price (₹)
                    </Typography>
                    <Box component="input" type="number"
                      placeholder="450"
                      sx={{
                        width: '100%', height: 56, px: 3, borderRadius: '1rem',
                        bgcolor: T.surfaceAlt, border: 'none', color: T.text, outline: 'none',
                        fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '0.875rem',
                        '&:focus': { boxShadow: '0 0 0 2px rgba(83,65,205,0.2)', bgcolor: T.surface },
                        '&::placeholder': { color: T.textMuted },
                      }}
                    />
                  </Box>
                </Box>

                {/* Image Upload Area */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography component="label" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>
                    Item image
                  </Typography>
                  <Box sx={{
                    height: 192, borderRadius: '1rem', bgcolor: T.surfaceAlt,
                    border: `2px dashed rgba(200,196,215,0.3)`, display: 'flex',
                    flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'background-color 0.3s',
                    '&:hover': { bgcolor: T.surfaceHigh },
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, color: T.accent, marginBottom: 8 }}>add_a_photo</span>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.textSub }}>Tap to upload dish photo</Typography>
                    <Typography sx={{ fontSize: '10px', color: T.textMuted, mt: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>High resolution JPG or PNG</Typography>
                  </Box>
                </Box>

                {/* Buttons */}
                <Box sx={{ pt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
                  <Box component="button" type="submit" sx={{
                    width: { xs: '100%', sm: 'auto' }, px: 4, py: 2,
                    bgcolor: '#6c5ce7', color: '#faf6ff', borderRadius: '1rem',
                    fontWeight: 700, border: 'none', cursor: 'pointer',
                    boxShadow: '0 10px 20px rgba(83,65,205,0.2)',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                    transition: 'all 0.3s', '&:hover': { transform: 'scale(1.02)' },
                    '&:active': { transform: 'scale(0.95)' },
                  }}>
                    Save &amp; Continue
                  </Box>
                  <Box component="button" type="button" sx={{
                    width: { xs: '100%', sm: 'auto' }, px: 4, py: 2,
                    bgcolor: T.surfaceHigh, color: T.text, borderRadius: '1rem',
                    fontWeight: 700, border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                    transition: 'background-color 0.3s', '&:hover': { bgcolor: T.surfaceHighest },
                  }}>
                    Add Another Item
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Live Preview */}
            <M
              variants={scaleUp}
              initial="hidden" whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              sx={{
              mt: 4, position: 'relative', height: 256, borderRadius: '1.5rem',
              overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              '&:hover img': { transform: 'scale(1.1)' },
            }}>
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)', zIndex: 10 }} />
              <Box component="img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdheAMak6FnpWSoU6XNmThbrlNxbGQUyEzgc1JCr3m0iYof25FhXIKlQlbje9fMyud0t5SnGBwZM5KOXs325xMCM7q7mC9h88UGNXQ8MnS5mRgJorZvQlGJdIwysQpXSXPlDA2ExUlzL5GRIt3eiYtYCWahts0l18GZIBGfYx7xdaL7Z63vipd-Qi3iLCXwgKZa3SITXWKtMPsN-kBRRexI3gAy9U9BZ7Vp3dXRbbR5uleiC5w2X4Uqh-liaZ68TW0UQinI7t15x8"
                alt="Preview"
                sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }}
              />
              <Box sx={{ position: 'absolute', bottom: 24, left: 32, zIndex: 20 }}>
                <Box component="span" sx={{
                  display: 'inline-block', px: 1.5, py: 0.5, bgcolor: '#6cf8bb', color: '#00714d',
                  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                  borderRadius: '9999px', mb: 1.5,
                }}>Live Preview</Box>
                <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em' }}>Truffle Pasta</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontWeight: 500 }}>₹ 450.00</Typography>
              </Box>
            </M>
          </M>
        </Box>
      </Box>

      {/* ─── Footer ─── */}
      <Box component="footer" sx={{ width: '100%', py: 6, bgcolor: T.bg }}>
        <Box sx={{
          maxWidth: 960, mx: 'auto', px: 3, borderTop: `1px solid ${T.border}`, pt: 6,
          display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between',
          alignItems: 'center', gap: 3,
        }}>
          <Typography sx={{ fontSize: '0.875rem', color: T.textSub, fontWeight: 500 }}>
            © 2024 The Curated Canvas. Physical layers for digital experiences.
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            {['Save for Later', 'Need Help?'].map(link => (
              <Typography key={link} component="a" href="#" sx={{
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: T.textSub, textDecoration: 'none', '&:hover': { color: T.accent },
              }}>{link}</Typography>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Mobile Next Button */}
      <Box sx={{ display: { md: 'none' }, position: 'fixed', bottom: 32, left: 24, right: 24, zIndex: 50 }}>
        <Box component="button" onClick={() => navigate('/login')} sx={{
          width: '100%', height: 64,
          background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)',
          color: '#fff', borderRadius: '9999px', fontWeight: 700, border: 'none',
          boxShadow: '0 20px 40px rgba(83,65,205,0.3)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 1, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          '&:active': { transform: 'scale(0.95)' },
        }}>
          <span>Next: QR Generation</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </Box>
      </Box>
    </Box>
  );
}
