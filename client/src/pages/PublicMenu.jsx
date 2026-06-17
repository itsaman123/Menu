import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useTokens } from '../ThemeContext';
import { fadeUp, scaleUp, staggerContainer } from '../hooks/useScrollAnimation';
import axios from 'axios';

const M = motion.create(Box);
const GA_ID_RE = /^(G-|UA-|AW-)[A-Z0-9-]+$/i;
const PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';

export default function PublicMenu() {
  const { slug } = useParams();
  const T = useTokens();
  const navigate = useNavigate();

  const [menu, setMenu]               = useState([]);   // [{_id, name, items:[...]}]
  const [restaurant, setRestaurant]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [cart, setCart]               = useState({});   // { itemId: qty }

  // Fetch real menu from backend
  useEffect(() => {
    let script1, script2;
    axios.get(`/public/menu/${slug}`)
      .then(({ data }) => {
        setRestaurant(data.restaurant);
        setMenu(data.menu || []);

        const gaId = data.restaurant?.gaTrackingId;
        if (gaId && GA_ID_RE.test(gaId)) {
          script1 = document.createElement('script');
          script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
          script1.async = true;
          document.head.appendChild(script1);

          script2 = document.createElement('script');
          script2.text = [
            'window.dataLayer = window.dataLayer || [];',
            'function gtag(){dataLayer.push(arguments);}',
            "gtag('js', new Date());",
            `gtag('config', '${gaId}');`,
          ].join('\n');
          document.head.appendChild(script2);
        }
      })
      .catch(err => {
        const msg = err.response?.data?.message;
        setError(msg === 'Menu is currently unavailable'
          ? 'This menu is currently unavailable.'
          : 'Restaurant not found.');
      })
      .finally(() => setLoading(false));

    return () => { script1?.remove(); script2?.remove(); };
  }, [slug]);

  // Flat item lookup for price/name (used for cart total + checkout payload)
  const allItems = menu.flatMap(c => c.items);
  const itemMap  = Object.fromEntries(allItems.map(i => [i._id, i]));

  const categories   = ['All Items', ...menu.map(c => c.name)];
  const displayedCats = activeCategory === 'All Items'
    ? menu
    : menu.filter(c => c.name === activeCategory);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => sum + (itemMap[id]?.price || 0) * qty, 0);

  const addToCart    = id => setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const removeFromCart = id => setCart(p => { const n = { ...p }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });

  const goToCheckout = () => {
    // Save cart to localStorage so Checkout can read it after OTP
    const cartItems = Object.entries(cart).map(([id, qty]) => ({
      menuItemId: id,
      name: itemMap[id]?.name || '',
      price: itemMap[id]?.price || 0,
      quantity: qty,
    }));
    localStorage.setItem('pendingCart', JSON.stringify({
      restaurantSlug: slug,
      items: cartItems,
    }));
    navigate(`/checkout/${slug}`);
  };

  /* ─── States ─── */
  if (loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.bg }}>
      <CircularProgress sx={{ color: '#5341cd' }} />
    </Box>
  );
  if (error) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.bg, p: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 56, color: T.textMuted, display: 'block', marginBottom: 16 }}>restaurant_menu</span>
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: T.text, mb: 1 }}>{error}</Typography>
        <Typography sx={{ color: T.textSub }}>Please check the URL or contact the restaurant.</Typography>
      </Box>
    </Box>
  );

  const restaurantName = restaurant?.name || 'Menu';

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text }}>

      {/* ─── Header ─── */}
      <M
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        component="header"
        sx={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, bgcolor: T.navBg, backdropFilter: 'blur(24px)', boxShadow: T.shadowHov }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: 3, height: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, bgcolor: '#6c5ce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <span className="material-symbols-outlined">restaurant</span>
            </Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.05em', color: T.text }}>{restaurantName}</Typography>
          </Box>
        </Box>
      </M>

      <Box component="main" sx={{ pt: 12, pb: 16 }}>

        {/* Hero Banner */}
        <M variants={fadeUp} initial="hidden" animate="visible" component="section" sx={{ px: 3, mb: 4 }}>
          <Box sx={{ position: 'relative', height: 192, borderRadius: '0.5rem', overflow: 'hidden' }}>
            <Box component="img"
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80"
              alt={restaurantName}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s', '&:hover': { transform: 'scale(1.05)' } }}
            />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 3 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>Welcome to</Typography>
              <Typography variant="h1" sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>{restaurantName}</Typography>
            </Box>
          </Box>
        </M>

        {/* Category Tabs */}
        {categories.length > 1 && (
          <Box component="section" sx={{ position: 'sticky', top: 80, zIndex: 40, bgcolor: T.bg, py: 2 }}>
            <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1.5, px: 3, '&::-webkit-scrollbar': { display: 'none' } }}>
              {categories.map(cat => (
                <Box component="button" key={cat} onClick={() => setActiveCategory(cat)} sx={{
                  whiteSpace: 'nowrap', px: 3, py: 1.5, borderRadius: '9999px', fontWeight: 600,
                  fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.3s',
                  ...(activeCategory === cat
                    ? { background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }
                    : { bgcolor: T.surfaceAlt, color: T.textSub, '&:hover': { bgcolor: T.surfaceHigh } }
                  ),
                  '&:active': { transform: 'scale(0.95)' },
                }}>{cat}</Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Menu Items */}
        {menu.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12, px: 3 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 56, color: T.textMuted, display: 'block', marginBottom: 16 }}>menu_book</span>
            <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '1.125rem' }}>Menu coming soon</Typography>
            <Typography sx={{ color: T.textSub, mt: 0.5 }}>No items have been added yet.</Typography>
          </Box>
        ) : (
          <Box component="section" sx={{ px: 3, mt: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {displayedCats.map((category) => (
              category.items.length === 0 ? null :
              <M key={category._id} variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: T.text, mb: 1 }}>{category.name}</Typography>
                <Box sx={{ height: 4, width: 48, bgcolor: '#5341cd', borderRadius: '9999px', mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {category.items.map((item, itemIdx) => (
                    <M key={item._id} variants={scaleUp} custom={itemIdx} sx={{
                      display: 'flex', gap: 2, p: 2, borderRadius: '0.5rem',
                      bgcolor: T.surface, transition: 'all 0.3s',
                      '&:hover': { transform: 'scale(1.02)', bgcolor: T.surfaceAlt },
                    }}>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.0625rem', lineHeight: 1.25, color: T.text }}>{item.name}</Typography>
                        {item.description && (
                          <Typography sx={{ color: T.textSub, fontSize: '0.875rem', lineHeight: 1.625, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
                          <Typography sx={{ fontWeight: 900, fontSize: '1.125rem', letterSpacing: '-0.025em', color: T.text }}>₹{item.price}</Typography>
                          {cart[item._id] ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(108,92,231,0.1)', borderRadius: '9999px', px: 0.5 }}>
                              <Box component="button" onClick={() => removeFromCart(item._id)} sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5341cd', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>remove</span>
                              </Box>
                              <Typography sx={{ px: 1, fontWeight: 700, fontSize: '0.875rem', color: '#5341cd' }}>{cart[item._id]}</Typography>
                              <Box component="button" onClick={() => addToCart(item._id)} sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5341cd', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                              </Box>
                            </Box>
                          ) : (
                            <Box component="button" onClick={() => addToCart(item._id)} sx={{
                              width: 40, height: 40, borderRadius: '50%', bgcolor: '#6c5ce7', color: '#faf6ff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer',
                              '&:active': { transform: 'scale(0.9)' },
                            }}>
                              <span className="material-symbols-outlined">add</span>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      {/* Item image */}
                      <Box sx={{ width: 112, height: 112, flexShrink: 0, borderRadius: '0.5rem', overflow: 'hidden', bgcolor: T.surfaceAlt }}>
                        <Box component="img"
                          src={item.image || PLACEHOLDER}
                          alt={item.name}
                          onError={e => { e.target.src = PLACEHOLDER; }}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    </M>
                  ))}
                </Box>
              </M>
            ))}
          </Box>
        )}
      </Box>

      {/* ─── Cart Bar ─── */}
      <AnimatePresence>
        {cartCount > 0 && (
          <M
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            sx={{ position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 50, px: 3, pb: 3, pt: 1, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(24px)', boxShadow: '0 -10px 30px rgba(18,28,42,0.08)', borderRadius: '32px 32px 0 0' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)', color: '#fff', borderRadius: '9999px', p: 2, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', pl: 1 }}>
                <Typography sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
                  {cartCount} ITEM{cartCount > 1 ? 'S' : ''} SELECTED
                </Typography>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 900, letterSpacing: '-0.025em' }}>₹{cartTotal.toFixed(0)}</Typography>
              </Box>
              <Box component="button" onClick={goToCheckout} sx={{
                display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff', color: '#5341cd',
                px: 3, py: 1, borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem',
                letterSpacing: '-0.025em', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', '&:active': { transform: 'scale(0.95)' },
              }}>
                VIEW CART
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </Box>
            </Box>
          </M>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Box component="footer" sx={{ width: '100%', py: 6, bgcolor: T.surfaceAlt, textAlign: 'center' }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 900, color: T.text }}>{restaurantName}</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: T.textSub }}>Powered by QR Menu</Typography>
        </Box>
      </Box>
    </Box>
  );
}
