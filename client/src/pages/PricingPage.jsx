import { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF, glass } from './menuflow/mfTheme';

const M = motion.create(Box);
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp  = { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } } };

function AnimatedNum({ value }) {
  const ref = useRef(null);
  const prev = useRef(value);
  useEffect(() => {
    const ctrl = animate(prev.current, value, { duration: 0.5, ease: 'easeOut', onUpdate: v => { if (ref.current) ref.current.textContent = Math.round(v); } });
    prev.current = value;
    return ctrl.stop;
  }, [value]);
  return <span ref={ref}>{value}</span>;
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.2 }}>
      <Box sx={{ background: '#fff', border: '1px solid rgba(228,228,231,0.6)', borderRadius: '16px', overflow: 'hidden', mb: 2 }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 2 }} onClick={() => setOpen(o => !o)}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{q}</Typography>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <span className="material-symbols-outlined" style={{ flexShrink: 0 }}>expand_more</span>
          </motion.span>
        </Box>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <Box sx={{ px: 3, pb: 3 }}>
                <Typography sx={{ fontSize: 15, color: MF.textSub, lineHeight: 1.75 }}>{a}</Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
}

const PLANS = {
  monthly: { starter: 49,  growth: 129, pro: 299 },
  annual:  { starter: 39,  growth: 99,  pro: 239 },
};

const PLAN_FEATURES = [
  { name: 'Starter',    desc: 'Essential tools for small cafes.',      features: ['Digital QR Menus', 'Basic Analytics', 'Up to 50 items', 'Standard Support'], popular: false },
  { name: 'Growth',     desc: 'Complete digital ordering system.',     features: ['Direct Table Ordering', 'POS Integration', 'Real-time Dashboard', 'Stripe/Square Payments', 'Custom Branding'], popular: true  },
  { name: 'Enterprise', desc: 'Enterprise power for multi-locations.', features: ['Multi-location Manager', 'AI Inventory Forecast', 'Dedicated Account Manager', 'API Access', 'White-label'], popular: false },
];

const COMPARE_ROWS = [
  { section: 'Core Ordering', rows: [
    { feature: 'Digital QR Menu',   s: true,  g: true,  p: true  },
    { feature: 'Dine-in Ordering',  s: false, g: true,  p: true  },
    { feature: 'Order at Counter',  s: true,  g: true,  p: true  },
    { feature: 'Scheduled Orders',  s: false, g: true,  p: true  },
  ]},
  { section: 'Integrations', rows: [
    { feature: 'Stripe / Square',        s: true,  g: true,  p: true  },
    { feature: 'POS Integration',        s: false, g: true,  p: true  },
    { feature: 'DoorDash/UberEats sync', s: false, g: false, p: true  },
  ]},
  { section: 'Marketing & Analytics', rows: [
    { feature: 'Customer Data Capture',  s: false, g: true,  p: true  },
    { feature: 'Loyalty Program',        s: false, g: false, p: true  },
    { feature: 'Real-time SMS Updates',  s: false, g: true,  p: true  },
    { feature: 'Inventory Management',   s: false, g: false, p: true  },
  ]},
];

