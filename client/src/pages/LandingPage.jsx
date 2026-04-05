import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Stack, Card, CardContent
} from '@mui/material';
import { QrCode2, Analytics, PhoneAndroid, Check, Close, ArrowForward, FoodBank } from '@mui/icons-material';

const T = {
  bg: '#0f1117', surface: '#16191f', surfaceAlt: '#1d2129',
  border: 'rgba(255,255,255,0.07)', accent: '#7c6ef0',
  accentHov: '#9d91f7', accentDim: 'rgba(124,110,240,0.12)',
  green: '#22c55e', greenDim: 'rgba(34,197,94,0.12)',
  text: '#e8eaf0', textSub: '#8b8fa8', textMuted: '#4b5068',
};

const features = [
  {
    icon: <QrCode2 sx={{ fontSize: 28 }} />,
    title: 'Interactive QR Menu',
    desc: 'Beautiful, high-speed digital menus that work on any mobile browser. Instant updates without reprinting.',
    color: '#7c6ef0', dim: 'rgba(124,110,240,0.12)',
  },
  {
    icon: <Analytics sx={{ fontSize: 28 }} />,
    title: 'Live Analytics',
    desc: 'Track real-time orders, peak hours, and trending items from your admin dashboard.',
    color: '#22c55e', dim: 'rgba(34,197,94,0.12)',
  },
  {
    icon: <PhoneAndroid sx={{ fontSize: 28 }} />,
    title: 'OTP Ordering',
    desc: 'Zero friction for guests. Secure one-time password login via SMS — no account needed.',
    color: '#f97316', dim: 'rgba(249,115,22,0.12)',
  },
];

const plans = [
  {
    name: 'Starter', price: 'Free', period: '',
    items: [
      { text: '1 Location', included: true },
      { text: 'QR Menu Unlimited', included: true },
      { text: 'Direct Ordering', included: false },
    ],
    highlight: false,
  },
  {
    name: 'Professional', price: '₹2,999', period: '/mo',
    items: [
      { text: 'Up to 3 Locations', included: true },
      { text: 'QR Ordering & Payments', included: true },
      { text: 'Analytics Dashboard', included: true },
      { text: 'Inventory Management', included: true },
    ],
    highlight: true,
  },
  {
    name: 'Enterprise', price: '₹7,999', period: '/mo',
    items: [
      { text: 'Unlimited Locations', included: true },
      { text: '24/7 Priority Support', included: true },
      { text: 'API Access & Integrations', included: true },
    ],
    highlight: false,
  },
];

