import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useTokens } from '../ThemeContext';
import { fadeUp, scaleUp, staggerContainer, scrollViewport, slideLeft } from '../hooks/useScrollAnimation';
import axios from 'axios';

const M = motion.create(Box);
const MTypo = motion.create(Typography);

const MOCK_MENU = [
  {
    _id: 'c1', name: 'Signature Starters', items: [
      { _id: '1', name: 'Burrata & Heirloom Art', description: 'Creamy burrata heart, balsamic pearls, and garden-fresh heirloom tomatoes with a basil emulsion.', price: 450, veg: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpQWh7YejAvAsIIMpeZlZNRTjQFdiHTaWPlmrTSvvbeci6wEIou22ubdXmFaqP00mm0PlpfIIeauAqaXJogWrH0OYUEI0aKjVe9gvpsAcTznFKJ9eZt25GqhCRIYPI2_kV-2QMrood4RidpWc-bI_3y_ceHdYR0JvyjiCtaIZncnJBGcf6H12DOqK7X_UKuDhrKndPTvlCl643slMMlHwV_ZEUV4zhSPvQWYKo0YQM3HnPywjvng6HMcYBgX_okDSZs5Id-gOgzX4' },
      { _id: '2', name: 'Truffle Infused Dumplings', description: 'Hand-pleated forest mushroom parcels with a touch of black truffle oil and soy ginger dip.', price: 520, veg: false, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC4jA0nCg4fYd52c4_pKG4Zbs4aNCi-LiT5XuJBp9XIOwBQwjUrqmM9h-wgle631KPg6uc4S9PTfiNiEHUco7JZi8dm-J0Vp-NT-Lwpd8xJoHLnfwfQ5g3eM53Mf52XTjnulFb6nOdBcKBOibhsClxJM-vKHpHjawh860GDtkXyvG5s2hqiDxpxCICGSbhymoJaLiYak0Z-iG6v5eckCEVjdCvYbxI-Duig-q7tKqPgPoYUSXIUTNJjy-27tyUXM_i7GuReablnLI' },
    ],
  },
  {
    _id: 'c2', name: 'Main Canvas', items: [
      { _id: '3', name: 'Saffron Risotto Primavera', description: 'Vibrant Arborio rice slow-cooked with Kashmiri saffron and seasonal grilled vegetables.', price: 780, veg: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUUAngsEt_oHBAwcJQFzJ1i4G4egdG8vTM-FJ-RVvnkt-qlfPjo1RRSGIYn9K1sAv8NEaJOkAi5J2s38LC8-6zy81J7PYvzScQlwKPNNyP10sl9mOrzKQzQYF77SJCO6BS4Wk9nOS-kgZ9hJo2I4aRqeTltWN9iGpcaFiSFZpNktHSbcBdqzJxMoQmQeY6DVQZFE7mi7awDiG50_n3qNnEgq7clgJ52DM04TCiViVS9hqgO9bIyrS8qpMgeG8lYaldbOEU_Y6zXhk' },
      { _id: '4', name: 'Char-Grilled Salmon', description: 'Atlantic salmon with a citrus glaze, served over a bed of quinoa and citrus segments.', price: 1150, veg: false, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRAijTNyC9rdz6kAPbvZsb8mVJz1XnFeSHIk_dYhH4qNsP3U3tGj5rdSdHDJIl4UMwhzaDOI0CZtpf92nQd9IMVYceVSzOkfPK8FQHHiaXs56THrTT8yJixg_1n0sEzDgAXtG_nfqWUom2hZXzVozp0vO5sUOClU9hFD2wabuWTLNvIfaFaTB4WuTmmxrn0-_AhJMsws8ekafinD62upwHATZBT-lZkOEquzpSr04TWO-O_kc3Td2VUL8X2RN7sXdvK6__5Z-B8sY' },
    ],
  },
];

const CATEGORIES = ['All Items', 'Signature Starters', 'Main Canvas', 'Liquid Art', 'Sweet Finales'];

const GA_ID_RE = /^(G-|UA-|AW-)[A-Z0-9-]+$/i;

export default function PublicMenu() {
  const { slug } = useParams();
  const T = useTokens();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [cart, setCart] = useState({});

  // Fetch restaurant GA tracking ID and inject GA4 script
  useEffect(() => {
    let script1, script2;
    axios.get(`/public/menu/${slug}`).then(({ data }) => {
      const gaId = data.restaurant?.gaTrackingId;
      if (!gaId || !GA_ID_RE.test(gaId)) return;

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
    }).catch(() => {});

    return () => {
      script1?.remove();
      script2?.remove();
    };
  }, [slug]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const getItemPrice = () => {
    let total = 0;
    MOCK_MENU.forEach(cat => cat.items.forEach(item => { if (cart[item._id]) total += item.price * cart[item._id]; }));
    return total;
  };

  const addToCart = (id) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id) => setCart(prev => { const n = { ...prev }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text }}>

      {/* ─── Header ─── */}
      <M
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        component="header"
        sx={{
          position: 'fixed', top: 0, width: '100%', zIndex: 50,
          bgcolor: T.navBg, backdropFilter: 'blur(24px)', boxShadow: T.shadowHov,
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: 3, height: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, bgcolor: '#6c5ce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <span className="material-symbols-outlined">restaurant</span>
            </Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.05em', color: T.text }}>The Curated Canvas</Typography>
          </Box>
          <Box component="button" sx={{
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', bgcolor: T.surfaceAlt, color: T.textSub, border: 'none', cursor: 'pointer',
            '&:hover': { bgcolor: T.surfaceHigh },
          }}>
            <span className="material-symbols-outlined">search</span>
          </Box>
        </Box>
      </M>

      <Box component="main" sx={{ pt: 12, pb: 16 }}>
        {/* Hero Banner */}
        <M
          variants={fadeUp}
          initial="hidden" animate="visible"
          component="section"
          sx={{ px: 3, mb: 4 }}
        >
          <Box sx={{ position: 'relative', height: 192, borderRadius: '0.5rem', overflow: 'hidden', '&:hover img': { transform: 'scale(1.05)' } }}>
            <Box component="img"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUBExby2R-g-jn4yDJXrGjhn2PIMKa8UnZcrEpP8_X7ia_dIUZMUY-yeIZIQgDtZuLIwJ0k7S4tTrNIGeqbP3v5bi51NI0DdPdoFCoTRtIRkSMQFeJcHFP_lfR0vNlCUWxa4dUI0l4vSynqF43KIusF33uxhdos4L6mU735c05E08P5i4T49WqWQVu2nrn4-4xKqi0O2Hu0mY2131ewhjQ3-sxkXnSvfVTsNnIkQ95REg31Z97zaTUOFMXeEDSFDQMZlQ-MjOgYec"
              alt="Restaurant" sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }}
            />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 3 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>Welcome to</Typography>
              <Typography variant="h1" sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>The Curated Experience</Typography>
            </Box>
          </Box>
        </M>

        {/* Category Tabs */}
        <Box component="section" sx={{ position: 'sticky', top: 80, zIndex: 40, bgcolor: T.bg, py: 2 }}>
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1.5, px: 3, '&::-webkit-scrollbar': { display: 'none' } }}>
            {CATEGORIES.map(cat => (
              <Box component="button" key={cat} onClick={() => setActiveCategory(cat)} sx={{
                whiteSpace: 'nowrap', px: 3, py: 1.5, borderRadius: '9999px', fontWeight: 600,
                fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.3s',
                ...(activeCategory === cat
                  ? { background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }
                  : { bgcolor: T.surfaceAlt, color: T.textSub, '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' } }
                ),
                '&:active': { transform: 'scale(0.95)' },
              }}>{cat}</Box>
            ))}
          </Box>
        </Box>

        {/* Menu Items */}
        <Box component="section" sx={{ px: 3, mt: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {MOCK_MENU.map((category, catIdx) => (
            <M
              key={category._id}
              variants={staggerContainer}
              initial="hidden" whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: T.text, mb: 1 }}>{category.name}</Typography>
              <Box sx={{ height: 4, width: 48, bgcolor: T.accent, borderRadius: '9999px', mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {category.items.map((item, itemIdx) => (
                  <M key={item._id} variants={scaleUp} custom={itemIdx} sx={{
                    display: 'flex', gap: 2, p: 2, borderRadius: '0.5rem',
                    bgcolor: T.surface, transition: 'all 0.3s',
                    '&:hover': { transform: 'scale(1.02)', bgcolor: T.surfaceHighest },
                  }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span className="material-symbols-outlined" style={{ color: item.veg ? '#006c49' : '#ba1a1a', fontSize: 14 }}>
                          {item.veg ? 'eco' : 'restaurant_menu'}
                        </span>
                        <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.25, color: T.text }}>{item.name}</Typography>
                      </Box>
                      <Typography sx={{ color: T.textSub, fontSize: '0.875rem', lineHeight: 1.625, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </Typography>
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
                    <Box sx={{ width: 112, height: 112, flexShrink: 0, borderRadius: '0.5rem', overflow: 'hidden' }}>
                      <Box component="img" src={item.img} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  </M>
                ))}
              </Box>
            </M>
          ))}
        </Box>
      </Box>

      {/* ─── Cart Bar ─── */}
      <AnimatePresence>
        {cartCount > 0 && (
          <M
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 50,
              px: 3, pb: 3, pt: 1, bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(24px)', boxShadow: '0 -10px 30px rgba(18,28,42,0.08)',
              borderRadius: '32px 32px 0 0',
            }}
          >
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)', color: '#fff',
            borderRadius: '9999px', p: 2, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', pl: 1 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
                {cartCount} ITEM{cartCount > 1 ? 'S' : ''} SELECTED
              </Typography>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 900, letterSpacing: '-0.025em' }}>₹{getItemPrice()}</Typography>
            </Box>
            <Box component="button" onClick={() => navigate(`/checkout/${slug}`)} sx={{
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
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 900, color: T.text }}>The Curated Canvas</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3 }}>
            {['Privacy Policy', 'Contact Us', 'Terms of Service'].map(link => (
              <Typography key={link} component="a" href="#" sx={{ fontSize: '0.875rem', color: T.textSub, textDecoration: 'underline', '&:hover': { color: T.text } }}>{link}</Typography>
            ))}
          </Box>
          <Typography sx={{ fontSize: '0.875rem', color: T.textSub }}>© 2024 The Curated Canvas. Physical layers for digital experiences.</Typography>
        </Box>
      </Box>
    </Box>
  );
}
