import { useRef, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import {
  motion, useTransform, useMotionValue,
  useSpring, AnimatePresence, useInView, animate, useScroll,
} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useMagnetic } from '../hooks/useLenis';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import PricingSection from './menuflow/PricingSection';
import { MF } from './menuflow/mfTheme';

gsap.registerPlugin(ScrollTrigger, SplitText);

const M = motion.create(Box);

/* ─── Variants — opacity + translate only (GPU-safe, no blur) ─── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.93 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } };

/* ─── NEW: word-by-word scroll reveal for big headings (dribbble staple) ─── */
function SplitHeading({ text, sx, component = 'h2' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return undefined;
    const split = new SplitText(ref.current, { type: 'words', wordsClass: 'split-word' });
    gsap.set(split.words, { display: 'inline-block' });
    const tween = gsap.fromTo(split.words,
      { opacity: 0, yPercent: 130, rotate: 6 },
      {
        opacity: 1, yPercent: 0, rotate: 0,
        duration: 0.9, stagger: 0.045, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: ref.current, start: 'top 85%' },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  }, [text]);
  return <Typography ref={ref} component={component} sx={{ ...sx, overflow: 'hidden' }}>{text}</Typography>;
}

/* ─── NEW: soft glowing blob that trails the cursor across the whole page ─── */
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

/* ─── Scroll progress bar (uses motion values — zero re-renders) ─── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div style={{
      position: 'fixed', top: 72, left: 0, right: 0, height: 3, zIndex: 49,
      background: MF.gradient, scaleX, transformOrigin: '0%', pointerEvents: 'none',
    }} />
  );
}

/* ─── Single wave divider (1 instance, GPU-accelerated translateX only) ─── */
function HeroWave() {
  return (
    <Box sx={{ overflow: 'hidden', lineHeight: 0, height: 72, position: 'relative', mt: -1 }}>
      <svg viewBox="0 0 2880 72" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, width: '200%', height: '100%', willChange: 'transform', animation: 'waveMove 14s linear infinite' }}>
        <path fill="#ffffff"
          d="M0,28 C180,58 360,4 540,28 C720,54 900,4 1080,28 C1260,54 1440,4 1620,28 C1800,54 1980,4 2160,28 C2340,54 2520,4 2700,28 C2760,38 2820,18 2880,28 L2880,72 L0,72 Z" />
      </svg>
    </Box>
  );
}

/* ─── Cycling word — opacity + y only (no blur) ─── */
const HERO_WORDS = ['Restaurant', 'Hotel', 'Cafe', 'Dhaba'];
function CyclingWord() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(n => (n + 1) % HERO_WORDS.length), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <Box component="span" sx={{ display: 'inline-block', minWidth: 240 }}>
      <AnimatePresence mode="wait">
        <motion.span key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-block' }}
        >
          {HERO_WORDS[idx]}
        </motion.span>
      </AnimatePresence>
    </Box>
  );
}

/* ─── Live order card — isolated component so cycling doesn't re-render parent ─── */
const LIVE_ORDERS = [
  { table: 4, amount: '₹1,890', item: 'Dal Makhani + Naan' },
  { table: 7, amount: '₹2,350', item: 'Biryani + Raita' },
  { table: 2, amount: '₹1,240', item: 'Paneer Tikka + Roti' },
  { table: 11, amount: '₹3,120', item: 'Seafood Thali' },
];
function LiveOrderCard() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1800);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!show) return;
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => { setIdx(i => (i + 1) % LIVE_ORDERS.length); setShow(true); }, 500);
    }, 3800);
    return () => clearInterval(t);
  }, [show]);
  const o = LIVE_ORDERS[idx];
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div key={idx}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 50, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', bottom: '24%', left: -14, zIndex: 30 }}
        >
          <Box sx={{ bgcolor: '#fff', border: `1.5px solid rgba(249,115,22,0.18)`, borderRadius: '16px', p: '12px 16px', minWidth: 182, boxShadow: '0 8px 28px rgba(0,0,0,0.09)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#4ade80', boxShadow: '0 0 6px #4ade80', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: MF.textSub, letterSpacing: '0.06em' }}>NEW ORDER</Typography>
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 900, color: MF.text }}>{o.amount}</Typography>
            <Typography sx={{ fontSize: 11, color: MF.textSub, mt: 0.4 }}>Table {o.table} · {o.item}</Typography>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── 3D tilt hook — uses motion values, zero re-renders ─── */