const LandingPage = () => {
  return (
    <Box sx={{ background: T.bg, minHeight: '100vh', color: T.text }} className="page-enter">

      {/* Nav */}
      <Box component="nav" sx={{
        position: 'sticky', top: 0, zIndex: 100,
        py: 1.5, px: { xs: 2, md: 5 },
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(15,17,23,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '9px',
            background: 'linear-gradient(135deg, #7c6ef0, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FoodBank sx={{ fontSize: 17, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '1.05rem', color: T.text }}>
            CulinaryCanvas
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button component={RouterLink} to="/menu/demo" sx={{ color: T.textSub, textTransform: 'none', fontSize: '0.85rem', '&:hover': { color: T.text } }}>
            Demo
          </Button>
          <Button component={RouterLink} to="/login" sx={{ color: T.textSub, textTransform: 'none', fontSize: '0.85rem', '&:hover': { color: T.text } }}>
            Sign In
          </Button>
          <Button
            component={RouterLink} to="/register"
            endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
            sx={{
              textTransform: 'none', fontSize: '0.82rem', fontWeight: 700, borderRadius: '10px',
              px: 2, py: 0.8,
              background: 'linear-gradient(135deg, #7c6ef0, #a78bfa)',
              color: '#fff', boxShadow: '0 4px 14px rgba(124,110,240,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #9d91f7, #b4a8fc)' },
            }}>
            Get Started
          </Button>
        </Stack>
      </Box>

      {/* Hero */}
      <Box sx={{
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,110,240,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 14 }, pb: { xs: 8, md: 14 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1,
            px: 2, py: 0.7, borderRadius: '99px', mb: 4,
            background: 'rgba(124,110,240,0.1)', border: '1px solid rgba(124,110,240,0.25)',
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#7c6ef0' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 700 }}>
              Now with Real-Time Order Tracking
            </Typography>
          </Box>

          <Typography sx={{
            fontFamily: '"Manrope",sans-serif', fontWeight: 800,
            fontSize: { xs: '2rem', md: '3.6rem' }, lineHeight: 1.15,
            color: T.text, maxWidth: 800, mx: 'auto', mb: 2.5,
            letterSpacing: '-0.5px',
          }}>
            Transform your dining experience with{' '}
            <Box component="span" sx={{ background: 'linear-gradient(135deg, #7c6ef0, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              contactless ordering.
            </Box>
          </Typography>

          <Typography sx={{ color: T.textSub, maxWidth: 560, mx: 'auto', mb: 5, fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.8 }}>
            One platform to manage your menu, staff, and digital presence without expensive hardware. Setup in 5 minutes.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={RouterLink} to="/register"
              endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: 'none', fontWeight: 700, borderRadius: '12px',
                px: 4, py: 1.5, fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #7c6ef0, #a78bfa)',
                color: '#fff', boxShadow: '0 8px 28px rgba(124,110,240,0.4)',
                '&:hover': { background: 'linear-gradient(135deg, #9d91f7, #b4a8fc)', boxShadow: '0 12px 36px rgba(124,110,240,0.55)' },
              }}>
              Start Free Trial
            </Button>
            <Button
              component={RouterLink} to="/menu/demo"
              sx={{
                textTransform: 'none', fontWeight: 700, borderRadius: '12px',
                px: 4, py: 1.5, fontSize: '0.95rem',
                border: `1px solid ${T.border}`, color: T.textSub,
                '&:hover': { background: T.accentDim, borderColor: '#7c6ef0', color: T.text },
              }}>
              See Live Demo
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ py: { xs: 6, md: 10 }, borderTop: `1px solid ${T.border}` }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' }, color: T.text, textAlign: 'center', mb: 1 }}>
            Everything you need
          </Typography>
          <Typography sx={{ color: T.textSub, textAlign: 'center', mb: 6, fontSize: '0.95rem' }}>
            A complete toolkit built for modern restaurants.
          </Typography>
          <Grid container spacing={3}>
            {features.map((f, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box sx={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: '16px', p: 3.5, height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 36px rgba(0,0,0,0.4)` },
                }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '13px', background: f.dim, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5, color: f.color }}>
                    {f.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text, mb: 1 }}>{f.title}</Typography>
                  <Typography sx={{ color: T.textSub, fontSize: '0.85rem', lineHeight: 1.7 }}>{f.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing */}
      <Box sx={{ py: { xs: 6, md: 10 }, borderTop: `1px solid ${T.border}` }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' }, color: T.text, textAlign: 'center', mb: 1 }}>
            Choose your plan
          </Typography>
          <Typography sx={{ color: T.textSub, textAlign: 'center', mb: 6, fontSize: '0.95rem' }}>
            Start free, scale as you grow.
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {plans.map((plan, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card elevation={0} sx={{
                  height: '100%',
                  background: plan.highlight ? 'linear-gradient(145deg, #7c6ef0, #a78bfa)' : T.surface,
                  border: plan.highlight ? 'none' : `1px solid ${T.border}`,
                  borderRadius: '18px',
                  transform: plan.highlight ? { md: 'scale(1.04)' } : 'none',
                  boxShadow: plan.highlight ? '0 16px 48px rgba(124,110,240,0.45)' : 'none',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: plan.highlight ? { md: 'scale(1.06)' } : 'translateY(-3px)' },
                }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: plan.highlight ? 'rgba(255,255,255,0.7)' : T.textMuted, mb: 2 }}>
                      {plan.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 3 }}>
                      <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '2rem', color: plan.highlight ? '#fff' : T.text, lineHeight: 1 }}>
                        {plan.price}
                      </Typography>
                      {plan.period && <Typography sx={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : T.textMuted, fontSize: '0.85rem' }}>{plan.period}</Typography>}
                    </Box>
                    <Stack spacing={1.5} sx={{ mb: 3.5 }}>
                      {plan.items.map((item, j) => (
                        <Stack key={j} direction="row" spacing={1} alignItems="center">
                          {item.included
                            ? <Check sx={{ fontSize: 16, color: plan.highlight ? 'rgba(255,255,255,0.9)' : T.green }} />
                            : <Close sx={{ fontSize: 16, color: plan.highlight ? 'rgba(255,255,255,0.3)' : T.textMuted }} />
                          }
                          <Typography sx={{ fontSize: '0.85rem', color: plan.highlight ? (item.included ? '#fff' : 'rgba(255,255,255,0.4)') : (item.included ? T.textSub : T.textMuted) }}>
                            {item.text}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                    <Button fullWidth component={RouterLink} to="/register"
                      sx={{
                        textTransform: 'none', fontWeight: 700, borderRadius: '11px', py: 1.2,
                        ...(plan.highlight
                          ? { background: 'rgba(255,255,255,0.95)', color: '#7c6ef0', '&:hover': { background: '#fff' } }
                          : { border: `1px solid ${T.border}`, color: T.textSub, '&:hover': { background: T.accentDim, borderColor: '#7c6ef0', color: T.text } }
                        ),
                      }}>
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonial */}
      <Box sx={{ py: { xs: 6, md: 10 }, borderTop: `1px solid ${T.border}` }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '2rem', mb: 2 }}>⭐⭐⭐⭐⭐</Typography>
          <Typography sx={{ color: T.textSub, fontSize: '1.05rem', lineHeight: 1.9, fontStyle: 'italic', mb: 3 }}>
            "CulinaryCanvas reduced our order errors by 40% in the first month. The QR system just works — our staff loves it."
          </Typography>
          <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9rem' }}>Marco Rossi</Typography>
          <Typography sx={{ color: T.textMuted, fontSize: '0.8rem' }}>Owner, The Bistro Paris</Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, borderTop: `1px solid ${T.border}`, background: T.surface }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 26, height: 26, borderRadius: '7px', background: 'linear-gradient(135deg, #7c6ef0, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FoodBank sx={{ fontSize: 14, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '0.9rem', color: T.text }}>
                CulinaryCanvas
              </Typography>
            </Box>
            <Typography sx={{ color: T.textMuted, fontSize: '0.78rem' }}>© 2024 CulinaryCanvas. All rights reserved.</Typography>
            <Stack direction="row" spacing={3}>
              {['Terms', 'Privacy', 'Cookies'].map(l => (
                <Typography key={l} sx={{ fontSize: '0.78rem', color: T.textMuted, cursor: 'pointer', '&:hover': { color: T.accent } }}>{l}</Typography>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
