import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import PricingSection from './menuflow/PricingSection';
import { MF } from './menuflow/mfTheme';

const M = motion.create(Box);
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp = { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } } };



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



const COMPARE_ROWS = [
  {
    section: 'Core Ordering', rows: [
      { feature: 'Digital QR Menu', s: true, g: true, p: true },
      { feature: 'Dine-in Ordering', s: false, g: true, p: true },
      { feature: 'Order at Counter', s: true, g: true, p: true },
      { feature: 'Scheduled Orders', s: false, g: true, p: true },
    ]
  },
];

const FAQS = [
  { q: 'Can I change plans later?', a: 'Yes, upgrade or downgrade any time. Changes reflect in your next billing cycle. Upgrades mid-month are prorated.' },
  { q: 'What payment methods do you support?', a: 'All major credit cards, Apple Pay, and Google Pay via Stripe. Enterprise plans also support bank transfers.' },
  { q: 'Are there any hidden transaction fees?', a: 'No hidden fees from ScanIt. You pay your monthly subscription and standard Stripe/Square processing fees (2.9% + 30¢).' },
  { q: 'Do you offer a free trial?', a: 'Yes! Every plan starts with a 30-day free trial. No credit card required.' },
  { q: 'How long does onboarding take?', a: 'Most restaurants are fully live within 20 minutes. Our onboarding wizard guides you step by step.' },
];

export default function PricingPage() {
  const navigate = useNavigate();

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
          { top: '-8%', left: '-4%', w: 520, color: `${MF.primary}18`, dur: 20 },
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

          </M>
        </Box>
      </Box>

      {/* ── Pricing Cards ── */}
      <PricingSection locale="US" showHeader={false} />

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
            <Box sx={{ background: '#fff', border: '1px solid rgba(228,228,231,0.6)', borderRadius: '24px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <Box sx={{ minWidth: 720 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: `1px solid ${MF.outlineVar}50` }}>
                      <Box component="th" sx={{ position: 'sticky', left: 0, bgcolor: '#ffffff', zIndex: 10, py: 3.5, px: 3, textAlign: 'left', fontSize: 16, fontWeight: 600, borderRight: `1px solid ${MF.outlineVar}33` }}>Features</Box>
                      {['Bronze', 'Silver', 'Gold'].map((p, i) => (
                        <Box key={p} component="th" sx={{ py: 3.5, px: 3, textAlign: 'center', fontSize: 15, fontWeight: 800, color: i === 1 ? MF.primary : MF.text, minWidth: 120 }}>{p}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {COMPARE_ROWS.map(({ section, rows }) => (
                      <React.Fragment key={section}>
                        <Box component="tr" sx={{ bgcolor: MF.surfaceLow }}>
                          <Box component="td" sx={{ position: 'sticky', left: 0, bgcolor: MF.surfaceLow, py: 1.5, px: 3, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary, zIndex: 8, borderRight: `1px solid ${MF.outlineVar}33` }}>
                            {section}
                          </Box>
                          <Box component="td" sx={{ bgcolor: MF.surfaceLow }} />
                          <Box component="td" sx={{ bgcolor: MF.surfaceLow }} />
                          <Box component="td" sx={{ bgcolor: MF.surfaceLow }} />
                        </Box>
                        {rows.map(({ feature, s, g, p }) => (
                          <Box key={feature} component="tr" sx={{ borderBottom: `1px solid ${MF.outlineVar}33`, '&:hover': { bgcolor: `${MF.primary}05`, '& td:first-of-type': { bgcolor: '#fff9f4' } } }}>
                            <Box component="td" sx={{ position: 'sticky', left: 0, bgcolor: '#ffffff', py: 2.5, px: 3, fontSize: 14, borderRight: `1px solid ${MF.outlineVar}33`, zIndex: 7 }}>{feature}</Box>
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
                      </React.Fragment>
                    ))}
                  </Box>
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
