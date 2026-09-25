import { useRef, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useMagnetic } from '../hooks/useLenis';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF, glass } from './menuflow/mfTheme';

gsap.registerPlugin(ScrollTrigger, SplitText);

const M = motion.create(Box);
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp = { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } } };

/* ─── NEW: word-by-word scroll reveal for big headings ─── */
function SplitHeading({ text, sx, component = 'h2' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return undefined;
    const split = new SplitText(ref.current, { type: 'words', wordsClass: 'split-word' });
    gsap.set(split.words, { display: 'inline-block' });
    const tween = gsap.fromTo(split.words,
      { opacity: 0, yPercent: 130, rotate: 6 },
      { opacity: 1, yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.045, ease: 'back.out(1.6)', scrollTrigger: { trigger: ref.current, start: 'top 85%' } }
    );
    return () => { tween.scrollTrigger?.kill(); tween.kill(); split.revert(); };
  }, [text]);
  return <Typography ref={ref} component={component} sx={{ ...sx, overflow: 'hidden' }}>{text}</Typography>;
}

/* ─── NEW: cursor-follow glow blob ─── */
function CursorBlob() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' });
    const onMove = (e) => { xTo(e.clientX); yTo(e.clientY); };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return (
    <Box ref={ref} sx={{
      position: 'fixed', top: -230, left: -230, width: 460, height: 460, borderRadius: '50%',
      background: `radial-gradient(circle, ${MF.primary}12 0%, transparent 72%)`,
      pointerEvents: 'none', zIndex: 3, display: { xs: 'none', md: 'block' },
    }} />
  );
}

/* ─── NEW: real 3D mouse-tilt hook for images/panels ─── */
function useTilt3D(strength = 12) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rX = useSpring(useTransform(my, [-0.5, 0.5], [strength, -strength]), { stiffness: 300, damping: 30 });
  const rY = useSpring(useTransform(mx, [-0.5, 0.5], [-strength, strength]), { stiffness: 300, damping: 30 });
  const handlers = {
    onMouseMove: (e) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    },
    onMouseLeave: () => { mx.set(0); my.set(0); },
  };
  return { ref, rotateX: rX, rotateY: rY, handlers };
}

/* ─── Feature pin card — now with a full 3D flip-up entrance ─── */
function PinCard({ icon, title, desc, color = MF.primary, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 70, rotateX: -45, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 60, position: 'relative', transformPerspective: 1300 }}
    >
      <motion.div
        animate={{ y: hovered ? -28 : 0, rotateX: hovered ? 8 : 0, rotateY: hovered ? -4 : 0 }}
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

