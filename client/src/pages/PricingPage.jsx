import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF, glass } from './menuflow/mfTheme';

const M = motion.create(Box);
const reveal = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const PLANS = {
  monthly: { starter: 49, growth: 129, pro: 299 },
  annual:  { starter: 39, growth: 99,  pro: 239 },
};

const PLAN_FEATURES = [
  { name: 'Starter', desc: 'Essential tools for small cafes.',          features: ['Digital QR Menus', 'Basic Analytics', 'Up to 50 items', 'Standard Support'],                                                         popular: false },
  { name: 'Growth',  desc: 'Complete digital ordering system.',         features: ['Direct Table Ordering', 'POS Integration', 'Real-time Dashboard', 'Stripe/Square Payments', 'Custom Branding'],                       popular: true  },
  { name: 'Pro',     desc: 'Enterprise power for multi-locations.',      features: ['Multi-location Manager', 'AI Inventory Forecast', 'Dedicated Account Manager', 'API Access', 'White-label Solution'],               popular: false },
];

const COMPARE_ROWS = [
  { section: 'Core Ordering', rows: [
    { feature: 'Digital QR Menu',   starter: true,  growth: true,  pro: true  },
    { feature: 'Dine-in Ordering',  starter: false, growth: true,  pro: true  },
    { feature: 'Order at Counter',  starter: true,  growth: true,  pro: true  },
    { feature: 'Scheduled Orders',  starter: false, growth: true,  pro: true  },
  ]},
  { section: 'Integrations', rows: [
    { feature: 'Stripe / Square',       starter: true,  growth: true,  pro: true  },
    { feature: 'POS Integration',       starter: false, growth: true,  pro: true  },
    { feature: 'DoorDash/UberEats sync',starter: false, growth: false, pro: true  },
  ]},
  { section: 'Marketing & Analytics', rows: [
    { feature: 'Customer Data Capture', starter: false, growth: true,  pro: true  },
    { feature: 'Loyalty Program',       starter: false, growth: false, pro: true  },
    { feature: 'Real-time SMS Updates', starter: false, growth: true,  pro: true  },
    { feature: 'Inventory Management',  starter: false, growth: false, pro: true  },
  ]},
];