function useTilt(strength = 10) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rX = useSpring(useTransform(my, [-0.5, 0.5], [strength, -strength]), { stiffness: 340, damping: 35 });
  const rY = useSpring(useTransform(mx, [-0.5, 0.5], [-strength, strength]), { stiffness: 340, damping: 35 });
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

/* ─── Animated counter — now with a little "punch" pop when it finishes ─── */
function Counter({ to, suffix = '' }) {
  const spanRef = useRef(null);
  const inView = useInView(spanRef, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, {
      duration: 2, ease: 'easeOut',
      onUpdate: v => setVal(Math.floor(v)),
      onComplete: () => {
        if (spanRef.current) {
          gsap.fromTo(spanRef.current, { scale: 1 }, { scale: 1.16, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' });
        }
      },
    });
    return ctrl.stop;
  }, [inView, to]);
  return <span ref={spanRef} style={{ display: 'inline-block' }}>{val.toLocaleString('en-IN')}{suffix}</span>;
}

/* ─── Feature pin card — punchier 3D-flip entrance ─── */
function PinCard({ icon, title, desc, color = MF.primary, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: -35, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{ duration: 0.75, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 60, position: 'relative', transformPerspective: 1200 }}
    >
      <motion.div
        animate={{ y: hovered ? -24 : 0 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        style={{ width: '100%' }}
      >
        <Box sx={{
          background: '#fff',
          border: `1px solid ${hovered ? color + '44' : 'rgba(232,213,196,0.55)'}`,
          borderRadius: '20px', p: { xs: 3.5, md: 4 },
          boxShadow: hovered ? `0 20px 50px ${color}14, 0 6px 16px rgba(0,0,0,0.05)` : '0 4px 18px rgba(0,0,0,0.04)',
          transition: 'border-color 0.25s, box-shadow 0.25s', height: '100%',
        }}>
          <Box sx={{ width: 52, height: 52, borderRadius: '14px', background: `linear-gradient(135deg, ${color}14, ${color}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5, border: `1px solid ${color}22` }}>
            <span className="material-symbols-outlined" style={{ color, fontSize: 26, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
          </Box>
          <Typography sx={{ fontSize: 17, fontWeight: 700, mb: 1.25, color: MF.text }}>{title}</Typography>
          <Typography sx={{ fontSize: 14, color: MF.textSub, lineHeight: 1.68 }}>{desc}</Typography>
        </Box>
      </motion.div>
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ scaleY: 0, opacity: 0 }}
            style={{ transformOrigin: 'top', width: 2, height: 48, background: `linear-gradient(to bottom, ${color}, transparent)`, marginTop: 4 }} />
        )}
      </AnimatePresence>
      <Box sx={{ position: 'absolute', bottom: 14, width: hovered ? 13 : 9, height: hovered ? 13 : 9, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 ${hovered ? '20px 5px' : '8px 2px'} ${color}70`, transition: 'all 0.25s' }} />
    </motion.div>
  );
}

/* ─── Magnetic CTA button — GSAP-site "pull to cursor" wow-effect ─── */
function MagneticButton({ children, onClick, variant = 'primary', style }) {
  const attachMagnetic = useMagnetic(0.3);
  const base = variant === 'primary'
    ? { background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', boxShadow: '0 10px 28px rgba(249,115,22,0.38)', border: 'none' }
    : { background: '#fff', color: MF.text, border: '1.5px solid rgba(249,115,22,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' };
  return (
    <motion.button
      ref={attachMagnetic}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        padding: '15px 32px', borderRadius: 14, fontWeight: 700, fontSize: 15,
        cursor: 'pointer', fontFamily: 'Inter, sans-serif', ...base, ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

/* ─── decorative floating food icons — the "pizzazz" layer ─── */
const FOOD_ICONS = [
  { icon: 'lunch_dining', top: '16%', left: '4%', size: 30, speed: 0.35, dur: 6, delay: 0 },     // burger
  { icon: 'local_pizza', top: '68%', left: '9%', size: 26, speed: 0.2, dur: 7, delay: 1.1 },
  { icon: 'ramen_dining', top: '24%', right: '6%', size: 28, speed: 0.5, dur: 6.5, delay: 0.5 },
  { icon: 'local_cafe', top: '74%', right: '13%', size: 24, speed: 0.28, dur: 5.5, delay: 1.6 },
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
            <span className="material-symbols-outlined" style={{ fontSize: it.size, color: MF.primary, opacity: 0.15 }}>{it.icon}</span>
          </motion.div>
        </Box>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════
   DATA — India localised
═══════════════════════════════════════════ */
const FEATURES = [
  { icon: 'qr_code_2', title: 'Smart QR Menus', desc: 'Branded QR codes that update live. No reprinting costs. Works on any smartphone.', color: MF.primary },
  { icon: 'restaurant_menu', title: 'Visual Menu Builder', desc: 'Drag-and-drop editor with rich media support. Beautiful food photography layouts built in.', color: '#7c3aed' },
  { icon: 'point_of_sale', title: 'Live Order Dashboard', desc: 'Orders hit your kitchen display in real time. No more paper chits or shouting.', color: '#059669' },
  { icon: 'insights', title: 'Sales Analytics', desc: 'Track peak hours, bestsellers, and revenue — from a single real-time dashboard.', color: '#d97706' },
  { icon: 'payments', title: 'UPI & Card Payments', desc: 'GPay, PhonePe, UPI, Razorpay — all covered. Auto-reconcile with zero manual effort.', color: '#dc2626' },
  { icon: 'translate', title: 'Multi-language Menus', desc: 'Serve menus in Hindi, Tamil, Telugu, and 10+ regional languages. One click to switch.', color: '#0891b2' },
];

const STEPS = [
  { n: '01', title: 'Create Your Profile', desc: 'Enter restaurant details, upload your logo, and set brand colours in under 5 minutes.', color: MF.primary },
  { n: '02', title: 'Build Your Menu', desc: 'Add dishes, descriptions, prices, and photos using our simple visual editor.', color: '#ea580c' },
  { n: '03', title: 'Generate QR Codes', desc: 'Download print-ready QR codes for every table or scan point. No design skills needed.', color: '#059669' },
  { n: '04', title: 'Go Live & Grow', desc: 'Guests scan, browse, and order. Watch real-time orders and grow with smart analytics.', color: '#d97706' },
];

const METRICS = [
  { to: 20, suffix: '+', label: 'Restaurants', desc: 'Trusted by top dining rooms, cafés, and hotels across India to power their digital guest experience.' },
  { to: 1000, suffix: '+', label: 'Daily Orders', desc: 'Processed seamlessly from tables, rooms, and counters with zero delay.' },
  { to: 99, suffix: '.9%', label: 'Uptime Guarantee', desc: 'Highly redundant server architecture guarantees constant availability for your business.' },
  { to: 4, suffix: '.8★', label: 'Partner Rating', desc: 'Highly rated by hospitality operators for ease of use, instant setup, and reliable payouts.' }
];

const MARQUEE_ITEMS = ['QR Ordering', '•', 'UPI Payments', '•', 'Kitchen Display', '•', 'Analytics', '•', 'Hindi Support', '•', 'Multi-location', '•', 'Table Management', '•', 'Menu Builder', '•'];

const TESTIMONIALS = [
  { quote: 'Orders jumped 40% in the first month. No more missed tables or chit errors.', author: 'Rahul Sharma', role: 'Spice Junction, Mumbai' },
  { quote: 'GPay and UPI setup was instant. Our guests love ordering from their phones.', author: 'Priya Mehta', role: 'Gulmohar Café, Bengaluru' },
  { quote: 'Festival season menu updates are now instant. Zero reprinting costs.', author: 'Arjun Patel', role: 'Biryani House, Hyderabad' },
  { quote: 'Kitchen staff learnt the system in 10 minutes. Absolute game-changer.', author: 'Neha Kapoor', role: 'Delhi Darbar, New Delhi' },
  { quote: 'Table turnover improved by 30%. The analytics dashboard is incredibly useful.', author: 'Vikram Singh', role: 'Punjab Kitchen, Chandigarh' },
  { quote: 'Hindi menu support helped us serve local guests much better than before.', author: 'Ananya Nair', role: 'Malabar Kitchen, Kochi' },
];

/* ─────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const { ref: tiltRef, rotateX, rotateY, handlers: tiltHandlers } = useTilt(10);

  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const gridRefA = useRef(null);
  const gridRefB = useRef(null);
  const marqueeRef = useRef(null);
  const stepCircleRefs = useRef([]);

  const spotX = useMotionValue(-400);
  const spotY = useMotionValue(-400);
  const spotXPos = useTransform(spotX, v => v - 300);
  const spotYPos = useTransform(spotY, v => v - 300);

  const onHeroMouse = (e) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    spotX.set(e.clientX - r.left);
    spotY.set(e.clientY - r.top);
  };
  const onHeroLeave = () => { spotX.set(-400); spotY.set(-400); };

  /* ── The big GSAP layer: parallax, curtain, split-text headings,
     velocity-reactive marquee, pulsing step markers — all scoped and
     cleaned up on unmount, all additive to the existing UI. ── */
  useEffect(() => {
    console.log('[gsap] ScrollTrigger mounted on LandingPage', gsap.version);

    const ctx = gsap.context(() => {
      // 1) Parallax — hero orbs, food icons, device mockup
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
        gsap.to(el, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
        });
      });

      // 2) Curtain — hero shrinks/dims/blurs as the next section slides over it
      gsap.to(heroRef.current, {
        scale: 0.92, opacity: 0.35, filter: 'blur(2px)', transformOrigin: 'center top', ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });

      // 3) Drifting grid textures
      [gridRefA.current, gridRefB.current].filter(Boolean).forEach((el) => {
        gsap.to(el, {
          backgroundPosition: '80px 80px', ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      });

      // 4) Velocity-reactive marquee — speeds up / reverses feel with scroll speed & direction
      if (marqueeRef.current) {
        const marqueeTween = gsap.to(marqueeRef.current, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
        ScrollTrigger.create({
          trigger: marqueeRef.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const boost = gsap.utils.clamp(-5, 5, (self.getVelocity() / 1000) * self.direction * 0.025);
            gsap.to(marqueeTween, { timeScale: 1 + boost, duration: 0.3, overwrite: true });
          },
          onLeave: () => gsap.to(marqueeTween, { timeScale: 1, duration: 0.6 }),
          onLeaveBack: () => gsap.to(marqueeTween, { timeScale: 1, duration: 0.6 }),
        });
      }

      // 5) Pulsing "how it works" step markers as they cross the viewport center
      stepCircleRefs.current.forEach((el) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el, start: 'top center', end: 'bottom center',
          onEnter: () => gsap.to(el, { scale: 1.18, duration: 0.4, ease: 'back.out(2)' }),
          onLeave: () => gsap.to(el, { scale: 1, duration: 0.4 }),
          onEnterBack: () => gsap.to(el, { scale: 1.18, duration: 0.4, ease: 'back.out(2)' }),
          onLeaveBack: () => gsap.to(el, { scale: 1, duration: 0.4 }),
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <Box ref={pageRef} sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <style>{`
        @keyframes lp-orb1  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(50px,-40px)} }
        @keyframes lp-orb2  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-45px,55px)} }
        @keyframes waveMove  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      <CursorBlob />
      <ScrollProgress />
      <MenuFlowNav />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <Box
        ref={heroRef}
        onMouseMove={onHeroMouse}
        onMouseLeave={onHeroLeave}
        component="section"
        sx={{
          position: 'relative', minHeight: '100vh',
          display: 'flex', alignItems: 'center', overflow: 'hidden',
          background: 'linear-gradient(135deg, #fff7ed 0%, #fffaf6 55%, #fff7ed 100%)',
          pt: '75px',
        }}
      >
        <motion.div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)',
          x: spotXPos, y: spotYPos, pointerEvents: 'none', zIndex: 1,
        }} />

        {[
          { top: '-10%', left: '-5%', w: 580, bg: `radial-gradient(circle, ${MF.primary}18 0%, transparent 70%)`, anim: 'lp-orb1 22s ease-in-out infinite', speed: 0.18 },
          { bottom: '-8%', right: '-5%', w: 460, bg: 'radial-gradient(circle, #fb923c12 0%, transparent 70%)', anim: 'lp-orb2 26s ease-in-out infinite 6s', speed: 0.32 },
        ].map((o, i) => (
          <Box key={i} data-parallax={o.speed}
            sx={{ position: 'absolute', top: o.top, left: o.left, bottom: o.bottom, right: o.right, width: o.w, height: o.w, pointerEvents: 'none' }}>
            <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', background: o.bg, animation: o.anim }} />
          </Box>
        ))}

        <FloatingFoodIcons />

        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 3, md: 6 }, width: '100%', zIndex: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: { xs: 6, lg: 8 }, alignItems: 'center' }}>

            <M initial="hidden" animate="visible" variants={stagger}>
              <M variants={fadeUp}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.22)', borderRadius: '100px', px: 2, py: 0.875, mb: 3.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80', boxShadow: '0 0 10px #4ade80', animation: 'livePulse 2s ease-in-out infinite' }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: MF.textSub, letterSpacing: '0.03em' }}>
                    Trusted by 2,000+ restaurants across India
                  </Typography>
                </Box>
              </M>

              <M variants={fadeUp}>
                <Typography sx={{ fontSize: { xs: 40, md: 58, lg: 68 }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.08, mb: 3, color: MF.text, fontFamily: 'Manrope, Inter, sans-serif' }}>
                  Digital Ordering for Every{' '}
                  <Box component="span" sx={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    <CyclingWord />
                  </Box>
                </Typography>
              </M>

              <M variants={fadeUp}>
                <Typography sx={{ fontSize: { xs: 16, md: 17 }, color: MF.textSub, mb: 5, maxWidth: 460, lineHeight: 1.8 }}>
                  Launch your digital menu with QR codes, accept UPI & card payments, and manage orders live — all from one simple dashboard.
                </Typography>
              </M>

              <M variants={fadeUp}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <MagneticButton onClick={() => navigate('/contact')}>Get Started — Free Trial</MagneticButton>
                  <MagneticButton variant="secondary" onClick={() => navigate('/how-it-works')}>▶ Watch Demo</MagneticButton>
                </Box>
              </M>

              <M variants={fadeUp} sx={{ mt: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex' }}>
                  {['#f97316', '#ea580c', '#fb923c', '#fdba74', '#fed7aa'].map((c, i) => (
                    <Box key={c} sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: c, border: '2.5px solid #fff', ml: i > 0 ? -1.25 : 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
                  ))}
                </Box>
                <Typography sx={{ fontSize: 13, color: MF.textSub }}>
                  <Box component="span" sx={{ color: MF.text, fontWeight: 800 }}>4.8★</Box>{' '}· 2,400+ verified reviews · No credit card needed
                </Typography>
              </M>
            </M>

            <Box data-parallax={0.12} sx={{ position: 'relative' }}>
              <motion.div
                ref={tiltRef}
                {...tiltHandlers}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0, transition: { duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] } }}
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: '1200px', position: 'relative', height: 560 }}
              >
                <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, ${MF.primary}12 0%, transparent 65%)`, pointerEvents: 'none' }} />

                <M
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  sx={{ position: 'absolute', top: 40, right: 0, width: '82%', bgcolor: '#fff', border: '1px solid rgba(249,115,22,0.1)', borderRadius: '18px', p: 1.5, transform: 'rotate(2.5deg)', boxShadow: '0 24px 50px rgba(0,0,0,0.07)' }}
                >
                  <Box component="img"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ_WYnbpOzs7xe7afJl-0Uy3bVZ-vAOlJyoUt1R_greVUzSVxEaw67WQIez36reH4ERUGF0s1SH-SuJv5fCfkbkN7WivLUK7uR5CVKzoMAIHbjGZcoSu24BPYzCKawOwtIGl1g9qXqkWmoi4rE3vIDGguk7K9E_xhnb55obMsIkW9UPxMZCyZSIk693NAbGeTq7lKoQu4idMntRgkz9cIJdY8G6qc0gpCAVE5KoDw8ciioVMZEFPmJYr5qcpU8k453MmTNG5BJzQtb"
                    sx={{ width: '100%', borderRadius: '10px', display: 'block' }}
                  />
                </M>

                <M
                  animate={{ y: [0, -16, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                  sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 20, width: { xs: 165, md: 205 }, bgcolor: '#1a0a00', borderRadius: '48px', p: '11px', border: '2px solid rgba(249,115,22,0.18)', boxShadow: '0 32px 64px rgba(0,0,0,0.16), 0 10px 24px rgba(249,115,22,0.1)' }}
                >
                  <Box sx={{ bgcolor: '#fff', borderRadius: '36px', overflow: 'hidden', aspectRatio: '9/19.5' }}>
                    <Box component="img"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk2Sw6iIz2GjGEoQSx1NI271wanBTfqFa4yld80ldfVulMYdU_1JptfWwSxvpGz39QHl1V3Se_oLrxwLNhA21iMQXEEl4bcJk-hDLP789iaUF4ViB6DRTBl5JorfigecpT6zVqxpwcghYaz6RB3-cmPVkqIRPMpYKfEN-b661bRFPsC5cMc4CEDK1ATL4HM8MKm47AvQS6NSXTDNv7SuOA2MThVBQAP1U_tHcw6pYcYFxDyOefHscRoLug_m6aDrvu33UWeO69_hl5"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                </M>

                <M
                  animate={{ y: [0, -9, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                  sx={{ position: 'absolute', top: '10%', right: -14, zIndex: 30, bgcolor: '#fff', border: `1px solid rgba(249,115,22,0.15)`, borderRadius: '16px', p: 2, minWidth: 152, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 15, fontVariationSettings: "'FILL' 1" }}>insights</span>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: MF.textSub }}>Today's Revenue</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 20, fontWeight: 900, color: '#4ade80' }}>+27%</Typography>
                  <Typography sx={{ fontSize: 11, color: MF.outlineVar }}>vs yesterday</Typography>
                </M>

                <LiveOrderCard />
              </motion.div>
            </Box>
          </Box>
        </Box>
      </Box>

      <HeroWave />

      {/* ══════════════════════════════════════
          MARQUEE — curtains over the shrinking hero, speed reacts to scroll velocity
      ══════════════════════════════════════ */}
      <Box sx={{
        bgcolor: '#fff', py: 3, overflow: 'hidden', borderBottom: `1px solid rgba(249,115,22,0.07)`,
        position: 'relative', zIndex: 5, mt: { xs: '-24px', md: '-40px' },
        borderTopLeftRadius: { xs: '24px', md: '36px' }, borderTopRightRadius: { xs: '24px', md: '36px' },
        boxShadow: '0 -20px 40px rgba(0,0,0,0.06)',
      }}>
        <Box ref={marqueeRef} sx={{ display: 'flex', gap: 6, whiteSpace: 'nowrap', width: 'max-content', willChange: 'transform' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
            <Typography key={i} sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.09em', color: t === '•' ? MF.primary : MF.outlineVar, textTransform: 'uppercase' }}>{t}</Typography>
          ))}
        </Box>
      </Box>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, maxWidth: 1280, mx: 'auto' }}>
        <M initial="hidden" whileInView="visible" variants={stagger} viewport={{ once: true, amount: 0.15 }}>
          <M variants={fadeUp} sx={{ textAlign: 'center', mb: 9 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Everything in one place</Typography>
            <SplitHeading text="One platform for every restaurant" sx={{ fontSize: { xs: 30, md: 48 }, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.12, fontFamily: 'Manrope, Inter, sans-serif' }} />
            <Typography sx={{ fontSize: 16, color: MF.textSub, mt: 2, maxWidth: 500, mx: 'auto', lineHeight: 1.72 }}>
              From QR menus to UPI payments and analytics — run your restaurant smarter.
            </Typography>
          </M>
        </M>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3,1fr)' }, gap: 3 }}>
          {FEATURES.map((f, i) => <PinCard key={f.title} {...f} index={i} />)}
        </Box>
      </Box>

      {/* ══════════════════════════════════════
          HOW IT WORKS — step markers now pulse as they cross the viewport center
      ══════════════════════════════════════ */}
      <Box component="section" sx={{ bgcolor: MF.surfaceLow, py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 1.5, textAlign: 'center' }}>How it works</Typography>
            <SplitHeading text="Live in under 20 minutes" sx={{ fontSize: { xs: 30, md: 44 }, fontWeight: 900, letterSpacing: '-0.03em', textAlign: 'center', mb: { xs: 7, md: 10 }, fontFamily: 'Manrope, Inter, sans-serif' }} />
          </M>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {STEPS.map(({ n, title, desc, color }, idx) => (
              <motion.div key={n}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 80px 1fr' }, gap: { xs: 3, md: 5 }, alignItems: 'center', py: { xs: 4.5, md: 6 }, borderBottom: idx < STEPS.length - 1 ? `1px solid rgba(249,115,22,0.09)` : 'none' }}>
                  {idx % 2 === 0 ? (
                    <>
                      <Box sx={{ gridColumn: { xs: '1/-1', md: 'auto' } }}>
                        <Typography sx={{ fontSize: 12, color, mb: 1.25, fontWeight: 700, letterSpacing: '0.05em' }}>STEP {n}</Typography>
                        <Typography sx={{ fontSize: { xs: 22, md: 32 }, fontWeight: 800, mb: 1.75, letterSpacing: '-0.02em', lineHeight: 1.22 }}>{title}</Typography>
                        <Typography sx={{ fontSize: 15, color: MF.textSub, lineHeight: 1.75, maxWidth: 380 }}>{desc}</Typography>
                      </Box>
                      <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                        <Box ref={el => stepCircleRefs.current[idx] = el} sx={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${color}20, ${color}40)`, border: `2px solid ${color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px ${color}18` }}>
                          <Typography sx={{ fontSize: 22, fontWeight: 900, color }}>{n}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: { xs: 'none', md: 'block' } }} />
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: { xs: 'none', md: 'block' } }} />
                      <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                        <Box ref={el => stepCircleRefs.current[idx] = el} sx={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${color}20, ${color}40)`, border: `2px solid ${color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px ${color}18` }}>
                          <Typography sx={{ fontSize: 22, fontWeight: 900, color }}>{n}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ gridColumn: { xs: '1/-1', md: 'auto' } }}>
                        <Typography sx={{ fontSize: 12, color, mb: 1.25, fontWeight: 700, letterSpacing: '0.05em' }}>STEP {n}</Typography>
                        <Typography sx={{ fontSize: { xs: 22, md: 32 }, fontWeight: 800, mb: 1.75, letterSpacing: '-0.02em', lineHeight: 1.22 }}>{title}</Typography>
                        <Typography sx={{ fontSize: 15, color: MF.textSub, lineHeight: 1.75, maxWidth: 380 }}>{desc}</Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, bgcolor: '#fff' }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 1.5 }}>From restaurant owners</Typography>
              <SplitHeading text="Loved by restaurant owners" sx={{ fontSize: { xs: 28, md: 42 }, fontWeight: 900, letterSpacing: '-0.03em', fontFamily: 'Manrope, Inter, sans-serif' }} />
            </Box>
          </M>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3,1fr)' }, gap: 3 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <Box sx={{ bgcolor: MF.surfaceLow, borderRadius: '20px', p: 3.5, height: '100%', border: `1px solid rgba(249,115,22,0.09)` }}>
                  <Box sx={{ display: 'flex', gap: 0.3, mb: 2.5 }}>
                    {[1, 2, 3, 4, 5].map(s => <Box key={s} component="span" sx={{ color: '#fbbf24', fontSize: 14 }}>★</Box>)}
                  </Box>
                  <Typography sx={{ fontSize: 14, color: MF.textSub, lineHeight: 1.72, mb: 3, fontStyle: 'italic' }}>"{t.quote}"</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: MF.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{t.author[0]}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: MF.text }}>{t.author}</Typography>
                      <Typography sx={{ fontSize: 11, color: MF.outlineVar }}>{t.role}</Typography>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════
          METRICS
      ══════════════════════════════════════ */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 6 }, bgcolor: '#ffffff' }}>
        <Box
          sx={{
            maxWidth: 1280, mx: 'auto',
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #eab308 100%)',
            borderRadius: { xs: '24px', md: '36px' }, p: { xs: 4, sm: 6, md: 8 },
            position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(249,115,22,0.18)'
          }}
        >
          <Box ref={gridRefA} sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 4, mb: { xs: 6, md: 10 }, pb: 5, borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <Box sx={{ maxWidth: { xs: '100%', md: '60%' } }}>
                <SplitHeading text="We only deliver results." sx={{ fontSize: { xs: 32, md: 46 }, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.15, fontFamily: 'Manrope, Inter, sans-serif' }} />
                <Typography sx={{ fontSize: { xs: 15, md: 17 }, color: 'rgba(255, 255, 255, 0.85)', mt: 1.5, lineHeight: 1.6, fontWeight: 500 }}>
                  No excuses, no unnecessary complexity. Just absolute reliability, lightning-fast order processing, and growth statistics that speak for themselves.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                <motion.button
                  whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.15)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/how-it-works')}
                  style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', border: '1.5px solid rgba(255, 255, 255, 0.4)', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_circle</span>
                  Watch Demo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/contact')}
                  style={{ background: '#ffffff', color: '#ea580c', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                >
                  Get Started
                </motion.button>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: { xs: 4, md: 5 } }}>
              {METRICS.map(({ to, suffix, label, desc }) => (
                <M key={label} initial="hidden" whileInView="visible" variants={scaleIn} viewport={{ once: true }} sx={{ textAlign: 'left', position: 'relative' }}>
                  <Typography sx={{ fontSize: { xs: 40, md: 54 }, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1, mb: 1.5, fontFamily: 'Manrope, Inter, sans-serif', textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <Counter to={to} suffix={suffix} />
                  </Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#fef08a', letterSpacing: '-0.01em', mb: 1.25 }}>{label}</Typography>
                  <Typography sx={{ fontSize: 13.5, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontWeight: 400 }}>{desc}</Typography>
                </M>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════
          PRICING
      ══════════════════════════════════════ */}
      <PricingSection locale="IN" />

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <Box component="section" sx={{ py: { xs: 10, md: 12 }, px: { xs: 3, md: 6 } }}>
        <M initial="hidden" whileInView="visible" variants={scaleIn} viewport={{ once: true, amount: 0.3 }}
          sx={{ maxWidth: 960, mx: 'auto', background: MF.gradient, borderRadius: '36px', p: { xs: 6, md: 10 }, textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: `0 20px 60px rgba(249,115,22,0.28)` }}
        >
          <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <Box ref={gridRefB} sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '100px', px: 2, py: 0.625, mb: 3 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'livePulse 2s ease-in-out infinite' }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em' }}>2,000+ restaurants live across India</Typography>
            </Box>
            <SplitHeading text="Take your restaurant digital today" sx={{ fontSize: { xs: 30, md: 50 }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, mb: 2.5, fontFamily: 'Manrope, Inter, sans-serif' }} />
            <Typography sx={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', mb: 6, maxWidth: 440, mx: 'auto', lineHeight: 1.75 }}>
              Setup in under 20 minutes. Accept UPI from day one. First 30 days completely free.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <MagneticButton onClick={() => navigate('/contact')} style={{ background: '#fff', color: MF.primary, boxShadow: '0 10px 30px rgba(0,0,0,0.14)' }}>
                Start Free Trial
              </MagneticButton>
              <motion.button whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/contact')}
                style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', padding: '16px 40px', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Book a Demo
              </motion.button>
            </Box>
          </Box>
        </M>
      </Box>

      <MenuFlowFooter />
    </Box>
  );
}