/* ─── Magnetic CTA button ─── */
function MagneticButton({ children, onClick, variant = 'primary', style }) {
  const attachMagnetic = useMagnetic(0.3);
  const base = variant === 'primary'
    ? { background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', boxShadow: '0 10px 30px rgba(249,115,22,0.4)', border: 'none' }
    : { background: '#fff', color: MF.text, border: `1px solid rgba(249,115,22,0.2)`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' };
  return (
    <motion.button
      ref={attachMagnetic}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{ padding: '15px 34px', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Inter, sans-serif', ...base, ...style }}
    >
      {children}
    </motion.button>
  );
}

/* ─── Decorative floating food icons ─── */
const FOOD_ICONS = [
  { icon: 'lunch_dining', top: '20%', left: '5%', size: 30, speed: 0.35, dur: 6, delay: 0 },
  { icon: 'ramen_dining', top: '66%', left: '11%', size: 26, speed: 0.22, dur: 7, delay: 1.2 },
  { icon: 'local_pizza', top: '28%', right: '7%', size: 28, speed: 0.5, dur: 6.5, delay: 0.6 },
  { icon: 'bakery_dining', top: '70%', right: '13%', size: 24, speed: 0.28, dur: 5.5, delay: 1.8 },
];
function FloatingFoodIcons() {
  return (
    <>
      {FOOD_ICONS.map((it, i) => (
        <Box key={i} data-parallax={it.speed}
          sx={{ position: 'absolute', top: it.top, left: it.left, right: it.right, zIndex: 1, pointerEvents: 'none' }}>
          <motion.div
            animate={{ y: [0, -14, 0], rotate: [-6, 8, -6] }}
            transition={{ duration: it.dur, repeat: Infinity, ease: 'easeInOut', delay: it.delay }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: it.size, color: MF.primary, opacity: 0.14 }}>{it.icon}</span>
          </motion.div>
        </Box>
      ))}
    </>
  );
}

const FEATURES = [
  { icon: 'qr_code_2', title: 'Smart QR Menus', desc: 'High-res digital menus with instant item updates and dynamic pricing. Scan in <200ms.', color: MF.primary },
  { icon: 'restaurant_menu', title: 'Visual Menu Builder', desc: 'Drag-and-drop editor with rich media support and stunning food photography layouts.', color: '#7c3aed' },
  { icon: 'monitoring', title: 'Order Tracking', desc: 'Real-time order lifecycle monitoring from preparation through to final table delivery.', color: '#059669' },
  { icon: 'verified_user', title: 'OTP Verification', desc: 'Secure customer authentication for loyalty programs and contactless payment flows.', color: '#0891b2' },
  { icon: 'query_stats', title: 'Deep Analytics', desc: 'Insights into menu performance, server efficiency, and customer behavior patterns in real-time.', color: '#d97706' },
  { icon: 'hub', title: 'Multi-location', desc: 'Unified management for franchises. Centralize control with localized menu flexibility.', color: '#dc2626' },
];

const WORKFLOW = [
  { icon: 'qr_code_scanner', step: 'Instant Scan', desc: 'Guest scans the table QR. No app required. Opens in <200ms.' },
  { icon: 'shopping_cart_checkout', step: 'Smart Order', desc: 'AI-driven suggestions boost average order value by 18%.' },
  { icon: 'receipt_long', step: 'Kitchen Sync', desc: 'Orders route instantly to specific stations — Grill, Bar, Pastry.' },
  { icon: 'check_circle', step: 'Fulfillment', desc: 'Kitchen marks ready. Server notified. Payment settled via OTP or Card.' },
];

const COMPARE = [
  ['Manual daily reconciliation', 'Real-time live dashboard'],
  ['Weekly physical inventory', 'Automated SKU tracking'],
  ['Guesses on popularity', 'Heatmaps of customer clicks'],
  ['Reprinting for menu changes', 'Dynamic updates — no reprint'],
];

export default function FeaturesPage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const compareRef = useRef(null);
  const workflowRefs = useRef([]);

  // 3D tilt for the two big showcase images
  const analyticsTilt = useTilt3D(10);
  const locationTilt = useTilt3D(10);

  useEffect(() => {
    console.log('[gsap] ScrollTrigger mounted on FeaturesPage', gsap.version);

    const ctx = gsap.context(() => {
      // Parallax on hero orbs / food icons
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
        gsap.to(el, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
        });
      });

      // Curtain: hero shrinks/dims/blurs as you scroll past it
      gsap.to(heroRef.current, {
        scale: 0.94, opacity: 0.4, filter: 'blur(2px)', transformOrigin: 'center top', ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });

      // Staggered row-by-row reveal for the compare table
      if (compareRef.current) {
        gsap.from(compareRef.current.querySelectorAll('[data-compare-row]'), {
          opacity: 0, x: -24, duration: 0.5, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: compareRef.current, start: 'top 80%' },
        });
      }

      // 3D card-flip-in for the workflow row, alternating tilt direction
      workflowRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, rotateY: i % 2 === 0 ? -55 : 55, y: 40, transformPerspective: 1000 },
          { opacity: 1, rotateY: 0, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <Box ref={pageRef} sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <CursorBlob />
      <MenuFlowNav />

      {/* ── Hero ── */}
      <Box ref={heroRef} component="section" sx={{
        position: 'relative', minHeight: '70vh',
        display: 'flex', alignItems: 'center', overflow: 'hidden',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fffaf6 55%, #fff7ed 100%)',
        pt: '72px',
      }}>
        {[
          { top: '-10%', left: '-4%', w: 560, color: `${MF.primary}20`, dur: 20, speed: 0.16 },
          { bottom: '-8%', right: '-4%', w: 440, color: '#fb923c14', dur: 25, delay: 5, speed: 0.3 },
          { top: '40%', right: '30%', w: 280, color: '#ea580c12', dur: 16, delay: 8, speed: 0.42 },
        ].map((o, i) => (
          <Box key={i} data-parallax={o.speed}
            sx={{ position: 'absolute', top: o.top, left: o.left, bottom: o.bottom, right: o.right, width: o.w, height: o.w, pointerEvents: 'none' }}>
            <M
              animate={{ x: [0, 55, 0], y: [0, -45, 0] }}
              transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: o.delay || 0 }}
              sx={{ width: '100%', height: '100%', borderRadius: '50%', background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)` }}
            />
          </Box>
        ))}
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />

        <FloatingFoodIcons />

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
                <MagneticButton onClick={() => navigate('/contact')}>Explore All Modules</MagneticButton>
                <MagneticButton variant="secondary" onClick={() => navigate('/contact')}>▶ Watch Demo</MagneticButton>
              </Box>
            </M>
          </M>
        </Box>
      </Box>

      {/* ── Feature Pin Cards — now curtain over the shrinking hero ── */}
      <Box component="section" sx={{
        py: { xs: 10, md: 16 }, px: { xs: 3, md: 6 }, maxWidth: 1280, mx: 'auto',
        position: 'relative', zIndex: 5, bgcolor: MF.bg,
        mt: { xs: '-24px', md: '-40px' },
        borderTopLeftRadius: { xs: '24px', md: '36px' }, borderTopRightRadius: { xs: '24px', md: '36px' },
        boxShadow: '0 -20px 40px rgba(0,0,0,0.05)',
      }}>
        <M initial="hidden" whileInView="visible" variants={stagger} viewport={{ once: true }}>
          <M variants={fadeUp} sx={{ textAlign: 'center', mb: 10, pt: { xs: 2, md: 3 } }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Operational ecosystem</Typography>
            <SplitHeading text="A modular suite built to scale" sx={{ fontSize: { xs: 32, md: 48 }, fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.1, fontFamily: 'Manrope, Inter, sans-serif' }} />
          </M>
        </M>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3,1fr)' }, gap: 3 }}>
          {FEATURES.map((f, i) => <PinCard key={f.title} {...f} index={i} />)}
        </Box>
      </Box>

      {/* ── Analytics deep-dive — image now has real 3D mouse-tilt ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, bgcolor: MF.surfaceLow }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 10, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Advanced Insights</Typography>
            <SplitHeading text="Analytics that drive profitability" sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 900, letterSpacing: '-0.03em', mb: 2.5, lineHeight: 1.15, fontFamily: 'Manrope, Inter, sans-serif' }} />
            <Typography sx={{ fontSize: 17, color: MF.textSub, mb: 5, lineHeight: 1.7 }}>
              Our engine reveals the 'why' behind customer choices — track margin-by-item, peak-time velocity, and retention metrics in real-time.
            </Typography>
            <Box ref={compareRef} sx={{ borderRadius: '20px', border: `1px solid ${MF.outlineVar}`, overflow: 'hidden', bgcolor: MF.surfaceLowest }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', bgcolor: MF.surface, borderBottom: `1px solid ${MF.outlineVar}` }}>
                <Typography sx={{ p: 2.5, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MF.textSub }}>Traditional</Typography>
                <Typography sx={{ p: 2.5, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MF.primary }}>With ScanIt</Typography>
              </Box>
              {COMPARE.map(([old, neo], i) => (
                <Box key={i} data-compare-row sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: i < COMPARE.length - 1 ? `1px solid ${MF.outlineVar}33` : 'none' }}>
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
            <Box
              ref={analyticsTilt.ref}
              {...analyticsTilt.handlers}
              component={motion.div}
              style={{ rotateX: analyticsTilt.rotateX, rotateY: analyticsTilt.rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
              sx={{ position: 'relative' }}
            >
              <Box sx={{ position: 'absolute', inset: -20, background: `linear-gradient(135deg, ${MF.primary}12, #ea580c12)`, borderRadius: '32px', pointerEvents: 'none' }} />
              <Box sx={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.12)', border: `1px solid ${MF.outlineVar}55` }}>
                <Box component="img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK1rysRFeoD2gVetMA9IxrI3YeJAzjug_T5rhGWv3klIg5xQuAm4XgNsg8V6R1dzOC5KrRHiHTA1XHxpkebti7M76XVHtIFm-FdQtzK3enVe3jNK-rVPZUww-2rnf2EFjwGrcNcFT_6i9YrvatkqKoJ34QmpE40A2DSPPfYvL2vxbEtLk07Rj40QFpfoedcAvedjPkYoHFzo6XS7CRC4fKugkSO3pXYHmfJ5sImEE4gpsxKiZfyJs7Y4FJm61wuvptHC2DGRwYWiUQ"
                  sx={{ width: '100%', display: 'block' }} />
              </Box>
              <motion.div
                animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', bottom: -28, left: -28, transform: 'translateZ(60px)' }}
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

      {/* ── Workflow — 3D card-flip-in via GSAP ── */}
      <Box component="section" sx={{ bgcolor: MF.bg, py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, background: `radial-gradient(ellipse, ${MF.primary}06 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <Box sx={{ maxWidth: 1280, mx: 'auto', position: 'relative', zIndex: 1 }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 10 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Seamless orchestration</Typography>
              <SplitHeading text="One automated workflow" sx={{ fontSize: { xs: 30, md: 48 }, fontWeight: 900, letterSpacing: '-0.035em', fontFamily: 'Manrope, Inter, sans-serif', color: MF.text }} />
              <Typography sx={{ fontSize: 17, color: MF.textSub, mt: 2, maxWidth: 500, mx: 'auto' }}>Watch how ScanIt connects every touchpoint.</Typography>
            </Box>
          </M>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4,1fr)' }, gap: 3 }}>
            {WORKFLOW.map(({ icon, step, desc }, i) => (
              <Box key={step} ref={el => workflowRefs.current[i] = el} sx={{ transformStyle: 'preserve-3d' }}>
                <motion.div whileHover={{ y: -8, rotateY: 6, transition: { duration: 0.3 } }} style={{ transformPerspective: 1000 }}>
                  <Box sx={{ bgcolor: '#fff', border: `1px solid rgba(249,115,22,0.15)`, borderRadius: '24px', p: 4, height: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                    <Box sx={{ width: 72, height: 72, background: `linear-gradient(135deg, ${MF.primary}20, #ea580c20)`, border: `1px solid ${MF.primary}30`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, mx: 'auto', boxShadow: `0 0 30px ${MF.primary}12` }}>
                      <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 32, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    </Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: MF.primary, letterSpacing: '0.1em', mb: 1 }}>STEP {String(i + 1).padStart(2, '0')}</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 1.5, color: MF.text }}>{step}</Typography>
                    <Typography sx={{ fontSize: 13, color: MF.textSub, lineHeight: 1.65 }}>{desc}</Typography>
                  </Box>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Multi-location — image now has real 3D mouse-tilt ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, overflow: 'hidden', bgcolor: MF.surfaceLow }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 10, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }} style={{ order: 2 }}>
            <Box
              ref={locationTilt.ref}
              {...locationTilt.handlers}
              component={motion.div}
              style={{ rotateX: locationTilt.rotateX, rotateY: locationTilt.rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
              sx={{ position: 'relative' }}
            >
              <Box sx={{ position: 'absolute', inset: -20, background: `linear-gradient(135deg, ${MF.primary}18, #ea580c18)`, filter: 'blur(40px)', borderRadius: '32px', pointerEvents: 'none' }} />
              <Box sx={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.12)', border: `1px solid ${MF.outlineVar}55` }}>
                <Box component="img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcon7q_VnXUqZZFg-zls2DNRLXe5v1ekDyOVOoKdTyFj7tws1VoQaklBMl5_yWBP_5lk4CfArpH-CszXh4dXu8kvpG812vcOlqEadMDbEsefn5COC4LbJ6DVeYpTkCnFFsHqSvq25Q8IrNiRR5SmAHfLHhlsVsUg9gJqwlPo3bK6TvHf_mCm4ueeH-CdVgjJijG8IjihshWjN6nVFS3JYjkZx6XYW8pVnjFXjRropJCtZoq6Xd-s8k_6mSqPz9k7x5ubj0eEdxjit8t"
                  sx={{ width: '100%', display: 'block' }} />
              </Box>
            </Box>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }} style={{ order: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ea580c', mb: 2 }}>Global Control</Typography>
            <SplitHeading text="Multi-location mastery" sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 900, letterSpacing: '-0.03em', mb: 2.5, lineHeight: 1.15, fontFamily: 'Manrope, Inter, sans-serif' }} />
            <Typography sx={{ fontSize: 17, color: MF.textSub, mb: 5, lineHeight: 1.7 }}>
              Manage 10 or 1,000 locations from a single pane of glass. Push menu updates globally or target specific regions in seconds.
            </Typography>
            {[
              { title: 'Unified Reporting', desc: 'Aggregate sales data across all branches for macro-level analysis.' },
              { title: 'Role-Based Access', desc: 'Define permissions for regional managers vs. local floor staff.' },
              { title: 'Inheritance Logic', desc: 'Update a master menu and watch changes ripple across all child locations.' },
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
              <SplitHeading text="Ready to transform your service?" sx={{ fontSize: { xs: 30, md: 52 }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, mb: 3, fontFamily: 'Manrope, Inter, sans-serif' }} />
              <Typography sx={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', mb: 6, maxWidth: 480, mx: 'auto', lineHeight: 1.75 }}>
                Join over 2,500 premium restaurants that rely on ScanIt every day.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <MagneticButton onClick={() => navigate('/contact')} style={{ background: '#fff', color: MF.primary, boxShadow: '0 12px 36px rgba(0,0,0,0.15)' }}>
                  Start Free Trial
                </MagneticButton>
                <motion.button whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/contact')}
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