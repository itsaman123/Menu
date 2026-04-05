import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Button, IconButton, Badge, Skeleton, Stack,
  Grid, Chip, useMediaQuery, useTheme, Drawer
} from '@mui/material';
import {
  Add, Remove, ShoppingBag, Restaurant as RestaurantIcon,
  ArrowBack, Search, Close, FoodBank
} from '@mui/icons-material';
import api from '../api';
import useCart from '../hooks/useCart';
import { DEMO_RESTAURANT, DEMO_MENU } from '../demoData';
import { useAppTheme } from '../ThemeContext';

/* ─── Theme-aware colour helper ─── */
const useTk = () => {
  const { isDark } = useAppTheme();
  return isDark ? {
    bg: '#0f1117', surface: '#16191f', surfaceAlt: '#1d2129',
    border: 'rgba(255,255,255,0.07)',
    accent: '#7c6ef0', accentDim: 'rgba(124,110,240,0.14)',
    text: '#e8eaf0', textSub: '#8b8fa8', textMuted: '#4b5068',
    navBg: 'rgba(22,25,31,0.94)',
    pillActive: 'linear-gradient(135deg,#7c6ef0,#a78bfa)',
    pillActiveTxt: '#fff',
    pillInactive: 'rgba(255,255,255,0.05)',
    pillInactiveTxt: '#8b8fa8',
    cartBg: 'linear-gradient(135deg,#7c6ef0,#a78bfa)',
    cartGlow: '0 8px 28px rgba(124,110,240,0.5)',
    shadow: '0 4px 24px rgba(0,0,0,0.35)',
  } : {
    bg: '#f4f5f7', surface: '#ffffff', surfaceAlt: '#f0f1f3',
    border: 'rgba(0,0,0,0.07)',
    accent: '#6c5ce7', accentDim: 'rgba(108,92,231,0.1)',
    text: '#1a1c23', textSub: '#474554', textMuted: '#9299a6',
    navBg: 'rgba(255,255,255,0.96)',
    pillActive: 'linear-gradient(135deg,#6c5ce7,#8b80f0)',
    pillActiveTxt: '#fff',
    pillInactive: 'rgba(0,0,0,0.05)',
    pillInactiveTxt: '#474554',
    cartBg: 'linear-gradient(135deg,#6c5ce7,#8b80f0)',
    cartGlow: '0 8px 28px rgba(108,92,231,0.4)',
    shadow: '0 2px 12px rgba(0,0,0,0.1)',
  };
};

const SIDEBAR_W = 220;