const FAQS = [
  { q: 'Can I change plans later?',            a: 'Yes, upgrade or downgrade any time. Changes reflect in your next billing cycle. Upgrades mid-month are prorated.' },
  { q: 'What payment methods do you support?', a: 'All major credit cards, Apple Pay, and Google Pay via Stripe. Enterprise plans also support bank transfers.' },
  { q: 'Are there any hidden transaction fees?',a: 'No hidden fees from MenuFlow. You pay your monthly subscription and standard Stripe/Square processing fees (2.9% + 30¢).' },
  { q: 'Do you offer a free trial?',           a: 'Yes! Every plan starts with a 30-day free trial. No credit card required.' },
  { q: 'How long does onboarding take?',       a: 'Most restaurants are fully live within 20 minutes. Our onboarding wizard guides you step by step.' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [orders,   setOrders]   = useState(1000);
  const [aov,      setAov]      = useState(45);

  const mode    = isAnnual ? 'annual' : 'monthly';
  const savings = Math.round(orders * aov * 0.15 + orders * 1.5);

  return (
    <Box sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <MenuFlowNav />

      {/* ── Hero ── */}
      <Box component="section" sx={{
        position: 'relative', minHeight: '64vh',
        display: 'flex', alignItems: 'center', overflow: 'hidden',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fffaf6 55%, #fff7ed 100%)',
        pt: '72px',
      }}>
        {[
          { top: '-8%', left: '-4%',   w: 520, color: `${MF.primary}18`, dur: 20 },
          { bottom: '-8%', right: '-4%', w: 420, color: '#fb923c14', dur: 24, delay: 6 },
        ].map((o, i) => (
          <M key={i} animate={{ x: [0, 50, 0], y: [0, -40, 0] }} transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: o.delay || 0 }}
            sx={{ position: 'absolute', ...o, width: o.w, height: o.w, borderRadius: '50%', background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        ))}
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />

        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 3, md: 6 }, width: '100%', zIndex: 1, textAlign: 'center', py: 12 }}>
          <M initial="hidden" animate="visible" variants={stagger}>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Flexible Plans</Typography>
            </M>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: { xs: 38, md: 60, lg: 68 }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.07, mb: 3, color: MF.text, fontFamily: 'Manrope, Inter, sans-serif', maxWidth: 760, mx: 'auto' }}>
                Simple, transparent pricing for restaurants{' '}
                <Box component="span" sx={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  of all sizes.
                </Box>
              </Typography>
            </M>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: MF.textSub, mb: 7, maxWidth: 520, mx: 'auto', lineHeight: 1.75 }}>
                Choose the perfect plan to streamline operations, increase order value, and delight your guests.
              </Typography>
            </M>
            {/* Toggle */}
            <M variants={fadeUp}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Typography sx={{ fontSize: 15, fontWeight: isAnnual ? 400 : 700, color: isAnnual ? MF.textSub : MF.text, transition: 'color 0.3s' }}>Monthly</Typography>
                <Box onClick={() => setIsAnnual(a => !a)} sx={{ width: 56, height: 28, bgcolor: isAnnual ? MF.primary : MF.outlineVar, borderRadius: '9999px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.3s' }}>
                  <motion.div animate={{ left: isAnnual ? 30 : 2 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ position: 'absolute', top: 2, width: 24, height: 24, background: '#fff', borderRadius: '50%' }} />
                </Box>
                <Typography sx={{ fontSize: 15, fontWeight: isAnnual ? 700 : 400, color: isAnnual ? MF.text : MF.textSub, transition: 'color 0.3s' }}>
                  Annual{' '}
                  <Box component="span" sx={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: 12, fontWeight: 800 }}>
                    Save 20%
                  </Box>
                </Typography>
              </Box>
            </M>
          </M>
        </Box>
      </Box>

      {/* ── Pricing Cards ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3, alignItems: 'center' }}>
          {PLAN_FEATURES.map(({ name, desc, features, popular }, i) => (
            <motion.div key={name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              style={{ cursor: 'pointer' }}
            >
              <Box sx={{
                background: '#fff',
                borderRadius: '28px', p: { xs: 4, md: 5.5 }, position: 'relative',
                border: popular ? `2px solid ${MF.primary}55` : '1px solid rgba(228,228,231,0.6)',
                boxShadow: popular ? `0 20px 60px ${MF.primary}15` : '0 8px 24px rgba(0,0,0,0.05)',
                ...(popular && { transform: 'scale(1.04)', zIndex: 1 }),
                display: 'flex', flexDirection: 'column',
              }}>
                {popular && (
                  <Box sx={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', background: MF.gradient, color: '#fff', px: 3, py: 0.75, borderRadius: '100px', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Most Popular
                  </Box>
                )}
                <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.75 }}>{name}</Typography>
                <Typography sx={{ fontSize: 13, color: MF.textSub, mb: 3.5 }}>{desc}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 5 }}>
                  <Typography sx={{ fontSize: 22, fontWeight: 700, color: MF.text }}>$</Typography>
                  <Typography sx={{ fontSize: 60, fontWeight: 900, color: popular ? MF.primary : MF.text, lineHeight: 1, letterSpacing: '-0.05em' }}>
                    <AnimatedNum value={PLANS[mode][name.toLowerCase()] || 0} />
                  </Typography>
                  <Typography sx={{ color: MF.outlineVar, ml: 0.5, fontSize: 15 }}>
                    {name === 'Enterprise' ? 'custom' : '/mo'}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, mb: 5.5 }}>
                  {features.map(f => (
                    <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: `${MF.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 13 }}>check</span>
                      </Box>
                      <Typography sx={{ fontSize: 14, color: MF.textSub }}>{f}</Typography>
                    </Box>
                  ))}
                </Box>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(popular ? '/register' : '/contact')}
                  style={{ width: '100%', padding: '15px', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Inter, sans-serif', ...(popular ? { background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', boxShadow: '0 10px 30px rgba(249,115,22,0.35)' } : { background: 'transparent', border: `1.5px solid ${MF.outlineVar}`, color: MF.text }) }}>
                  {popular ? 'Start Free Trial' : name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </motion.button>
              </Box>
            </motion.div>
          ))}
        </Box>
        <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} sx={{ textAlign: 'center', mt: 5 }}>
          <Typography sx={{ fontSize: 13, color: MF.textSub }}>
            All plans include a 30-day free trial. No credit card required.
            <Box component="span" sx={{ ml: 1, color: MF.primary, fontWeight: 700 }}>Cancel any time.</Box>
          </Typography>
        </M>
      </Box>

      {/* ── ROI Calculator ── */}
      <Box component="section" sx={{ bgcolor: MF.surfaceLow, py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 600, background: `radial-gradient(ellipse, ${MF.primary}08 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <Box sx={{ maxWidth: 1000, mx: 'auto', position: 'relative', zIndex: 1 }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>ROI Calculator</Typography>
              <Typography sx={{ fontSize: { xs: 30, md: 48 }, fontWeight: 900, letterSpacing: '-0.035em', color: MF.text, fontFamily: 'Manrope, Inter, sans-serif' }}>Calculate your savings</Typography>
            </Box>
          </M>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <Box sx={{ background: '#fff', border: `1px solid ${MF.outlineVar}`, borderRadius: '32px', overflow: 'hidden', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}>
              <Box sx={{ p: { xs: 5, lg: 8 } }}>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: MF.text, mb: 1.5 }}>Adjust your volume</Typography>
                <Typography sx={{ fontSize: 14, color: MF.textSub, mb: 5 }}>See how much you could save by switching.</Typography>
                {[
                  { label: 'Monthly Orders', value: orders, set: setOrders, min: 100, max: 5000, step: 100, fmt: v => `${v.toLocaleString()} orders` },
                  { label: 'Avg. Order Value', value: aov, set: setAov, min: 10, max: 150, step: 5, fmt: v => `$${v}` },
                ].map(({ label, value, set, min, max, step, fmt }) => (
                  <Box key={label} sx={{ mb: 5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: MF.textSub, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: MF.text }}>{fmt(value)}</Typography>
                    </Box>
                    <Box component="input" type="range" min={min} max={max} step={step} value={value} onChange={e => set(+e.target.value)}
                      sx={{ width: '100%', accentColor: MF.primary, cursor: 'pointer', height: 4 }} />
                  </Box>
                ))}
              </Box>
              <Box sx={{ p: { xs: 5, lg: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', borderLeft: { lg: `1px solid ${MF.outlineVar}` }, borderTop: { xs: `1px solid ${MF.outlineVar}`, lg: 'none' }, bgcolor: MF.surfaceLow }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary, mb: 1.5 }}>
                  Estimated Monthly Savings
                </Typography>
                <motion.div key={savings} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
                  <Typography sx={{ fontSize: { xs: 64, md: 80 }, fontWeight: 900, color: MF.text, lineHeight: 1.1, letterSpacing: '-0.05em', mb: 1 }}>
                    ${savings.toLocaleString()}
                  </Typography>
                </motion.div>
                <Typography sx={{ fontSize: 14, color: MF.textSub, maxWidth: 280, lineHeight: 1.75, mb: 5 }}>
                  Based on a 15% increase in upsells and 20 hours saved in order processing per month.
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, width: '100%', pt: 4, borderTop: `1px solid ${MF.outlineVar}` }}>
                  {[{ v: '+15%', l: 'Avg. Revenue' }, { v: '-30%', l: 'Labor Cost' }].map(({ v, l }) => (
                    <Box key={v} sx={{ textAlign: 'center', bgcolor: `${MF.primary}08`, borderRadius: '16px', p: 2.5, border: `1px solid ${MF.outlineVar}` }}>
                      <Typography sx={{ fontSize: 26, fontWeight: 900, color: v.startsWith('+') ? '#10b981' : '#f97316' }}>{v}</Typography>
                      <Typography sx={{ fontSize: 12, color: MF.textSub, mt: 0.5 }}>{l}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* ── Comparison Table ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, bgcolor: MF.surfaceLow }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Feature comparison</Typography>
              <Typography sx={{ fontSize: { xs: 30, md: 44 }, fontWeight: 900, letterSpacing: '-0.035em', fontFamily: 'Manrope, Inter, sans-serif' }}>Every detail, side by side</Typography>
            </Box>
          </M>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <Box sx={{ background: '#fff', border: '1px solid rgba(228,228,231,0.6)', borderRadius: '24px', overflow: 'hidden' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                <Box component="thead">
                  <Box component="tr" sx={{ borderBottom: `1px solid ${MF.outlineVar}50` }}>
                    <Box component="th" sx={{ py: 3.5, px: 3, textAlign: 'left', fontSize: 16, fontWeight: 600 }}>Features</Box>
                    {['Starter', 'Growth', 'Enterprise'].map((p, i) => (
                      <Box key={p} component="th" sx={{ py: 3.5, px: 3, textAlign: 'center', fontSize: 15, fontWeight: 800, color: i === 1 ? MF.primary : MF.text }}>{p}</Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {COMPARE_ROWS.map(({ section, rows }) => (
                    <>
                      <Box key={section} component="tr" sx={{ bgcolor: MF.surfaceLow }}>
                        <Box component="td" colSpan={4} sx={{ py: 1.5, px: 3, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary }}>
                          {section}
                        </Box>
                      </Box>
                      {rows.map(({ feature, s, g, p }) => (
                        <Box key={feature} component="tr" sx={{ borderBottom: `1px solid ${MF.outlineVar}33`, '&:hover': { bgcolor: `${MF.primary}05` } }}>
                          <Box component="td" sx={{ py: 2.5, px: 3, fontSize: 14 }}>{feature}</Box>
                          {[s, g, p].map((val, i) => (
                            <Box key={i} component="td" sx={{ py: 2.5, px: 3, textAlign: 'center' }}>
                              {val
                                ? <span className="material-symbols-outlined" style={{ color: MF.primary, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                : <Typography sx={{ color: MF.outlineVar, fontSize: 20 }}>—</Typography>
                              }
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </>
                  ))}
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* ── FAQ ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>FAQ</Typography>
              <Typography sx={{ fontSize: { xs: 30, md: 44 }, fontWeight: 900, letterSpacing: '-0.035em', fontFamily: 'Manrope, Inter, sans-serif' }}>Got questions?</Typography>
            </Box>
          </M>
          {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
        </Box>
      </Box>

      <MenuFlowFooter />
    </Box>
  );
}
