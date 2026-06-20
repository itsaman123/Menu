import { useRef, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import {
  motion, useTransform, useMotionValue,
  useSpring, AnimatePresence, useInView, animate, useScroll,
} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF } from './menuflow/mfTheme';

const M = motion.create(Box);

/* ─── Variants — opacity + translate only (GPU-safe, no blur) ─── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const fadeUp  = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.93 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } };

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
  { table: 4,  amount: '₹1,890', item: 'Dal Makhani + Naan' },
  { table: 7,  amount: '₹2,350', item: 'Biryani + Raita' },
  { table: 2,  amount: '₹1,240', item: 'Paneer Tikka + Roti' },
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
  const mx  = useMotionValue(0);
  const my  = useMotionValue(0);
  const rX  = useSpring(useTransform(my, [-0.5, 0.5], [ strength, -strength]), { stiffness: 340, damping: 35 });
  const rY  = useSpring(useTransform(mx, [-0.5, 0.5], [-strength,  strength]), { stiffness: 340, damping: 35 });
  const handlers = {
    onMouseMove: (e) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      mx.set((e.clientX - r.left) / r.width  - 0.5);
      my.set((e.clientY - r.top)  / r.height - 0.5);
    },
    onMouseLeave: () => { mx.set(0); my.set(0); },
  };
  return { ref, rotateX: rX, rotateY: rY, handlers };
}

/* ─── Animated counter ─── */
function Counter({ to, suffix = '' }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, { duration: 2, ease: 'easeOut', onUpdate: v => setVal(Math.floor(v)) });
    return ctrl.stop;
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString('en-IN')}{suffix}</span>;
}

/* ─── Feature pin card ─── */
function PinCard({ icon, title, desc, color = MF.primary, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 60, position: 'relative' }}
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

/* ═══════════════════════════════════════════
   DATA — India localised
═══════════════════════════════════════════ */
const FEATURES = [
  { icon: 'qr_code_2',           title: 'Smart QR Menus',        desc: 'Branded QR codes that update live. No reprinting costs. Works on any smartphone.', color: MF.primary },
  { icon: 'restaurant_menu',     title: 'Visual Menu Builder',    desc: 'Drag-and-drop editor with rich media support. Beautiful food photography layouts built in.', color: '#7c3aed' },
  { icon: 'point_of_sale',       title: 'Live Order Dashboard',   desc: 'Orders hit your kitchen display in real time. No more paper chits or shouting.', color: '#059669' },
  { icon: 'insights',            title: 'Sales Analytics',        desc: 'Track peak hours, bestsellers, and revenue — from a single real-time dashboard.', color: '#d97706' },
  { icon: 'payments',            title: 'UPI & Card Payments',    desc: 'GPay, PhonePe, UPI, Razorpay — all covered. Auto-reconcile with zero manual effort.', color: '#dc2626' },
  { icon: 'translate',           title: 'Multi-language Menus',   desc: 'Serve menus in Hindi, Tamil, Telugu, and 10+ regional languages. One click to switch.', color: '#0891b2' },
];

const STEPS = [
  { n: '01', title: 'Create Your Profile',  desc: 'Enter restaurant details, upload your logo, and set brand colours in under 5 minutes.', color: MF.primary },
  { n: '02', title: 'Build Your Menu',      desc: 'Add dishes, descriptions, prices, and photos using our simple visual editor.', color: '#ea580c' },
  { n: '03', title: 'Generate QR Codes',    desc: 'Download print-ready QR codes for every table or scan point. No design skills needed.', color: '#059669' },
  { n: '04', title: 'Go Live & Grow',       desc: 'Guests scan, browse, and order. Watch real-time orders and grow with smart analytics.', color: '#d97706' },
];

const METRICS = [
  { to: 2000,  suffix: '+',   label: 'Restaurants' },
  { to: 40000, suffix: '+',   label: 'Daily Orders' },
  { to: 99,    suffix: '.9%', label: 'Uptime' },
  { to: 4,     suffix: '.8★', label: 'Avg Rating' },
];