const PublicMenu = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const table = searchParams.get('table');
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const T = useTk();

  useEffect(() => {
    if (table) sessionStorage.setItem(`table-${slug}`, table);
  }, [table, slug]);

  const [activeCat, setActiveCat] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const searchRef = useRef(null);

  const { cart, addToCart, updateQuantity, cartTotal, cartCount } = useCart();

  const { data, isLoading, error } = useQuery({
    queryKey: ['publicMenu', slug],
    queryFn: async () => (await api.get(`/public/menu/${slug}`)).data,
    retry: 1,
    enabled: slug !== 'demo',
  });

  const isDemo = slug === 'demo';
  const restaurant = isDemo ? DEMO_RESTAURANT : data?.restaurant;
  const menu = isDemo ? DEMO_MENU : data?.menu || [];
  const finalLoading = isDemo ? false : isLoading;

  const getItemQuantity = (itemId) => cart.find((i) => i.menuItemId === itemId)?.quantity || 0;

  // Search filter
  const searchResults = searchQuery.trim()
    ? menu.flatMap(cat => cat.items
        .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(item => ({ ...item, catName: cat.name }))
      )
    : [];

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  if (error && !isDemo) {
    return (
      <Box sx={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Box sx={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography sx={{ color: T.text, fontWeight: 700, mb: 1 }}>Menu Unavailable</Typography>
          <Typography sx={{ color: T.textSub, fontSize: '0.85rem' }}>{error?.response?.data?.message || 'Error loading menu. Please check the URL.'}</Typography>
        </Box>
      </Box>
    );
  }

  if (menu.length === 0 && !finalLoading) {
    return (
      <Box sx={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <FoodBank sx={{ fontSize: 72, color: T.textMuted }} />
        <Typography sx={{ color: T.textSub, fontSize: '1.1rem', fontWeight: 600 }}>No menu items available yet.</Typography>
      </Box>
    );
  }

  /* ─── Item Card ─── */
  const ItemCard = ({ item, catName }) => {
    const qty = getItemQuantity(item._id);
    return (
      <Box sx={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: '14px', overflow: 'hidden',
        display: 'flex', flexDirection: isMobile ? 'row' : 'column',
        transition: 'transform 0.18s, box-shadow 0.18s',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: T.shadow },
      }}>
        {/* Image */}
        {item.image ? (
          <Box
            component="img"
            src={item.image}
            alt={item.name}
            sx={{
              width: isMobile ? 110 : '100%',
              height: isMobile ? 110 : 160,
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ) : (
          <Box sx={{
            width: isMobile ? 90 : '100%',
            height: isMobile ? 90 : 130,
            background: T.accentDim,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, m: isMobile ? 1 : 0, borderRadius: isMobile ? '10px' : 0,
          }}>
            <FoodBank sx={{ fontSize: 32, color: T.accent, opacity: 0.5 }} />
          </Box>
        )}

        {/* Content */}
        <Box sx={{ p: isMobile ? 1.5 : 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
          <Box>
            {catName && !isMobile && (
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                {catName}
              </Typography>
            )}
            <Typography sx={{ fontWeight: 700, fontSize: isMobile ? '0.9rem' : '0.95rem', color: T.text, lineHeight: 1.3, mb: 0.5 }}>
              {item.name}
            </Typography>
            <Typography sx={{
              fontSize: '0.75rem', color: T.textSub, lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: isMobile ? 2 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              mb: 1.5,
            }}>
              {item.description || 'Crafted with care by our chef.'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: T.accent }}>
              ₹{parseFloat(item.price).toFixed(0)}
            </Typography>
            {qty > 0 ? (
              <Box sx={{
                display: 'flex', alignItems: 'center',
                background: T.accentDim, borderRadius: '10px',
                border: `1px solid ${T.accent}30`, px: 0.3,
              }}>
                <IconButton size="small" onClick={() => updateQuantity(item._id, qty - 1)}
                  sx={{ color: T.accent, p: 0.4, '&:hover': { background: 'transparent' } }}>
                  <Remove sx={{ fontSize: 15 }} />
                </IconButton>
                <Typography sx={{ mx: 0.8, fontWeight: 800, minWidth: 16, textAlign: 'center', fontSize: '0.88rem', color: T.text }}>
                  {qty}
                </Typography>
                <IconButton size="small" onClick={() => updateQuantity(item._id, qty + 1)}
                  sx={{ color: T.accent, p: 0.4, '&:hover': { background: 'transparent' } }}>
                  <Add sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                size="small"
                onClick={() => addToCart(item)}
                sx={{
                  width: 32, height: 32, borderRadius: '10px',
                  background: T.accentDim, color: T.accent,
                  border: `1px solid ${T.accent}40`,
                  '&:hover': { background: T.accent, color: '#fff' },
                  transition: 'all 0.18s ease',
                }}>
                <Add sx={{ fontSize: 17 }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  /* ─── Cart Drawer ─── */
  const CartDrawer = () => (
    <Drawer
      anchor="right"
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      PaperProps={{ sx: { width: { xs: '100%', sm: 380 }, background: T.surface, border: `none` } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: T.text, fontFamily: '"Manrope",sans-serif' }}>
            Your Cart
          </Typography>
          <IconButton size="small" onClick={() => setCartOpen(false)} sx={{ color: T.textSub }}>
            <Close />
          </IconButton>
        </Box>

        {/* Items */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {cart.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ShoppingBag sx={{ fontSize: 52, color: T.textMuted, mb: 2 }} />
              <Typography sx={{ color: T.textSub, fontWeight: 600, mb: 0.5 }}>Cart is empty</Typography>
              <Typography sx={{ color: T.textMuted, fontSize: '0.8rem' }}>Add items from the menu</Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {cart.map(item => (
                <Box key={item.menuItemId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, background: T.surfaceAlt, borderRadius: '12px', border: `1px solid ${T.border}` }}>
                  {item.image && <Box component="img" src={item.image} sx={{ width: 52, height: 52, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: T.text, mb: 0.2 }}>{item.name}</Typography>
                    <Typography sx={{ color: T.accent, fontWeight: 800, fontSize: '0.9rem' }}>₹{(item.price * item.quantity).toFixed(0)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} sx={{ color: T.textSub, width: 26, height: 26, '&:hover': { color: T.accent } }}>
                      <Remove sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: T.text, minWidth: 18, textAlign: 'center' }}>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} sx={{ color: T.textSub, width: 26, height: 26, '&:hover': { color: T.accent } }}>
                      <Add sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Footer */}
        {cart.length > 0 && (
          <Box sx={{ p: 2.5, borderTop: `1px solid ${T.border}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ color: T.textSub, fontSize: '0.88rem' }}>Total</Typography>
              <Typography sx={{ fontWeight: 800, color: T.accent, fontSize: '1.1rem' }}>₹{cartTotal.toFixed(0)}</Typography>
            </Box>
            <Button fullWidth onClick={() => { setCartOpen(false); navigate(`/checkout/${slug}`); }}
              sx={{
                py: 1.4, borderRadius: '12px', fontWeight: 700, textTransform: 'none', fontSize: '0.95rem',
                background: T.cartBg, color: '#fff', boxShadow: T.cartGlow,
                '&:hover': { opacity: 0.92 },
              }}>
              Proceed to Checkout →
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );

  /* ─── Skeletons ─── */
  const ItemSkeleton = () => (
    <Box sx={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: isMobile ? 'row' : 'column' }}>
      <Skeleton variant="rectangular" width={isMobile ? 110 : '100%'} height={isMobile ? 110 : 160} sx={{ bgcolor: T.surfaceAlt, flexShrink: 0 }} />
      <Box sx={{ p: 2, flex: 1 }}>
        <Skeleton width="60%" height={22} sx={{ bgcolor: T.surfaceAlt, mb: 1, borderRadius: 1 }} />
        <Skeleton width="85%" height={16} sx={{ bgcolor: T.surfaceAlt, borderRadius: 1 }} />
        <Skeleton width="40%" height={28} sx={{ bgcolor: T.surfaceAlt, mt: 1.5, borderRadius: 1 }} />
      </Box>
    </Box>
  );

  const currentItems = menu[activeCat]?.items || [];
  const displayItems = searchQuery.trim() ? searchResults : currentItems;

  return (
    <Box sx={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ─── TOP NAV BAR ─── */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 100,
        background: T.navBg, backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${T.border}`,
        px: { xs: 2, md: 4 }, py: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left: Back + Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton size="small" onClick={() => navigate(-1)} sx={{ color: T.textSub, '&:hover': { color: T.text } }}>
            <ArrowBack sx={{ fontSize: 20 }} />
          </IconButton>
          <Box>
            <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '1rem', color: T.text, lineHeight: 1.2 }}>
              {finalLoading ? <Skeleton width={120} sx={{ bgcolor: T.surfaceAlt }} /> : (restaurant?.name || 'CulinaryCanvas')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.68rem', color: T.textMuted }}>Scan · Order · Enjoy</Typography>
              {table && (
                <Chip label={`Table ${table}`} size="small"
                  sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, background: T.accentDim, color: T.accent }} />
              )}
              {isDemo && (
                <Chip label="DEMO" size="small"
                  sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, background: T.accentDim, color: T.accent }} />
              )}
            </Box>
          </Box>
        </Box>

        {/* Right: Search + Cart */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {searchOpen ? (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              background: T.surfaceAlt, borderRadius: '10px',
              border: `1px solid ${T.border}`, px: 1.5, py: 0.6,
            }}>
              <Search sx={{ fontSize: 16, color: T.textMuted }} />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search dishes…"
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: T.text, fontSize: '0.85rem', width: 160,
                  fontFamily: 'Inter, sans-serif',
                }}
              />
              <IconButton size="small" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} sx={{ color: T.textMuted, p: 0.3 }}>
                <Close sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ) : (
            <IconButton size="small" onClick={() => setSearchOpen(true)}
              sx={{ color: T.textSub, width: 36, height: 36, borderRadius: '10px', background: T.surfaceAlt, border: `1px solid ${T.border}`, '&:hover': { color: T.accent } }}>
              <Search sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => setCartOpen(true)}
            sx={{ color: T.textSub, width: 36, height: 36, borderRadius: '10px', background: T.surfaceAlt, border: `1px solid ${T.border}`, position: 'relative', '&:hover': { color: T.accent } }}>
            <Badge badgeContent={cartCount}
              sx={{ '& .MuiBadge-badge': { background: T.accent, color: '#fff', fontSize: '0.6rem', minWidth: 16, height: 16 } }}>
              <ShoppingBag sx={{ fontSize: 18 }} />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {/* ─── BODY: Sidebar + Content ─── */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* DESKTOP SIDEBAR — Category List */}
        {!isMobile && (
          <Box sx={{
            width: SIDEBAR_W, flexShrink: 0,
            borderRight: `1px solid ${T.border}`,
            background: T.surface,
            position: 'sticky', top: 56, height: 'calc(100vh - 56px)',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: T.border, borderRadius: 4 },
          }}>
            <Box sx={{ p: 2 }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: T.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', mb: 1.5, px: 1 }}>
                Categories
              </Typography>
              {finalLoading
                ? [1,2,3].map(i => <Skeleton key={i} height={40} sx={{ borderRadius: '10px', bgcolor: T.surfaceAlt, mb: 0.5 }} />)
                : menu.map((cat, i) => (
                  <Button key={cat._id} fullWidth onClick={() => setActiveCat(i)}
                    sx={{
                      justifyContent: 'space-between', px: 1.5, py: 1, borderRadius: '10px', mb: 0.5,
                      fontSize: '0.82rem', fontWeight: activeCat === i ? 700 : 500, textTransform: 'none',
                      color: activeCat === i ? '#fff' : T.textSub,
                      background: activeCat === i ? T.pillActive : 'transparent',
                      boxShadow: activeCat === i ? '0 4px 14px rgba(124,110,240,0.3)' : 'none',
                      '&:hover': {
                        background: activeCat === i ? T.pillActive : T.accentDim,
                        color: activeCat === i ? '#fff' : T.text,
                      },
                      transition: 'all 0.18s ease',
                    }}>
                    <span>{cat.name}</span>
                    <Chip label={cat.items?.length || 0} size="small"
                      sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, pointerEvents: 'none',
                        background: activeCat === i ? 'rgba(255,255,255,0.2)' : T.surfaceAlt,
                        color: activeCat === i ? '#fff' : T.textMuted,
                      }} />
                  </Button>
                ))
              }
            </Box>
          </Box>
        )}

        {/* MAIN CONTENT AREA */}
        <Box sx={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>

          {/* MOBILE: Horizontal scrollable category pills */}
          {isMobile && (
            <Box sx={{
              position: 'sticky', top: 53, zIndex: 50,
              background: T.navBg, backdropFilter: 'blur(20px)',
              borderBottom: `1px solid ${T.border}`,
              px: 2, py: 1.5,
              display: 'flex', gap: 1, overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}>
              {finalLoading
                ? [1,2,3].map(i => <Skeleton key={i} width={80} height={32} sx={{ borderRadius: '99px', bgcolor: T.surfaceAlt, flexShrink: 0 }} />)
                : menu.map((cat, i) => (
                  <Box key={cat._id} onClick={() => setActiveCat(i)} sx={{
                    flexShrink: 0, px: 2, py: 0.7, borderRadius: '99px',
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: activeCat === i ? 700 : 500,
                    background: activeCat === i ? T.pillActive : T.pillInactive,
                    color: activeCat === i ? T.pillActiveTxt : T.pillInactiveTxt,
                    border: activeCat === i ? 'none' : `1px solid ${T.border}`,
                    boxShadow: activeCat === i ? '0 4px 12px rgba(124,110,240,0.3)' : 'none',
                    transition: 'all 0.18s ease',
                    whiteSpace: 'nowrap',
                  }}>
                    {cat.name}
                  </Box>
                ))
              }
            </Box>
          )}

          {/* Content padding box */}
          <Box sx={{ p: { xs: 2, md: 3 } }}>

            {/* Section title */}
            {!searchQuery.trim() && (
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '1.2rem', color: T.text }}>
                  {finalLoading ? <Skeleton width={140} sx={{ bgcolor: T.surfaceAlt }} /> : menu[activeCat]?.name}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, mt: 0.3 }}>
                  {finalLoading ? '' : `${currentItems.length} item${currentItems.length !== 1 ? 's' : ''}`}
                </Typography>
              </Box>
            )}

            {/* Search results header */}
            {searchQuery.trim() && (
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: T.text }}>
                  {searchResults.length === 0 ? 'No results' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`} for "{searchQuery}"
                </Typography>
              </Box>
            )}

            {/* Items Grid */}
            {finalLoading ? (
              <Grid container spacing={2}>
                {[1,2,3,4,5,6].map(i => (
                  <Grid item xs={12} sm={6} lg={4} key={i}><ItemSkeleton /></Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {displayItems.map(item => (
                  <Grid item xs={12} sm={6} lg={4} key={item._id}>
                    <ItemCard item={item} catName={searchQuery.trim() ? item.catName : undefined} />
                  </Grid>
                ))}
                {searchQuery.trim() && searchResults.length === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Search sx={{ fontSize: 48, color: T.textMuted, mb: 1 }} />
                      <Typography sx={{ color: T.textSub, fontWeight: 600 }}>No dishes found</Typography>
                      <Typography sx={{ color: T.textMuted, fontSize: '0.82rem', mt: 0.5 }}>Try a different search term</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>

      {/* ─── STICKY BOTTOM CHECKOUT BAR (only shows when cart has items) ─── */}
      {cartCount > 0 && (
        <Box sx={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          background: T.navBg, backdropFilter: 'blur(24px)',
          borderTop: `1px solid ${T.border}`,
          px: { xs: 2, md: 4 }, py: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 2,
        }}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: T.textMuted }}>{cartCount} item{cartCount > 1 ? 's' : ''} in cart</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: T.text }}>₹{cartTotal.toFixed(0)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button onClick={() => setCartOpen(true)}
              sx={{
                textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', borderRadius: '10px',
                px: 2, py: 0.9, border: `1px solid ${T.border}`, color: T.textSub,
                '&:hover': { background: T.accentDim, color: T.accent },
              }}>
              View Cart
            </Button>
            <Button onClick={() => navigate(`/checkout/${slug}`)}
              sx={{
                textTransform: 'none', fontWeight: 700, fontSize: '0.88rem', borderRadius: '10px',
                px: 2.5, py: 0.9, background: T.cartBg, color: '#fff', boxShadow: T.cartGlow,
                '&:hover': { opacity: 0.9 },
              }}>
              Checkout →
            </Button>
          </Box>
        </Box>
      )}

      {/* Cart Drawer */}
      <CartDrawer />
    </Box>
  );
};

export default PublicMenu;