const FAQS = [
  { q: 'Can I change plans later?',            a: 'Yes, upgrade or downgrade at any time. Changes reflect in your next billing cycle. Upgrades mid-month are prorated.' },
  { q: 'What payment methods do you support?', a: 'All major credit cards, Apple Pay, and Google Pay via Stripe. Enterprise plans also support bank transfers.' },
  { q: 'Are there any hidden transaction fees?',a: 'No hidden fees from MenuFlow. You pay your monthly subscription and standard Stripe/Square processing fees (2.9% + 30¢).' },
  { q: 'Do you offer a free trial?',           a: 'Yes! Every plan starts with a 14-day free trial. No credit card required.' },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ ...glass, borderRadius: '12px', overflow: 'hidden', mb: 2 }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{q}</Typography>
        <span className="material-symbols-outlined" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>expand_more</span>
      </Box>
      {open && <Box sx={{ px: 3, pb: 3 }}><Typography sx={{ fontSize: 15, color: MF.textSub, lineHeight: 1.7 }}>{a}</Typography></Box>}
    </Box>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [orders, setOrders] = useState(1000);
  const [aov, setAov] = useState(45);

  const mode = isAnnual ? 'annual' : 'monthly';
  const savings = Math.round(orders * aov * 0.15 + orders * 1.5);

  return (
    <Box sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <MenuFlowNav />
      <Box component="main" sx={{ pt: '72px' }}>

        {/* Hero */}
        <Box component="section" sx={{ position: 'relative', pt: 10, pb: 0, px: 6, overflow: 'hidden' }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Flexible Plans</Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: 36, md: 48 }, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, mb: 3, maxWidth: 600, mx: 'auto' }}>
              Simple, transparent pricing for restaurants of all sizes.
            </Typography>
            <Typography sx={{ fontSize: 17, color: MF.textSub, maxWidth: 520, mx: 'auto', mb: 6, lineHeight: 1.65 }}>
              Choose the perfect plan to streamline your operations, increase order value, and delight your guests.
            </Typography>
            {/* Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 10 }}>
              <Typography sx={{ fontSize: 15, fontWeight: isAnnual ? 400 : 700, color: isAnnual ? MF.textSub : MF.text }}>Monthly</Typography>
              <Box onClick={() => setIsAnnual(a => !a)} sx={{
                width: 56, height: 28, bgcolor: isAnnual ? MF.primaryFixed : MF.surfaceHigh,
                borderRadius: '9999px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.3s',
              }}>
                <Box sx={{
                  position: 'absolute', top: 2, left: isAnnual ? 30 : 2,
                  width: 24, height: 24, bgcolor: MF.primary, borderRadius: '50%', transition: 'left 0.3s',
                }} />
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: isAnnual ? 700 : 400, color: isAnnual ? MF.text : MF.textSub }}>
                Annual <Box component="span" sx={{ color: MF.primary, fontSize: 12, fontWeight: 700, ml: 0.5 }}>(Save 20%)</Box>
              </Typography>
            </Box>
          </Box>
          <Box sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, bgcolor: `${MF.primary}08`, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
        </Box>

        {/* Pricing cards */}
        <Box component="section" sx={{ px: 6, pb: 10 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3, alignItems: 'center' }}>
            {PLAN_FEATURES.map(({ name, desc, features, popular }) => (
              <M key={name} initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }}>
                <Box sx={{
                  ...glass, borderRadius: '24px', p: 5, position: 'relative',
                  display: 'flex', flexDirection: 'column',
                  ...(popular ? { bgcolor: MF.surfaceLowest, border: `1px solid ${MF.primary}33`, boxShadow: '0 20px 50px rgba(70,72,212,0.1)' } : {}),
                }}>
                  {popular && (
                    <Box sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', bgcolor: MF.primary, color: '#fff', px: 2, py: 0.5, borderRadius: '9999px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      Most Popular
                    </Box>
                  )}
                  <Typography sx={{ fontSize: 24, fontWeight: 600, mb: 0.5 }}>{name}</Typography>
                  <Typography sx={{ fontSize: 13, color: MF.textSub, mb: 3 }}>{desc}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 5 }}>
                    <Typography sx={{ fontSize: 24, fontWeight: 700, color: MF.text }}>$</Typography>
                    <Typography sx={{ fontSize: 64, fontWeight: 900, color: MF.text, lineHeight: 1, letterSpacing: '-0.04em' }}>{PLANS[mode][name.toLowerCase()]}</Typography>
                    <Typography sx={{ color: MF.outlineVar, ml: 0.5 }}>/mo</Typography>
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, mb: 8 }}>
                    {features.map(f => (
                      <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 20 }}>check_circle</span>
                        <Typography sx={{ fontSize: 15 }}>{f}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box component="button" onClick={() => navigate(popular ? '/register' : '/contact')} sx={{
                    width: '100%', py: 1.5, borderRadius: '12px', fontWeight: 700, fontSize: 15,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                    ...(popular
                      ? { background: `linear-gradient(135deg, ${MF.primary} 0%, ${MF.secondary} 100%)`, color: '#fff', border: 'none', boxShadow: `0 8px 20px ${MF.primary}4D` }
                      : { bgcolor: 'transparent', border: `1px solid ${MF.outlineVar}`, color: MF.text, '&:hover': { bgcolor: MF.surfaceLow } }
                    ),
                  }}>
                    {popular ? 'Get Started Now' : name === 'Pro' ? 'Contact Sales' : 'Choose Starter'}
                  </Box>
                </Box>
              </M>
            ))}
          </Box>
        </Box>

        {/* ROI Calculator */}
        <Box component="section" sx={{ bgcolor: MF.surfaceLow, py: 10, px: 6 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Box sx={{ ...glass, borderRadius: '32px', overflow: 'hidden', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}>
              {/* Left (primary) */}
              <Box sx={{ bgcolor: MF.primary, color: '#fff', p: { xs: 5, lg: 8 } }}>
                <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 2 }}>Calculate your savings</Typography>
                <Typography sx={{ fontSize: 17, opacity: 0.9, mb: 5, lineHeight: 1.65 }}>
                  See how much labor cost and overhead you can reduce by switching to MenuFlow digital ordering.
                </Typography>
                <Box sx={{ mb: 5 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8, mb: 1 }}>Monthly Orders</Typography>
                  <Box component="input" type="range" min={100} max={5000} step={100} value={orders} onChange={e => setOrders(+e.target.value)}
                    sx={{ width: '100%', accentColor: '#fff', cursor: 'pointer', mb: 0.5 }} />
                  <Typography sx={{ fontWeight: 700 }}>{orders.toLocaleString()} orders</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8, mb: 1 }}>Avg. Order Value ($)</Typography>
                  <Box component="input" type="range" min={10} max={150} step={5} value={aov} onChange={e => setAov(+e.target.value)}
                    sx={{ width: '100%', accentColor: '#fff', cursor: 'pointer', mb: 0.5 }} />
                  <Typography sx={{ fontWeight: 700 }}>${aov}</Typography>
                </Box>
              </Box>
              {/* Right */}
              <Box sx={{ p: { xs: 5, lg: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary, mb: 0.5 }}>Estimated Monthly Savings</Typography>
                <Typography sx={{ fontSize: 80, fontWeight: 900, color: MF.primary, lineHeight: 1.1, letterSpacing: '-0.04em', mb: 2 }}>
                  ${savings.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: 14, color: MF.textSub, maxWidth: 280, lineHeight: 1.7 }}>
                  Based on a 15% increase in upsells and 20 hours saved in order processing per month.
                </Typography>
                <Box sx={{ width: '100%', borderTop: `1px solid ${MF.outlineVar}33`, mt: 4, pt: 4, display: 'flex', gap: 5, justifyContent: 'center' }}>
                  {[{ v: '+15%', l: 'Avg. Revenue' }, { v: '-30%', l: 'Labor Cost' }].map(({ v, l }) => (
                    <Box key={v} sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{v}</Typography>
                      <Typography sx={{ fontSize: 13, color: MF.textSub }}>{l}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Feature comparison table */}
        <Box component="section" sx={{ py: 10, px: 6, bgcolor: MF.surfaceLowest }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 1.5 }}>Compare our features</Typography>
              <Typography sx={{ fontSize: 16, color: MF.textSub }}>Every detail you need to make the right choice.</Typography>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <Box component="thead">
                  <Box component="tr" sx={{ borderBottom: `1px solid ${MF.outlineVar}` }}>
                    <Box component="th" sx={{ py: 3, px: 2, textAlign: 'left', fontSize: 20, fontWeight: 600 }}>Features</Box>
                    {['Starter', 'Growth', 'Pro'].map((p, i) => (
                      <Box key={p} component="th" sx={{ py: 3, px: 2, textAlign: 'center', fontSize: 17, fontWeight: 700, color: i === 1 ? MF.primary : MF.text }}>{p}</Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {COMPARE_ROWS.map(({ section, rows }) => (
                    <React.Fragment key={section}>
                      <Box component="tr" sx={{ bgcolor: MF.surfaceLow }}>
                        <Box component="td" colSpan={4} sx={{ py: 1, px: 2, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MF.primary }}>
                          {section}
                        </Box>
                      </Box>
                      {rows.map(({ feature, starter, growth, pro }) => (
                        <Box key={feature} component="tr" sx={{ borderBottom: `1px solid ${MF.outlineVar}33` }}>
                          <Box component="td" sx={{ py: 2, px: 2, fontSize: 15 }}>{feature}</Box>
                          {[starter, growth, pro].map((val, i) => (
                            <Box key={i} component="td" sx={{ py: 2, px: 2, textAlign: 'center' }}>
                              {val
                                ? <span className="material-symbols-outlined" style={{ color: MF.primary }}>check</span>
                                : <Typography sx={{ color: MF.outlineVar }}>—</Typography>
                              }
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* FAQ */}
        <Box component="section" sx={{ py: 10, px: 6 }}>
          <Box sx={{ maxWidth: 768, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 1.5 }}>Frequently Asked Questions</Typography>
              <Typography sx={{ fontSize: 16, color: MF.textSub }}>Everything you need to know about our pricing and setup.</Typography>
            </Box>
            {FAQS.map(faq => <FAQ key={faq.q} {...faq} />)}
          </Box>
        </Box>
      </Box>
      <MenuFlowFooter />
    </Box>
  );
}
