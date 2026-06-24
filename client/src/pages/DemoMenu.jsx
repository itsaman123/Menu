import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Drawer } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTokens } from '../ThemeContext';
import { scaleUp, staggerContainer } from '../hooks/useScrollAnimation';
import logo from '../assets/logo.png';

const M = motion.create(Box);

const DEMO_CATEGORIES = [
  {
    id: 'c1', name: 'Signature Starters',
    items: [
      { id: 'i1', name: 'Burrata & Heirloom Art', description: 'Creamy burrata, balsamic pearls, garden-fresh heirloom tomatoes with basil emulsion.', price: 450, veg: true, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
      { id: 'i2', name: 'Truffle Mushroom Dumplings', description: 'Hand-pleated forest mushroom parcels with black truffle oil and soy ginger dip.', price: 520, veg: false, img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 'c2', name: 'Main Canvas',
    items: [
      { id: 'i3', name: 'Saffron Risotto Primavera', description: 'Vibrant Arborio rice slow-cooked with Kashmiri saffron and seasonal grilled vegetables.', price: 780, veg: true, img: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=400&q=80' },
      { id: 'i4', name: 'Char-Grilled Salmon', description: 'Atlantic salmon with citrus glaze, served over quinoa and citrus segments.', price: 1150, veg: false, img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80' },
      { id: 'i5', name: 'Wild Mushroom Pizza', description: 'Truffle cream base, porcini mushrooms, and fresh buffalo mozzarella on a crisp crust.', price: 680, veg: true, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 'c3', name: 'Desserts',
    items: [
      { id: 'i6', name: 'Midnight Cocoa Fondant', description: '70% Valrhona dark chocolate with a warm molten core and vanilla ice cream.', price: 380, veg: true, img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80' },
      { id: 'i7', name: 'Harvest Grain Bowl', description: 'Organic quinoa, roasted seasonal vegetables, and lemon-tahini dressing.', price: 450, veg: true, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: 'c4', name: 'Cocktails',
    items: [
      { id: 'i8', name: 'Hibiscus Negroni', description: 'Gin infused with hibiscus flowers, campari, and orange bitters over a large ice sphere.', price: 520, veg: true, img: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80' },
      { id: 'i9', name: 'Yuzu Spritz', description: 'Japanese yuzu citrus, elderflower liqueur, and prosecco with a salted rim.', price: 480, veg: true, img: 'https://images.unsplash.com/photo-1560508179-b2c9a3555b76?auto=format&fit=crop&w=400&q=80' },
    ],
  },
];

const ALL_ITEMS = DEMO_CATEGORIES.flatMap(c => c.items);

const STEPS = { MENU: 'menu', SUCCESS: 'success' };

const TOTAL_SECS = 15 * 60; // 15 minutes

const ORDER_STAGES = [
  { icon: 'check_circle', label: 'Order Received', sub: 'Kitchen notified', color: '#006c49', threshold: TOTAL_SECS },
  { icon: 'local_fire_department', label: 'Being Prepared', sub: 'Chefs are cooking', color: '#884800', threshold: Math.round(TOTAL_SECS * 0.67) },
  { icon: 'room_service', label: 'Ready to Serve', sub: 'On its way to you', color: '#f97316', threshold: 0 },
];

function CircleTimer({ secondsLeft, total }) {
  const R = 52;
  const circ = 2 * Math.PI * R;
  const progress = secondsLeft / total;
  const dash = circ * progress;
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const isDone = secondsLeft === 0;

  return (
    <Box sx={{ position: 'relative', width: 140, height: 140, mx: 'auto', mb: 3 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(249,115,22,0.1)" strokeWidth="8" />
        <circle
          cx="70" cy="70" r={R} fill="none"
          stroke={isDone ? '#006c49' : '#f97316'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${isDone ? circ : dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s linear, stroke 0.4s' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {isDone ? (
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#006c49' }}>check_circle</span>
        ) : (
          <>
            <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.05em', color: '#f97316', lineHeight: 1 }}>
              {mins}:{secs}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(249,115,22,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              est. ready
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

export default function DemoMenu() {
  const T = useTokens();
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [step, setStep] = useState(STEPS.MENU);
  const [cartOpen, setCartOpen] = useState(false);
  const [form, setForm] = useState({ name: '', table: '' });
  const [errors, setErrors] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECS);
  const timerRef = useRef(null);

  // snapshot of cart items at order time
  const [orderedItems, setOrderedItems] = useState([]);
  const [orderedTotal, setOrderedTotal] = useState(0);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = ALL_ITEMS.reduce((sum, item) => sum + (item.price * (cart[item.id] || 0)), 0);
  const cartItems = ALL_ITEMS.filter(i => cart[i.id] > 0);

  const add = (id) => setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const remove = (id) => setCart(p => { const n = { ...p }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });
  const clearCart = () => setCart({});

  const displayedItems = activeCategory === 'All'
    ? DEMO_CATEGORIES
    : DEMO_CATEGORIES.filter(c => c.id === activeCategory);

  useEffect(() => {
    if (step !== STEPS.SUCCESS) return;
    setSecondsLeft(TOTAL_SECS);
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  const currentStageIdx = ORDER_STAGES.findIndex(s => secondsLeft <= s.threshold);
  const activeStageIdx = currentStageIdx === -1 ? 0 : currentStageIdx;

  const handlePlaceOrder = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.table.trim()) e.table = 'Table number is required';
    if (Object.keys(e).length) { setErrors(e); return; }
    setOrderedItems([...cartItems.map(i => ({ ...i, qty: cart[i.id] }))]);
    setOrderedTotal(cartTotal);
    setCartOpen(false);
    setStep(STEPS.SUCCESS);
  };

  const handleBackToMenu = () => {
    clearInterval(timerRef.current);
    setStep(STEPS.MENU);
    clearCart();
    setForm({ name: '', table: '' });
    setSecondsLeft(TOTAL_SECS);
  };

  if (step === STEPS.SUCCESS) {
    const isDone = secondsLeft === 0;
    return (
      <Box sx={{ bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', overflowY: 'auto' }}>
        <M
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          sx={{ maxWidth: 480, mx: 'auto', px: 3, py: 5 }}
        >
          {/* Top label */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isDone ? '#006c49' : '#f97316', animation: isDone ? 'none' : 'pulse 1.5s infinite' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDone ? '#006c49' : '#f97316' }}>
              {isDone ? 'Order Ready!' : 'Live Tracking'}
            </Typography>
          </Box>

          <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.04em', color: T.text, mb: 0.5 }}>
            {isDone ? 'Enjoy your meal!' : 'Order confirmed'}
          </Typography>
          <Typography sx={{ color: T.textSub, fontSize: '0.9rem', mb: 4 }}>
            Hi <strong style={{ color: T.text }}>{form.name}</strong> · Table <strong style={{ color: T.text }}>#{form.table}</strong>
          </Typography>

          {/* Circular countdown */}
          <CircleTimer secondsLeft={secondsLeft} total={TOTAL_SECS} />

          {/* Status steps */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mb: 4 }}>
            {ORDER_STAGES.map((stage, idx) => {
              const isActive = idx === activeStageIdx;
              const isDoneStage = idx < activeStageIdx || isDone;
              return (
                <M
                  key={idx}
                  initial={false}
                  animate={{ opacity: isActive || isDoneStage ? 1 : 0.35 }}
                  transition={{ duration: 0.4 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Icon + line */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <M
                        initial={false}
                        animate={{ scale: isActive ? [1, 1.15, 1] : 1 }}
                        transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
                        sx={{
                          width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: isDoneStage || isActive ? `${stage.color}18` : T.surfaceAlt,
                          border: `2px solid ${isDoneStage || isActive ? stage.color : T.border}`,
                          transition: 'all 0.4s',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: isDoneStage || isActive ? stage.color : T.textMuted }}>
                          {stage.icon}
                        </span>
                      </M>
                      {idx < ORDER_STAGES.length - 1 && (
                        <Box sx={{ width: 2, height: 28, bgcolor: isDoneStage ? stage.color : T.border, borderRadius: 1, transition: 'background-color 0.4s', my: 0.25 }} />
                      )}
                    </Box>
                    {/* Text */}
                    <Box sx={{ pt: 0.75, pb: idx < ORDER_STAGES.length - 1 ? 0 : 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: isDoneStage || isActive ? T.text : T.textMuted, transition: 'color 0.4s' }}>
                        {stage.label}
                        {isActive && !isDone && (
                          <Box component="span" sx={{ ml: 1, display: 'inline-flex', gap: '3px', verticalAlign: 'middle' }}>
                            {[0, 1, 2].map(i => (
                              <Box key={i} sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: stage.color, animation: `dotBounce 1.2s ${i * 0.2}s infinite` }} />
                            ))}
                          </Box>
                        )}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: T.textMuted }}>{stage.sub}</Typography>
                    </Box>
                  </Box>
                </M>
              );
            })}
          </Box>

          {/* Order summary */}
          <Box sx={{ bgcolor: T.surface, borderRadius: 3, p: 2.5, mb: 3, border: `1px solid ${T.border}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textMuted, mb: 1.5 }}>Order Summary</Typography>
            {orderedItems.map(item => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography sx={{ fontSize: '0.875rem', color: T.text }}>{item.qty}× {item.name}</Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: T.text }}>₹{item.price * item.qty}</Typography>
              </Box>
            ))}
            <Box sx={{ borderTop: `1px solid ${T.border}`, mt: 1.5, pt: 1.5, display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 800, color: T.text }}>Total</Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: T.accent }}>₹{orderedTotal}</Typography>
            </Box>
          </Box>

          {/* Demo note */}
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: T.accentDim, border: `1px solid ${T.accentSoft}`, mb: 3 }}>
            <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>
              <strong style={{ color: T.accent }}>Demo mode</strong> — In production this screen updates in real-time as the kitchen marks your order progress.
            </Typography>
          </Box>

          <Box
            component="button"
            onClick={handleBackToMenu}
            sx={{
              width: '100%', py: 1.5, borderRadius: '9999px',
              background: 'linear-gradient(135deg,#f97316,#ea580c)',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
              border: 'none', cursor: 'pointer', letterSpacing: '-0.02em',
              boxShadow: '0 8px 24px rgba(249,115,22,0.25)',
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            Back to Menu
          </Box>
        </M>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text }}>

      {/* Header */}
      <M
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        component="header"
        sx={{
          position: 'fixed', top: 0, width: '100%', zIndex: 50,
          bgcolor: T.navBg, backdropFilter: 'blur(24px)', boxShadow: T.shadowHov,
        }}
      >
        <Box sx={{ maxWidth: 720, mx: 'auto', px: 3, height: 72, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="img" src={logo} alt="ScanIt" sx={{ height: 40, width: 'auto' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00a86b', animation: 'pulse 2s infinite' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#00a86b', fontWeight: 600 }}>Demo Mode</Typography>
            </Box>
          </Box>

          {/* Cart button */}
          <Box
            component="button"
            onClick={() => cartCount > 0 && setCartOpen(true)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1,
              borderRadius: '9999px', border: 'none', cursor: cartCount > 0 ? 'pointer' : 'default',
              background: cartCount > 0 ? 'linear-gradient(135deg,#f97316,#ea580c)' : T.surfaceAlt,
              color: cartCount > 0 ? '#fff' : T.textMuted,
              transition: 'all 0.3s', fontFamily: 'Inter, sans-serif',
              '&:active': cartCount > 0 ? { transform: 'scale(0.96)' } : {},
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>shopping_bag</span>
            {cartCount > 0 && (
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{cartCount}</Typography>
            )}
          </Box>
        </Box>
      </M>

      <Box component="main" sx={{ pt: '72px', pb: 20, maxWidth: 720, mx: 'auto' }}>

        {/* Hero banner */}
        <M
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          sx={{ px: 3, mt: 3, mb: 3 }}
        >
          <Box sx={{ position: 'relative', height: 180, borderRadius: 3, overflow: 'hidden' }}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80"
              alt="Restaurant"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Box sx={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 3,
            }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>Interactive Demo</Typography>
              <Typography sx={{ color: '#fff', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.04em' }}>CulinaryCanvas Menu</Typography>
            </Box>
          </Box>
        </M>

        {/* Category tabs */}
        <Box sx={{ position: 'sticky', top: 72, zIndex: 40, bgcolor: T.bg, py: 1.5, mb: 1 }}>
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1.5, px: 3, '&::-webkit-scrollbar': { display: 'none' } }}>
            {[{ id: 'All', name: 'All Items' }, ...DEMO_CATEGORIES].map(cat => (
              <Box
                component="button"
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                sx={{
                  whiteSpace: 'nowrap', px: 2.5, py: 1.25, borderRadius: '9999px',
                  fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', transition: 'all 0.25s',
                  ...(activeCategory === cat.id
                    ? { background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }
                    : { bgcolor: T.surfaceAlt, color: T.textSub, '&:hover': { bgcolor: T.surfaceHigh } }
                  ),
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >{cat.id === 'All' ? 'All Items' : cat.name}</Box>
            ))}
          </Box>
        </Box>

        {/* Menu sections */}
        <Box sx={{ px: 3, display: 'flex', flexDirection: 'column', gap: 4, mt: 1 }}>
          {displayedItems.map(category => (
            <M
              key={category.id}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em', color: T.text, mb: 0.75 }}>
                {category.name}
              </Typography>
              <Box sx={{ height: 3, width: 36, bgcolor: T.accent, borderRadius: '9999px', mb: 2.5 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {category.items.map((item, idx) => (
                  <M
                    key={item.id}
                    variants={scaleUp}
                    custom={idx}
                    sx={{
                      display: 'flex', gap: 2, p: 2, borderRadius: 3,
                      bgcolor: T.surface, border: `1px solid ${T.border}`,
                      transition: 'all 0.25s',
                      '&:hover': { boxShadow: T.shadowHov, transform: 'translateY(-1px)' },
                    }}
                  >
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{
                          width: 10, height: 10, borderRadius: 0.5, flexShrink: 0,
                          border: `2px solid ${item.veg ? '#006c49' : '#ba1a1a'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: item.veg ? '#006c49' : '#ba1a1a' }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.text }}>{item.name}</Typography>
                      </Box>
                      <Typography sx={{ color: T.textSub, fontSize: '0.825rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: T.text }}>₹{item.price}</Typography>
                        {cart[item.id] ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: T.accentDim, borderRadius: '9999px', px: 0.5 }}>
                            <Box component="button" onClick={() => remove(item.id)} sx={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, background: 'none', border: 'none', cursor: 'pointer' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>remove</span>
                            </Box>
                            <Typography sx={{ px: 1, fontWeight: 800, fontSize: '0.875rem', color: T.accent, minWidth: 16, textAlign: 'center' }}>{cart[item.id]}</Typography>
                            <Box component="button" onClick={() => add(item.id)} sx={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, background: 'none', border: 'none', cursor: 'pointer' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                            </Box>
                          </Box>
                        ) : (
                          <Box component="button" onClick={() => add(item.id)} sx={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#f97316,#ea580c)',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(249,115,22,0.3)', border: 'none', cursor: 'pointer',
                            '&:active': { transform: 'scale(0.9)' },
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ width: 100, height: 100, flexShrink: 0, borderRadius: 2, overflow: 'hidden' }}>
                      <Box component="img" src={item.img} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  </M>
                ))}
              </Box>
            </M>
          ))}
        </Box>
      </Box>

      {/* Sticky cart bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <M
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 50,
              px: 3, pb: 3, pt: 1,
            }}
          >
            <Box sx={{ maxWidth: 720, mx: 'auto' }}>
              <Box
                component="button"
                onClick={() => setCartOpen(true)}
                sx={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff',
                  borderRadius: '9999px', px: 3, py: 2, border: 'none', cursor: 'pointer',
                  boxShadow: '0 20px 40px rgba(249,115,22,0.35)', fontFamily: 'Inter, sans-serif',
                  '&:active': { transform: 'scale(0.99)' },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography component="span" sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
                    {cartCount} item{cartCount > 1 ? 's' : ''}
                  </Typography>
                  <Typography component="span" sx={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '-0.03em' }}>₹{cartTotal}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: 'rgba(255,255,255,0.18)', px: 2, py: 0.75, borderRadius: '9999px' }}>
                  <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>View Cart</Typography>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                </Box>
              </Box>
            </Box>
          </M>
        )}
      </AnimatePresence>

      {/* Cart / Checkout Drawer */}
      <Drawer
        anchor="bottom"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: T.bg, borderRadius: '24px 24px 0 0',
            maxWidth: 720, mx: 'auto', left: 0, right: 0,
            maxHeight: '90vh',
          },
        }}
      >
        <Box sx={{ p: 3, overflowY: 'auto' }}>
          {/* Handle */}
          <Box sx={{ width: 40, height: 4, bgcolor: T.surfaceHigh, borderRadius: '9999px', mx: 'auto', mb: 3 }} />

          <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.04em', color: T.text, mb: 3 }}>Your Order</Typography>

          {/* Cart items */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            {cartItems.map(item => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: T.surface, borderRadius: 2.5, border: `1px solid ${T.border}` }}>
                <Box component="img" src={item.img} alt={item.name} sx={{ width: 52, height: 52, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>₹{item.price} each</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: T.accentDim, borderRadius: '9999px', px: 0.5 }}>
                  <Box component="button" onClick={() => remove(item.id)} sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>remove</span>
                  </Box>
                  <Typography sx={{ px: 0.75, fontWeight: 800, fontSize: '0.875rem', color: T.accent, minWidth: 16, textAlign: 'center' }}>{cart[item.id]}</Typography>
                  <Box component="button" onClick={() => add(item.id)} sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>
                  </Box>
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: T.text, minWidth: 52, textAlign: 'right' }}>₹{item.price * cart[item.id]}</Typography>
              </Box>
            ))}
          </Box>

          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderTop: `1px solid ${T.border}`, mb: 3 }}>
            <Typography sx={{ fontWeight: 700, color: T.textSub }}>Total</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: T.accent }}>₹{cartTotal}</Typography>
          </Box>

          {/* Customer details */}
          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textMuted, mb: 1.5 }}>Your Details</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            <TextField
              placeholder="Your name"
              value={form.name}
              onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
              error={!!errors.name}
              helperText={errors.name}
              size="small"
              InputProps={{ startAdornment: <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.textMuted, marginRight: 8 }}>person</span> }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, bgcolor: T.inputBg, fontFamily: 'Inter, sans-serif',
                  '& fieldset': { borderColor: T.border },
                  '&:hover fieldset': { borderColor: T.accent },
                  '&.Mui-focused fieldset': { borderColor: T.accent },
                },
                '& input': { color: T.text, fontFamily: 'Inter, sans-serif' },
                '& .MuiFormHelperText-root': { fontFamily: 'Inter, sans-serif' },
              }}
            />
            <TextField
              placeholder="Table number"
              value={form.table}
              onChange={e => { setForm(p => ({ ...p, table: e.target.value })); setErrors(p => ({ ...p, table: '' })); }}
              error={!!errors.table}
              helperText={errors.table}
              size="small"
              InputProps={{ startAdornment: <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.textMuted, marginRight: 8 }}>table_restaurant</span> }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, bgcolor: T.inputBg, fontFamily: 'Inter, sans-serif',
                  '& fieldset': { borderColor: T.border },
                  '&:hover fieldset': { borderColor: T.accent },
                  '&.Mui-focused fieldset': { borderColor: T.accent },
                },
                '& input': { color: T.text, fontFamily: 'Inter, sans-serif' },
                '& .MuiFormHelperText-root': { fontFamily: 'Inter, sans-serif' },
              }}
            />
          </Box>

          {/* Demo note */}
          <Box sx={{ p: 1.75, borderRadius: 2, bgcolor: T.accentDim, border: `1px solid ${T.accentSoft}`, mb: 3 }}>
            <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>
              <strong style={{ color: T.accent }}>Demo mode:</strong> No payment or OTP required. Just place and see the confirmation flow.
            </Typography>
          </Box>

          <Box
            component="button"
            onClick={handlePlaceOrder}
            sx={{
              width: '100%', py: 1.75, borderRadius: '9999px',
              background: 'linear-gradient(135deg,#f97316,#ea580c)',
              color: '#fff', fontWeight: 800, fontSize: '1rem',
              fontFamily: 'Inter, sans-serif', border: 'none', cursor: 'pointer',
              letterSpacing: '-0.02em', boxShadow: '0 8px 24px rgba(249,115,22,0.3)',
              '&:active': { transform: 'scale(0.99)' },
            }}
          >
            Place Order
          </Box>
        </Box>
      </Drawer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </Box>
  );
}