const PRICING = [
  {
    name: 'Starter', price: 999,
    features: ['Digital QR Menu', 'Upto 200 orders/month', 'Basic Analytics', 'Email Support'],
    featured: false,
  },
  {
    name: 'Growth', price: 2499,
    features: ['Full Order Management', 'Unlimited Orders', 'UPI & Card Payments', 'Priority Support', 'Advanced Analytics'],
    featured: true,
  },
  {
    name: 'Enterprise', price: null,
    features: ['Multi-location', 'Custom API Access', 'White-label', 'Dedicated Manager', 'SLA Guarantee'],
    featured: false,
  },
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

  /* Cursor spotlight — motion values only, zero React re-renders */
  const heroRef  = useRef(null);
  const spotX    = useMotionValue(-400);
  const spotY    = useMotionValue(-400);
  const spotXPos = useTransform(spotX, v => v - 300);
  const spotYPos = useTransform(spotY, v => v - 300);

  const onHeroMouse = (e) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    spotX.set(e.clientX - r.left);
    spotY.set(e.clientY - r.top);
  };
  const onHeroLeave = () => { spotX.set(-400); spotY.set(-400); };

  return (
    <Box sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <style>{`
        @keyframes lp-orb1  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(50px,-40px)} }
        @keyframes lp-orb2  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-45px,55px)} }
        @keyframes waveMove  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

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
        {/* Spotlight — motion div, no state update on move */}
        <motion.div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)',
          x: spotXPos, y: spotYPos, pointerEvents: 'none', zIndex: 1,
        }} />

        {/* Ambient orbs (CSS animation, GPU transform only) */}
        {[
          { top: '-10%', left: '-5%',  w: 580, bg: `radial-gradient(circle, ${MF.primary}18 0%, transparent 70%)`, anim: 'lp-orb1 22s ease-in-out infinite' },
          { bottom:'-8%',right: '-5%', w: 460, bg: 'radial-gradient(circle, #fb923c12 0%, transparent 70%)',        anim: 'lp-orb2 26s ease-in-out infinite 6s' },
        ].map((o, i) => (
          <Box key={i} sx={{ position: 'absolute', ...o, width: o.w, height: o.w, borderRadius: '50%', background: o.bg, animation: o.anim, pointerEvents: 'none' }} />
        ))}

        {/* Content */}
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 3, md: 6 }, width: '100%', zIndex: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: { xs: 6, lg: 8 }, alignItems: 'center' }}>

            {/* ── Left copy ── */}
            <M initial="hidden" animate="visible" variants={stagger}>

              {/* Live badge */}
              <M variants={fadeUp}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.22)', borderRadius: '100px', px: 2, py: 0.875, mb: 3.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80', boxShadow: '0 0 10px #4ade80', animation: 'livePulse 2s ease-in-out infinite' }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: MF.textSub, letterSpacing: '0.03em' }}>
                    Trusted by 2,000+ restaurants across India
                  </Typography>
                </Box>
              </M>

              {/* Heading */}
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

              {/* CTA buttons */}
              <M variants={fadeUp}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/register')}
                    style={{
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: '#fff', padding: '15px 32px', borderRadius: 14,
                      fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', boxShadow: '0 10px 28px rgba(249,115,22,0.38)',
                    }}
                  >
                    Get Started — Free Trial
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/how-it-works')}
                    style={{
                      background: '#fff', color: MF.text,
                      border: '1.5px solid rgba(249,115,22,0.2)',
                      padding: '15px 32px', borderRadius: 14, fontWeight: 700,
                      fontSize: 15, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    ▶ Watch Demo
                  </motion.button>
                </Box>
              </M>

              {/* Trust row */}
              <M variants={fadeUp} sx={{ mt: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex' }}>
                  {['#f97316','#ea580c','#fb923c','#fdba74','#fed7aa'].map((c, i) => (
                    <Box key={c} sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: c, border: '2.5px solid #fff', ml: i > 0 ? -1.25 : 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
                  ))}
                </Box>
                <Typography sx={{ fontSize: 13, color: MF.textSub }}>
                  <Box component="span" sx={{ color: MF.text, fontWeight: 800 }}>4.8★</Box>{' '}· 2,400+ verified reviews · No credit card needed
                </Typography>
              </M>
            </M>

            {/* ── Right: 3D device mockup ── */}
            <motion.div
              ref={tiltRef}
              {...tiltHandlers}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: '1200px', position: 'relative', height: 560 }}
            >
              {/* Glow */}
              <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, ${MF.primary}12 0%, transparent 65%)`, pointerEvents: 'none' }} />

              {/* Tablet back */}
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

              {/* Phone */}
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

              {/* Floating: Today's Sales */}
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

              {/* Isolated live order component (its re-renders don't affect parent) */}
              <LiveOrderCard />
            </motion.div>
          </Box>
        </Box>

        {/* Scroll caret */}
        <M animate={{ y: [0, 9, 0] }} transition={{ duration: 2.2, repeat: Infinity }}
          sx={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, zIndex: 2 }}>
          <Typography sx={{ fontSize: 10, color: MF.outlineVar, letterSpacing: '0.14em' }}>SCROLL</Typography>
          <Box sx={{ width: 1.5, height: 40, background: `linear-gradient(to bottom, ${MF.primary}80, transparent)`, borderRadius: 1 }} />
        </M>
      </Box>

      {/* ── Single animated wave (1 instance only) ── */}
      <HeroWave />

      {/* ══════════════════════════════════════
          MARQUEE
      ══════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#fff', py: 3, overflow: 'hidden', borderBottom: `1px solid rgba(249,115,22,0.07)` }}>
        <M
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          sx={{ display: 'flex', gap: 6, whiteSpace: 'nowrap', width: 'max-content', willChange: 'transform' }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
            <Typography key={i} sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.09em', color: t === '•' ? MF.primary : MF.outlineVar, textTransform: 'uppercase' }}>{t}</Typography>
          ))}
        </M>
      </Box>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, maxWidth: 1280, mx: 'auto' }}>
        <M initial="hidden" whileInView="visible" variants={stagger} viewport={{ once: true, amount: 0.15 }}>
          <M variants={fadeUp} sx={{ textAlign: 'center', mb: 9 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Everything in one place</Typography>
            <Typography sx={{ fontSize: { xs: 30, md: 48 }, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.12, fontFamily: 'Manrope, Inter, sans-serif' }}>
              One platform for every restaurant
            </Typography>
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
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <Box component="section" sx={{ bgcolor: MF.surfaceLow, py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 1.5, textAlign: 'center' }}>How it works</Typography>
            <Typography sx={{ fontSize: { xs: 30, md: 44 }, fontWeight: 900, letterSpacing: '-0.03em', textAlign: 'center', mb: { xs: 7, md: 10 }, fontFamily: 'Manrope, Inter, sans-serif' }}>
              Live in under 20 minutes
            </Typography>
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
                        <motion.div whileHover={{ scale: 1.12 }} transition={{ type: 'spring', stiffness: 280 }}>
                          <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${color}20, ${color}40)`, border: `2px solid ${color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px ${color}18` }}>
                            <Typography sx={{ fontSize: 22, fontWeight: 900, color }}>{n}</Typography>
                          </Box>
                        </motion.div>
                      </Box>
                      <Box sx={{ display: { xs: 'none', md: 'block' } }} />
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: { xs: 'none', md: 'block' } }} />
                      <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                        <motion.div whileHover={{ scale: 1.12 }} transition={{ type: 'spring', stiffness: 280 }}>
                          <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${color}20, ${color}40)`, border: `2px solid ${color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px ${color}18` }}>
                            <Typography sx={{ fontSize: 22, fontWeight: 900, color }}>{n}</Typography>
                          </Box>
                        </motion.div>
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
          TESTIMONIALS — static grid (no marquee lag)
      ══════════════════════════════════════ */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, bgcolor: '#fff' }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 1.5 }}>From restaurant owners</Typography>
              <Typography sx={{ fontSize: { xs: 28, md: 42 }, fontWeight: 900, letterSpacing: '-0.03em', fontFamily: 'Manrope, Inter, sans-serif' }}>
                Loved by restaurant owners
              </Typography>
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
                    {[1,2,3,4,5].map(s => <Box key={s} component="span" sx={{ color: '#fbbf24', fontSize: 14 }}>★</Box>)}
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
      <Box component="section" sx={{ py: { xs: 10, md: 12 }, px: { xs: 3, md: 6 }, background: MF.gradient, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {METRICS.map(({ to, suffix, label }) => (
            <M key={label} initial="hidden" whileInView="visible" variants={scaleIn} viewport={{ once: true }}>
              <Typography sx={{ fontSize: { xs: 44, md: 58 }, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                <Counter to={to} suffix={suffix} />
              </Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase', letterSpacing: '0.1em', mt: 1.25 }}>{label}</Typography>
            </M>
          ))}
        </Box>
      </Box>

      {/* ══════════════════════════════════════
          PRICING
      ══════════════════════════════════════ */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, bgcolor: MF.bg }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 9 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 1.5 }}>Simple pricing</Typography>
              <Typography sx={{ fontSize: { xs: 30, md: 46 }, fontWeight: 900, letterSpacing: '-0.03em', fontFamily: 'Manrope, Inter, sans-serif' }}>Pick your plan</Typography>
              <Typography sx={{ fontSize: 16, color: MF.textSub, mt: 2, maxWidth: 440, mx: 'auto' }}>No hidden charges. Cancel anytime. First 30 days free.</Typography>
            </Box>
          </M>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3, alignItems: 'center' }}>
            {PRICING.map(({ name, price, features, featured }, i) => (
              <motion.div key={name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, transition: { duration: 0.28 } }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                style={{ cursor: 'pointer' }}
              >
                <Box sx={{
                  background: '#fff', borderRadius: '24px', p: { xs: 4, md: 5 }, position: 'relative',
                  border: featured ? `2px solid ${MF.primary}55` : '1px solid rgba(232,213,196,0.6)',
                  boxShadow: featured ? `0 16px 50px ${MF.primary}16` : '0 6px 20px rgba(0,0,0,0.05)',
                  ...(featured && { transform: 'scale(1.04)', zIndex: 1 }),
                }}>
                  {featured && (
                    <Box sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: MF.gradient, color: '#fff', px: 3, py: 0.625, borderRadius: '100px', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      Most Popular
                    </Box>
                  )}
                  <Typography sx={{ fontSize: 19, fontWeight: 700, mb: 1.5 }}>{name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 4.5 }}>
                    {price ? (
                      <>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: MF.textSub, mt: 0.5 }}>₹</Typography>
                        <Typography sx={{ fontSize: 48, fontWeight: 900, color: featured ? MF.primary : MF.text, letterSpacing: '-0.04em', lineHeight: 1 }}>{price.toLocaleString('en-IN')}</Typography>
                        <Typography sx={{ color: MF.outlineVar, fontSize: 14 }}>/mo</Typography>
                      </>
                    ) : (
                      <Typography sx={{ fontSize: 34, fontWeight: 900 }}>Custom</Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, mb: 5 }}>
                    {features.map(f => (
                      <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: `${MF.primary}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 12 }}>check</span>
                        </Box>
                        <Typography sx={{ fontSize: 13.5, color: MF.textSub }}>{f}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(price ? '/register' : '/contact')}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      ...(featured
                        ? { background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', boxShadow: '0 8px 24px rgba(249,115,22,0.32)' }
                        : { background: 'transparent', border: `1.5px solid ${MF.outlineVar}`, color: MF.text }
                      ),
                    }}
                  >
                    {featured ? 'Get Started — Free Trial' : price ? 'Get Started' : 'Contact Sales'}
                  </motion.button>
                </Box>
              </motion.div>
            ))}
          </Box>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} sx={{ textAlign: 'center', mt: 4 }}>
            <Typography sx={{ fontSize: 13, color: MF.textSub }}>
              GST extra as applicable ·{' '}
              <Box component="span" sx={{ color: MF.primary, fontWeight: 700 }}>Cancel anytime</Box>
            </Typography>
          </M>
        </Box>
      </Box>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <Box component="section" sx={{ py: { xs: 10, md: 12 }, px: { xs: 3, md: 6 } }}>
        <M initial="hidden" whileInView="visible" variants={scaleIn} viewport={{ once: true, amount: 0.3 }}
          sx={{ maxWidth: 960, mx: 'auto', background: MF.gradient, borderRadius: '36px', p: { xs: 6, md: 10 }, textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: `0 20px 60px rgba(249,115,22,0.28)` }}
        >
          {/* Static decorative circles — no animation, no repaint */}
          <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '100px', px: 2, py: 0.625, mb: 3 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'livePulse 2s ease-in-out infinite' }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em' }}>2,000+ restaurants live across India</Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 30, md: 50 }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, mb: 2.5, fontFamily: 'Manrope, Inter, sans-serif' }}>
              Take your restaurant<br />digital today
            </Typography>
            <Typography sx={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', mb: 6, maxWidth: 440, mx: 'auto', lineHeight: 1.75 }}>
              Setup in under 20 minutes. Accept UPI from day one. First 30 days completely free.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')}
                style={{ background: '#fff', color: MF.primary, padding: '16px 40px', borderRadius: 14, fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 10px 30px rgba(0,0,0,0.14)' }}>
                Start Free Trial
              </motion.button>
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
