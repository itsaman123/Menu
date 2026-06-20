import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF, glass } from './menuflow/mfTheme';

const M = motion.create(Box);
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp  = { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } } };

function PinCard({ icon, title, desc, color = MF.primary, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 60, position: 'relative' }}
    >
      <motion.div
        animate={{ y: hovered ? -28 : 0, rotateX: hovered ? 6 : 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: 'preserve-3d', width: '100%' }}
      >
        <Box sx={{
          background: '#fff',
          border: hovered ? `1px solid ${color}55` : '1px solid rgba(232,213,196,0.6)',
          borderRadius: '24px', p: { xs: 3.5, md: 4.5 },
          boxShadow: hovered ? `0 24px 60px ${color}18, 0 8px 20px rgba(0,0,0,0.06)` : '0 8px 24px rgba(0,0,0,0.04)',
          transition: 'border-color 0.3s, box-shadow 0.3s', height: '100%',
        }}>
          <Box sx={{
            width: 54, height: 54, borderRadius: '16px',
            background: `linear-gradient(135deg, ${color}18, ${color}38)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
            border: `1px solid ${color}28`,
          }}>
            <span className="material-symbols-outlined" style={{ color, fontSize: 28, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
          </Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 1.5, color: MF.text, letterSpacing: '-0.01em' }}>{title}</Typography>
          <Typography sx={{ fontSize: 14, color: MF.textSub, lineHeight: 1.7 }}>{desc}</Typography>
        </Box>
      </motion.div>
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ scaleY: 0, opacity: 0 }}
            style={{ transformOrigin: 'top', width: 2, height: 50, background: `linear-gradient(to bottom, ${color}, transparent)`, marginTop: 4 }}
          />
        )}
      </AnimatePresence>
      <Box sx={{ position: 'absolute', bottom: 14, width: hovered ? 14 : 10, height: hovered ? 14 : 10, borderRadius: '50%', bgcolor: color, boxShadow: hovered ? `0 0 22px 6px ${color}88` : `0 0 10px 2px ${color}55`, transition: 'all 0.3s' }} />
    </motion.div>
  );
}

const FEATURES = [
  { icon: 'qr_code_2',       title: 'Smart QR Menus',     desc: 'High-res digital menus with instant item updates and dynamic pricing. Scan in <200ms.',        color: MF.primary },
  { icon: 'restaurant_menu', title: 'Visual Menu Builder', desc: 'Drag-and-drop editor with rich media support and stunning food photography layouts.',            color: '#7c3aed'  },
  { icon: 'monitoring',      title: 'Order Tracking',      desc: 'Real-time order lifecycle monitoring from preparation through to final table delivery.',          color: '#059669'  },
  { icon: 'verified_user',   title: 'OTP Verification',   desc: 'Secure customer authentication for loyalty programs and contactless payment flows.',              color: '#0891b2'  },
  { icon: 'query_stats',     title: 'Deep Analytics',      desc: 'Insights into menu performance, server efficiency, and customer behavior patterns in real-time.', color: '#d97706'  },
  { icon: 'hub',             title: 'Multi-location',      desc: 'Unified management for franchises. Centralize control with localized menu flexibility.',           color: '#dc2626'  },
];

const WORKFLOW = [
  { icon: 'qr_code_scanner',        step: 'Instant Scan',   desc: 'Guest scans the table QR. No app required. Opens in <200ms.' },
  { icon: 'shopping_cart_checkout',  step: 'Smart Order',    desc: 'AI-driven suggestions boost average order value by 18%.' },
  { icon: 'receipt_long',            step: 'Kitchen Sync',   desc: 'Orders route instantly to specific stations — Grill, Bar, Pastry.' },
  { icon: 'check_circle',            step: 'Fulfillment',    desc: 'Kitchen marks ready. Server notified. Payment settled via OTP or Card.' },
];

const COMPARE = [
  ['Manual daily reconciliation', 'Real-time live dashboard'],
  ['Weekly physical inventory',   'Automated SKU tracking'],
  ['Guesses on popularity',       'Heatmaps of customer clicks'],
  ['Reprinting for menu changes', 'Dynamic updates — no reprint'],
];

export default function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <MenuFlowNav />

      {/* ── Hero ── */}
      <Box component="section" sx={{
        position: 'relative', minHeight: '70vh',
        display: 'flex', alignItems: 'center', overflow: 'hidden',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fffaf6 55%, #fff7ed 100%)',
        pt: '72px',
      }}>
        {[
          { top: '-10%', left: '-4%',  w: 560, color: `${MF.primary}20`, dur: 20 },
          { bottom: '-8%', right: '-4%', w: 440, color: '#fb923c14', dur: 25, delay: 5 },
          { top: '40%', right: '30%',   w: 280, color: '#ea580c12', dur: 16, delay: 8 },
        ].map((o, i) => (
          <M key={i}
            animate={{ x: [0, 55, 0], y: [0, -45, 0] }}
            transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: o.delay || 0 }}
            sx={{ position: 'absolute', ...o, width: o.w, height: o.w, borderRadius: '50%', background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`, pointerEvents: 'none' }}
          />
        ))}
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />

        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 3, md: 6 }, width: '100%', zIndex: 1, textAlign: 'center', py: 14 }}>
          <M initial="hidden" animate="visible" variants={stagger}>
            <M variants={fadeUp}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, bgcolor: `rgba(249,115,22,0.1)`, border: `1px solid rgba(249,115,22,0.22)`, borderRadius: '100px', px: 2.5, py: 0.875, mb: 4 }}>
                <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 16, fontVariationSettings: "'FILL' 1" }}>verified</span>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: MF.textSub, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Enterprise Grade</Typography>
              </Box>
            </M>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: { xs: 38, md: 60, lg: 72 }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.07, mb: 3, color: MF.text, fontFamily: 'Manrope, Inter, sans-serif', maxWidth: 860, mx: 'auto' }}>
                Features built for{' '}
                <Box component="span" sx={{ background: 'linear-gradient(135deg, #f97316, #ea580c, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  high-performance
                </Box>
                {' '}restaurants.
              </Typography>
            </M>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: MF.textSub, mb: 6, maxWidth: 620, mx: 'auto', lineHeight: 1.75 }}>
                From rapid-response ordering to multi-location synchronization, every module is engineered for precision in hospitality management.
              </Typography>
            </M>
            <M variants={fadeUp}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button whileHover={{ scale: 1.04, boxShadow: '0 16px 48px rgba(249,115,22,0.5)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')}
                  style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', padding: '15px 34px', borderRadius: 14, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 10px 30px rgba(249,115,22,0.4)' }}>
                  Explore All Modules
                </motion.button>
                <motion.button whileHover={{ scale: 1.03, background: MF.surfaceLow }} whileTap={{ scale: 0.97 }}
                  style={{ background: '#fff', color: MF.text, border: `1px solid rgba(249,115,22,0.2)`, padding: '15px 34px', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  ▶ Watch Demo
                </motion.button>
              </Box>
            </M>
          </M>
        </Box>
      </Box>

      {/* ── Feature Pin Cards ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 16 }, px: { xs: 3, md: 6 }, maxWidth: 1280, mx: 'auto' }}>
        <M initial="hidden" whileInView="visible" variants={stagger} viewport={{ once: true }}>
          <M variants={fadeUp} sx={{ textAlign: 'center', mb: 10 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Operational ecosystem</Typography>
            <Typography sx={{ fontSize: { xs: 32, md: 48 }, fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.1, fontFamily: 'Manrope, Inter, sans-serif' }}>
              A modular suite<br />built to scale
            </Typography>
          </M>
        </M>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3,1fr)' }, gap: 3 }}>
          {FEATURES.map((f, i) => <PinCard key={f.title} {...f} index={i} />)}
        </Box>
      </Box>

      {/* ── Analytics deep-dive ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, bgcolor: MF.surfaceLow }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 10, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Advanced Insights</Typography>
            <Typography sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 900, letterSpacing: '-0.03em', mb: 2.5, lineHeight: 1.15, fontFamily: 'Manrope, Inter, sans-serif' }}>
              Analytics that drive profitability
            </Typography>
            <Typography sx={{ fontSize: 17, color: MF.textSub, mb: 5, lineHeight: 1.7 }}>
              Our engine reveals the 'why' behind customer choices — track margin-by-item, peak-time velocity, and retention metrics in real-time.
            </Typography>
            <Box sx={{ borderRadius: '20px', border: `1px solid ${MF.outlineVar}`, overflow: 'hidden', bgcolor: MF.surfaceLowest }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', bgcolor: MF.surface, borderBottom: `1px solid ${MF.outlineVar}` }}>
                <Typography sx={{ p: 2.5, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MF.textSub }}>Traditional</Typography>
                <Typography sx={{ p: 2.5, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MF.primary }}>With MenuFlow</Typography>
              </Box>
              {COMPARE.map(([old, neo], i) => (
                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: i < COMPARE.length - 1 ? `1px solid ${MF.outlineVar}33` : 'none' }}>
                  <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: 16 }}>close</span>
                    <Typography sx={{ fontSize: 13, color: MF.textSub }}>{old}</Typography>
                  </Box>
                  <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 16 }}>check</span>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{neo}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ position: 'absolute', inset: -20, background: `linear-gradient(135deg, ${MF.primary}12, #ea580c12)`, borderRadius: '32px', pointerEvents: 'none' }} />
              <Box sx={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.12)', border: `1px solid ${MF.outlineVar}55` }}>
                <Box component="img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK1rysRFeoD2gVetMA9IxrI3YeJAzjug_T5rhGWv3klIg5xQuAm4XgNsg8V6R1dzOC5KrRHiHTA1XHxpkebti7M76XVHtIFm-FdQtzK3enVe3jNK-rVPZUww-2rnf2EFjwGrcNcFT_6i9YrvatkqKoJ34QmpE40A2DSPPfYvL2vxbEtLk07Rj40QFpfoedcAvedjPkYoHFzo6XS7CRC4fKugkSO3pXYHmfJ5sImEE4gpsxKiZfyJs7Y4FJm61wuvptHC2DGRwYWiUQ"
                  sx={{ width: '100%', display: 'block' }} />
              </Box>
              <motion.div
                animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', bottom: -28, left: -28 }}
              >
                <Box sx={{ ...glass, p: 2.5, borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', minWidth: 190 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>Live Revenue</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 900, color: MF.primary, mb: 1 }}>+24% ↑</Typography>
                  <Box sx={{ height: 6, width: '100%', bgcolor: MF.surface, borderRadius: '9999px', overflow: 'hidden' }}>
                    <M animate={{ width: ['0%', '74%'] }} transition={{ duration: 1.5, delay: 0.5 }} sx={{ height: '100%', bgcolor: '#10b981', borderRadius: '9999px' }} />
                  </Box>
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* ── Workflow light-warm section ── */}
      <Box component="section" sx={{ bgcolor: MF.bg, py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, background: `radial-gradient(ellipse, ${MF.primary}06 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <Box sx={{ maxWidth: 1280, mx: 'auto', position: 'relative', zIndex: 1 }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 10 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Seamless orchestration</Typography>
              <Typography sx={{ fontSize: { xs: 30, md: 48 }, fontWeight: 900, letterSpacing: '-0.035em', fontFamily: 'Manrope, Inter, sans-serif', color: MF.text }}>One automated workflow</Typography>
              <Typography sx={{ fontSize: 17, color: MF.textSub, mt: 2, maxWidth: 500, mx: 'auto' }}>Watch how MenuFlow connects every touchpoint.</Typography>
            </Box>
          </M>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4,1fr)' }, gap: 3 }}>
            {WORKFLOW.map(({ icon, step, desc }, i) => (
              <motion.div key={step} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
                <motion.div whileHover={{ y: -8, transition: { duration: 0.3 } }}>
                  <Box sx={{ bgcolor: '#fff', border: `1px solid rgba(249,115,22,0.15)`, borderRadius: '24px', p: 4, height: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                    <Box sx={{ width: 72, height: 72, background: `linear-gradient(135deg, ${MF.primary}20, #ea580c20)`, border: `1px solid ${MF.primary}30`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, mx: 'auto', boxShadow: `0 0 30px ${MF.primary}12` }}>
                      <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 32, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    </Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: MF.primary, letterSpacing: '0.1em', mb: 1 }}>STEP {String(i + 1).padStart(2, '0')}</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 1.5, color: MF.text }}>{step}</Typography>
                    <Typography sx={{ fontSize: 13, color: MF.textSub, lineHeight: 1.65 }}>{desc}</Typography>
                  </Box>
                </motion.div>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Multi-location ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, overflow: 'hidden', bgcolor: MF.surfaceLow }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 10, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }} style={{ order: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ position: 'absolute', inset: -20, background: `linear-gradient(135deg, ${MF.primary}18, #ea580c18)`, filter: 'blur(40px)', borderRadius: '32px', pointerEvents: 'none' }} />
              <Box sx={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.12)', border: `1px solid ${MF.outlineVar}55` }}>
                <Box component="img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcon7q_VnXUqZZFg-zls2DNRLXe5v1ekDyOVOoKdTyFj7tws1VoQaklBMl5_yWBP_5lk4CfArpH-CszXh4dXu8kvpG812vcOlqEadMDbEsefn5COC4LbJ6DVeYpTkCnFFsHqSvq25Q8IrNiRR5SmAHfLHhlsVsUg9gJqwlPo3bK6TvHf_mCm4ueeH-CdVgjJijG8IjihshWjN6nVFS3JYjkZx6XYW8pVnjFXjRropJCtZoq6Xd-s8k_6mSqPz9k7x5ubj0eEdxjit8t"
                  sx={{ width: '100%', display: 'block' }} />
              </Box>
            </Box>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }} style={{ order: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ea580c', mb: 2 }}>Global Control</Typography>
            <Typography sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 900, letterSpacing: '-0.03em', mb: 2.5, lineHeight: 1.15, fontFamily: 'Manrope, Inter, sans-serif' }}>Multi-location mastery</Typography>
            <Typography sx={{ fontSize: 17, color: MF.textSub, mb: 5, lineHeight: 1.7 }}>
              Manage 10 or 1,000 locations from a single pane of glass. Push menu updates globally or target specific regions in seconds.
            </Typography>
            {[
              { title: 'Unified Reporting',  desc: 'Aggregate sales data across all branches for macro-level analysis.' },
              { title: 'Role-Based Access',  desc: 'Define permissions for regional managers vs. local floor staff.' },
              { title: 'Inheritance Logic',  desc: 'Update a master menu and watch changes ripple across all child locations.' },
            ].map(({ title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: i * 0.1 }} viewport={{ once: true }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start' }}>
                  <Box sx={{ mt: 0.25, width: 26, height: 26, bgcolor: `${MF.primary}15`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${MF.primary}25` }}>
                    <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 14 }}>done</span>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 0.5 }}>{title}</Typography>
                    <Typography sx={{ fontSize: 13, color: MF.textSub, lineHeight: 1.65 }}>{desc}</Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </motion.div>
        </Box>
      </Box>

      {/* ── CTA ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 } }}>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, amount: 0.3 }}>
          <Box sx={{ maxWidth: 960, mx: 'auto', background: MF.gradient, borderRadius: '44px', p: { xs: 6, md: 12 }, textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography sx={{ fontSize: { xs: 30, md: 52 }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, mb: 3, fontFamily: 'Manrope, Inter, sans-serif' }}>
                Ready to transform<br />your service?
              </Typography>
              <Typography sx={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', mb: 6, maxWidth: 480, mx: 'auto', lineHeight: 1.75 }}>
                Join over 2,500 premium restaurants that rely on MenuFlow every day.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')}
                  style={{ background: '#fff', color: MF.primary, padding: '17px 44px', borderRadius: 16, fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 12px 36px rgba(0,0,0,0.15)' }}>
                  Start 14-Day Free Trial
                </motion.button>
                <motion.button whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.97 }}
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', padding: '17px 44px', borderRadius: 16, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Schedule a Demo
                </motion.button>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Box>

      <MenuFlowFooter />
    </Box>
  );
}
