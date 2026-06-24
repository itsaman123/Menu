import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { fadeUp, slideLeft, slideRight, staggerContainer, float } from '../hooks/useScrollAnimation';
import axios from 'axios';

const M = motion.create(Box);
const MTypo = motion.create(Typography);

export default function Login() {
  const T = useTokens();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        email: data.email,
        restaurantId: data.restaurantId,
        restaurantName: data.restaurantName,
        slug: data.slug,
      }));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box sx={{
      bgcolor: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      p: 3, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif',
    }}>
      {/* Background Decor — animated pulse */}
      <M
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        sx={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, bgcolor: 'rgba(249,115,22,0.05)', borderRadius: '50%', filter: 'blur(64px)', pointerEvents: 'none' }}
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
          width: '100%', maxWidth: 1200, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
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
                background: 'linear-gradient(to bottom right, #f97316, #ea580c)',
                WebkitBackgroundClip: 'text', color: 'transparent', letterSpacing: '-0.025em',
              }}>
                MenuFlow
              </Typography>
            </Box>
            <Typography variant="h1" sx={{ fontSize: '3rem', fontWeight: 900, color: T.text, letterSpacing: '-0.05em', lineHeight: 1.1, mb: 3 }}>
              Elevate your <br /> digital presence.
            </Typography>
            <Typography sx={{ color: T.textSub, fontSize: '1.125rem', maxWidth: 400, lineHeight: 1.625 }}>
              Join a community of forward-thinking creators and businesses using high-end editorial interfaces to tell their stories.
            </Typography>
          </M>
          {/* Trust badge */}
          <M variants={fadeUp} custom={2} sx={{ mt: 4, position: 'relative', zIndex: 10 }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 2, p: 2,
              bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
              borderRadius: '1rem', width: 'fit-content',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <Box sx={{ display: 'flex' }}>
                {[
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCdz2ebsH3mqwDtEkMQvE1eFn87gMZqFBdgOO45J0lg4_XmV8mx02SJO7ZR97HLgURT86EMDiA43TsH-43rI0hEjr8r5sTFcTaGGkyD-qzLgd80cv709xASGpjb3LWNUjm-l9zLIr-540Io7hlY8u8SD77Hp52ilyIrVD04AtzhdzAbgJt67I4YCrYtSJPxQLMwbGhiIZ0_YdZpiJN4277caauAKu91kwEDoAcw2XQx_PJp9_7tzX7M2SL2v0chwMd_HbKDXpQvb7I',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCFPck-P1iSNSgw9TMZBBzCYUQ6xymjhkN20z5z14gfEfuj3x0iofrMXrjGmm1-lZ3UZIpZWgZpgwkzdqRwgliPaggOCnawYZZZkPrATJCvkcOAC5Uwfs_ccf556qrIJs_MKy6wwvDpDFtnR1IKzd1ahW9F1gjaoc54TC59GzY3QyIUCqOZZEulr0qHDiMSThLzoPpwyDrQVp01nQvNlebj3vQdxj21-O7KLSJcXl6JQfki10LVLKZDdrirraxSSm3xlC8-0sWC9mM',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuD4vqQzJryJxMJGvAbozjPdO3MMbmQkLhy7pFjqyQnu6LNh_qhlhwOVcOP9MDTyH_xhvfuwrx15fFgjAbtCsbhzE_kKqf1doSo6r5k4rkdBD0HGRCScCddWJDK5MajaO8HLisL7dzdWNqz18E21PeYVsKxYAI9p2oUgeC1YTrHDQNwCKWuoyQ10_ZCIrQtuVjpU34OUYFcldoJsz1L6yvHwEinPkHiWb_bhobtdMtVrzWbZGcgz2SHttKzk3FuZm3ekVoX75RctDTA',
                ].map((src, i) => (
                  <Box component="img" key={i} src={src} alt="" sx={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #fff', ml: i === 0 ? 0 : -1 }} />
                ))}
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: T.textSub }}>Trusted by 2k+ curators</Typography>
            </Box>
          </M>
          {/* Decorative image */}
          <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: '75%', height: '50%', opacity: 0.2, pointerEvents: 'none' }}>
            <Box component="img"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlAYKAJZEpE8xOO8vwb_hRATTmDEI9nlC25WWCODU7_uvPEzOGwPlsHakkieJ5BysWAPam1CJHbGHJ37xi-ABDAj-AzGxk0yB9V1EefHXBX8qMdaU1kEqTi9eijty5hYDJ8ZCoLyrTHaGVyiPhfmjZ9bVtONyphFyYHfq0ZQXx9Lgb55WKaKKKh0mnMN-ptsVXZ1fgLPO3SGCKwKgY3h9WuwkqhkZy6NkPgBVBLLzmGgPeixRCEJYFQlNo0-QBAdhQqP1x-9ufYnU"
              alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }}
            />
          </Box>
        </M>

        {/* ─── Right Column: Login Form ─── */}
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
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, background: 'linear-gradient(to bottom right, #f97316, #ea580c)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                MenuFlow
              </Typography>
            </Box>

            <Box component="header" sx={{ mb: 5 }}>
              <Typography variant="h2" sx={{ fontSize: '1.875rem', fontWeight: 800, color: T.text, letterSpacing: '-0.025em', mb: 1 }}>Welcome Back.</Typography>
              <Typography sx={{ color: T.textSub, fontWeight: 500 }}>Please enter your details to continue.</Typography>
            </Box>

            {error && (
              <Typography sx={{ color: T.red, mb: 2, textAlign: 'center', bgcolor: T.redDim, p: 1, borderRadius: 1, fontSize: '0.875rem' }}>
                {error}
              </Typography>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Email */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography component="label" sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: T.textSub, ml: 0.5 }}>
                  Email address
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 20 }}>mail</span>
                  <Box component="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    sx={{
                      width: '100%', height: 56, pl: '48px', pr: 2,
                      bgcolor: T.surfaceAlt, border: 'none', borderRadius: '1rem',
                      color: T.text, outline: 'none', fontSize: '0.875rem',
                      fontFamily: 'Inter, sans-serif', transition: 'all 0.3s',
                      '&:focus': { boxShadow: '0 0 0 2px rgba(249,115,22,0.2)', bgcolor: T.surface },
                      '&::placeholder': { color: T.textMuted },
                    }}
                  />
                </Box>
              </Box>

              {/* Password */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography component="label" sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: T.textSub, ml: 0.5 }}>
                  Password
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 20 }}>lock</span>
                  <Box component="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    sx={{
                      width: '100%', height: 56, pl: '48px', pr: 2,
                      bgcolor: T.surfaceAlt, border: 'none', borderRadius: '1rem',
                      color: T.text, outline: 'none', fontSize: '0.875rem',
                      fontFamily: 'Inter, sans-serif', transition: 'all 0.3s',
                      '&:focus': { boxShadow: '0 0 0 2px rgba(249,115,22,0.2)', bgcolor: T.surface },
                      '&::placeholder': { color: T.textMuted },
                    }}
                  />
                </Box>
              </Box>

              {/* Options */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
                  <Box component="input" type="checkbox" sx={{
                    appearance: 'none', width: 20, height: 20, bgcolor: T.surfaceAlt,
                    borderRadius: '6px', border: 'none', cursor: 'pointer',
                    '&:checked': { bgcolor: T.accent },
                  }} />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: T.textSub }}>Remember me</Typography>
                </Box>
                <Typography component="a" href="#" sx={{
                  fontSize: '0.875rem', fontWeight: 700, color: T.accent,
                  textDecoration: 'none', '&:hover': { color: T.accentHov },
                }}>Forgot Password?</Typography>
              </Box>

              {/* CTA */}
              <Box component="button" type="submit" sx={{
                width: '100%', height: 56,
                background: 'linear-gradient(to bottom right, #f97316, #ea580c)',
                color: '#fff7ed', fontWeight: 700, borderRadius: '1rem',
                boxShadow: '0 10px 20px rgba(249,115,22,0.2)', cursor: 'pointer',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                fontFamily: 'Inter, sans-serif', fontSize: '1rem',
                transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
                '&:hover': { transform: 'scale(1.02)' }, '&:active': { transform: 'scale(0.95)' },
              }}>
                <span>Sign In</span>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
              </Box>
            </Box>

            {/* Footer */}
            <Box component="footer" sx={{ mt: 6, textAlign: 'center' }}>
              <Typography sx={{ color: T.textSub, fontWeight: 500 }}>
                Don't have an account?
                <Typography component="span" onClick={() => navigate('/register')} sx={{
                  color: T.text, fontWeight: 700, ml: 1, cursor: 'pointer',
                  transition: 'color 0.3s', '&:hover': { color: T.accent },
                }}>Sign up</Typography>
              </Typography>
            </Box>

            {/* OAuth Separator */}
            <Box sx={{ mt: 5, pt: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <Box sx={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', borderTop: `1px solid rgba(200,196,215,0.2)` }} />
                </Box>
                <Typography component="span" sx={{
                  position: 'relative', bgcolor: T.surface, px: 2,
                  fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: T.textMuted, fontWeight: 700,
                }}>Or continue with</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                {[
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuD5tVRLWf02r7V6qPWGegqk22D42ZPLkk5j7frKzZ9d9ZGfZI-OfAhqae500gZFEv9czQycCwpWRR1-XGOeZu0ri7hQnWBigC7nS07Vd0xPvnJCN3mpW6PfqLvVdNtjfq1X7ND4SAOeLPczgOqhsU546mKs9rJPoigYQ-LDQuggKlxVZZyMgMhVE8IFDaRd-EV_F7Qo6mmFQYyikkS3WrPuy-WeMHdogFxlNlVxWnnZ_NLfcTpD6NkfyqI3z833sllBPlj4_2yUy7c',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuDQEgmc93TN7_UqiCFm9tjlS6onHUjUUb7WzJPufl2Y4bAzSMci8rAYwKl5LjtBmHfYy-nUhkXfMIBUyQEIHStVqXZQT0ftO5svsOLRrSumk1akESF4b8IB9ewOPw2mqj4L5h9lzN8R3D51fisyfpZMTSNmsxLMNNFrADjIP8UTfBW93t4B2lYQWVy_afBxjuEOV9ckl6JXlMXVtlRx9gESq3EK1qKd8pfQ5tBPSCbDXiZ74czcx9GbZO7mZzPgqD0HjMplkwhqdiA',
                ].map((src, i) => (
                  <Box component="button" key={i} sx={{
                    flex: 1, height: 48, bgcolor: T.surfaceAlt, borderRadius: '1rem', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    transition: 'background-color 0.3s', '&:hover': { bgcolor: T.surfaceHigh },
                  }}>
                    <Box component="img" src={src} alt="" sx={{ width: 20, height: 20 }} />
                  </Box>
                ))}
              </Box>
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
        <Box sx={{
          width: 32, height: 32, borderRadius: '50%', bgcolor: '#6cf8bb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#006c49',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>security</span>
        </Box>
        <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: T.textSub, pr: 1 }}>
          Secure Cloud Infrastructure
        </Typography>
      </M>
    </Box>
  );
}
