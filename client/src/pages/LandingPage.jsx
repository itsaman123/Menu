import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Stack, Paper, Card, CardContent
} from '@mui/material';
import { QrCode2, Analytics, PhoneAndroid, Check, Close, ArrowForward } from '@mui/icons-material';

const features = [
  {
    icon: <QrCode2 sx={{ fontSize: 40 }} />,
    title: 'Interactive QR Menu',
    desc: 'Beautiful, high-speed digital menus that work on any mobile browser. Instant updates without reprinting.'
  },
  {
    icon: <Analytics sx={{ fontSize: 40 }} />,
    title: 'Live Analytics',
    desc: 'Track real-time orders, peak hours, and trending items from your admin dashboard.'
  },
  {
    icon: <PhoneAndroid sx={{ fontSize: 40 }} />,
    title: 'OTP Login',
    desc: 'Zero friction for guests. Secure one-time password login via SMS — no account needed.'
  }
];

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    items: [
      { text: '1 Location', included: true },
      { text: 'QR Menu Unlimited', included: true },
      { text: 'Direct Ordering', included: false },
    ],
    highlight: false
  },
  {
    name: 'Professional',
    price: '₹2,999',
    period: '/mo',
    items: [
      { text: 'Up to 3 Locations', included: true },
      { text: 'QR Ordering & Payments', included: true },
      { text: 'Analytics Dashboard', included: true },
      { text: 'Inventory Management', included: true },
    ],
    highlight: true
  },
  {
    name: 'Enterprise',
    price: '₹7,999',
    period: '/mo',
    items: [
      { text: 'Unlimited Locations', included: true },
      { text: '24/7 Priority Support', included: true },
      { text: 'API Access & Integrations', included: true },
    ],
    highlight: false
  }
];

const LandingPage = () => {
  return (
    <Box sx={{ bgcolor: 'var(--cc-background)', minHeight: '100vh' }} className="page-enter">
      {/* Navigation */}
      <Box component="nav" className="glass" sx={{
        position: 'sticky', top: 0, zIndex: 100,
        py: 2, px: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <Typography variant="h5" fontWeight="800" sx={{ fontFamily: '"Manrope"', color: 'var(--cc-primary)' }}>
          CulinaryCanvas
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button component={RouterLink} to="/menu/demo" variant="text" sx={{ color: 'var(--cc-on-surface)' }}>Demo</Button>
          <Button component={RouterLink} to="/login" variant="text" sx={{ color: 'var(--cc-on-surface)' }}>Sign In</Button>
          <Button component={RouterLink} to="/register" variant="contained" size="small" endIcon={<ArrowForward />}>
            Get Started
          </Button>
        </Stack>
      </Box>

      {/* Hero */}
      <Container maxWidth="lg" sx={{ pt: 10, pb: 12, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.5rem' }, maxWidth: 800, mx: 'auto', mb: 3 }}>
          Transform your dining experience with seamless contactless ordering.
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--cc-on-surface-variant)', maxWidth: 600, mx: 'auto', mb: 5, fontSize: '1.1rem' }}>
          One platform to manage your menu, staff, and digital presence without the overhead of expensive hardware. Setup in minutes.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button component={RouterLink} to="/register" variant="contained" size="large" endIcon={<ArrowForward />}
            sx={{ py: 1.5, px: 4, fontSize: '1rem' }}>
            Start Free Trial
          </Button>
          <Button component={RouterLink} to="/menu/demo" variant="outlined" size="large"
            sx={{ py: 1.5, px: 4, fontSize: '1rem' }}>
            See Live Demo
          </Button>
        </Stack>
      </Container>

      {/* Features */}
      <Box sx={{ bgcolor: 'var(--cc-surface-container-low)', py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {features.map((f, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Paper elevation={0} sx={{
                  p: 4, height: '100%', bgcolor: 'var(--cc-surface-container-lowest)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 'var(--shadow-ambient)' }
                }}>
                  <Box sx={{ color: 'var(--cc-primary)', mb: 2 }}>{f.icon}</Box>
                  <Typography variant="h6" gutterBottom>{f.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--cc-on-surface-variant)' }}>{f.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
          Choose your plan
        </Typography>
        <Typography variant="body1" align="center" sx={{ color: 'var(--cc-on-surface-variant)', mb: 6 }}>
          Choose the plan that fits your kitchen's ambition.
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card elevation={0} sx={{
                height: '100%', position: 'relative', overflow: 'visible',
                bgcolor: plan.highlight ? 'var(--cc-primary)' : 'var(--cc-surface-container-lowest)',
                color: plan.highlight ? 'white' : 'inherit',
                transform: plan.highlight ? 'scale(1.05)' : 'none',
                boxShadow: plan.highlight ? 'var(--shadow-glow)' : 'var(--shadow-card)',
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 2 }}>{plan.name}</Typography>
                  <Typography variant="h3" sx={{ my: 2 }}>
                    {plan.price}<Typography component="span" variant="body2" sx={{ opacity: 0.6 }}>{plan.period}</Typography>
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 3 }}>
                    {plan.items.map((item, j) => (
                      <Stack key={j} direction="row" spacing={1} alignItems="center">
                        {item.included
                          ? <Check sx={{ fontSize: 18, color: plan.highlight ? 'rgba(255,255,255,0.8)' : 'var(--cc-primary)' }} />
                          : <Close sx={{ fontSize: 18, opacity: 0.3 }} />}
                        <Typography variant="body2" sx={{ opacity: item.included ? 1 : 0.4 }}>{item.text}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button
                    fullWidth variant={plan.highlight ? 'contained' : 'outlined'}
                    sx={{
                      mt: 4,
                      ...(plan.highlight && {
                        bgcolor: 'white', color: 'var(--cc-primary)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                        background: 'white', boxShadow: 'none'
                      })
                    }}
                    component={RouterLink} to="/register"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonial */}
      <Box sx={{ bgcolor: 'var(--cc-surface-container-low)', py: 10 }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontStyle: 'italic', mb: 3, lineHeight: 1.8 }}>
            "CulinaryCanvas reduced our order errors by 40% in the first month. The QR system just works — our staff loves it."
          </Typography>
          <Typography variant="subtitle1" fontWeight="700">Marco Rossi</Typography>
          <Typography variant="body2" sx={{ color: 'var(--cc-on-surface-variant)' }}>Owner, The Bistro Paris</Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'var(--cc-surface-container)' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="body2" sx={{ color: 'var(--cc-on-surface-variant)' }}>
              © 2024 CulinaryCanvas. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Typography variant="body2" sx={{ color: 'var(--cc-on-surface-variant)', cursor: 'pointer', '&:hover': { color: 'var(--cc-primary)' } }}>Terms of Service</Typography>
              <Typography variant="body2" sx={{ color: 'var(--cc-on-surface-variant)', cursor: 'pointer', '&:hover': { color: 'var(--cc-primary)' } }}>Privacy Policy</Typography>
              <Typography variant="body2" sx={{ color: 'var(--cc-on-surface-variant)', cursor: 'pointer', '&:hover': { color: 'var(--cc-primary)' } }}>Cookie Settings</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
