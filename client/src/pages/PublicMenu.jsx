import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Container, Typography, Tabs, Tab, Card, CardContent, CardMedia,
  Alert, Button, IconButton, Badge, Fab, Skeleton, Stack
} from '@mui/material';
import { Add, Remove, ShoppingBag, Restaurant as RestaurantIcon, Search } from '@mui/icons-material';
import api from '../api';
import useCart from '../hooks/useCart';
import { DEMO_RESTAURANT, DEMO_MENU } from '../demoData';

const PublicMenu = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const table = searchParams.get('table');

  useEffect(() => {
    if (table) {
      sessionStorage.setItem(`table-${slug}`, table);
    }
  }, [table, slug]);

  const [activeTab, setActiveTab] = useState(0);
  const { cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  const { data, isLoading, error } = useQuery({
    queryKey: ['publicMenu', slug],
    queryFn: async () => (await api.get(`/public/menu/${slug}`)).data,
    retry: 1,
    enabled: slug !== 'demo'
  });

  const isDemo = slug === 'demo';
  const restaurant = isDemo ? DEMO_RESTAURANT : data?.restaurant;
  const menu = isDemo ? DEMO_MENU : data?.menu || [];
  const finalLoading = isDemo ? false : isLoading;

  const getItemQuantity = (itemId) => cart.find((i) => i.menuItemId === itemId)?.quantity || 0;

  if (error && !isDemo) {
    return (
      <Container sx={{ mt: 4 }}><Alert severity="error" variant="filled">
        {error?.response?.data?.message || 'Error loading menu. Please check the URL.'}
      </Alert></Container>
    );
  }

  const renderSkeletons = () => (
    <Stack spacing={2} sx={{ mt: 3 }}>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, bgcolor: 'var(--cc-surface-container-lowest)', borderRadius: 'var(--radius-xl)', p: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton width="55%" height={28} />
            <Skeleton width="80%" />
            <Skeleton width="30%" height={28} sx={{ mt: 1 }} />
          </Box>
          <Skeleton variant="rounded" width={100} height={100} sx={{ borderRadius: 'var(--radius-lg)' }} />
        </Box>
      ))}
    </Stack>
  );

  if (menu.length === 0 && !finalLoading) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <RestaurantIcon sx={{ fontSize: 80, color: 'var(--cc-outline-variant)', mb: 2 }} />
        <Typography variant="h5" color="text.secondary">No menu items available yet.</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'var(--cc-surface-container-low)', minHeight: '100vh', pb: 14 }} className="page-enter">
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #5341cd, #6C5CE7)',
        color: 'white', pt: 6, pb: 5, px: 3,
        borderBottomLeftRadius: 'var(--radius-2xl)', borderBottomRightRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-glow)', position: 'relative',
      }}>
        {isDemo && (
          <Box sx={{ position: 'absolute', top: 12, right: 16, bgcolor: 'rgba(255,255,255,0.15)', px: 1.5, py: 0.5, borderRadius: 'var(--radius-full)' }}>
            <Typography variant="caption" fontWeight="bold">DEMO</Typography>
          </Box>
        )}
        <Container maxWidth="sm">
          {finalLoading
            ? <><Skeleton variant="text" sx={{ fontSize: '2.5rem', bgcolor: 'rgba(255,255,255,0.15)' }} width="70%" /><Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} width="40%" /></>
            : <>
                <Typography variant="h3" fontWeight="800" sx={{ mb: 0.5 }}>{restaurant?.name || 'CulinaryCanvas'}</Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.85 }}>Scan, Order, Enjoy</Typography>
              </>
          }
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: -2.5 }}>
        {/* Category Tabs — Glassmorphism */}
        {finalLoading ? (
          <Skeleton variant="rounded" height={52} sx={{ borderRadius: 'var(--radius-xl)' }} />
        ) : (
          <Box className="glass" sx={{ position: 'sticky', top: 8, zIndex: 50, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' }}>
            <Tabs
              value={activeTab} onChange={(e, v) => setActiveTab(v)}
              variant="scrollable" scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': { height: 3, borderRadius: 3, bgcolor: 'var(--cc-primary)' },
                '& .MuiTab-root': { fontWeight: 600, minHeight: 52, color: 'var(--cc-on-surface-variant)', '&.Mui-selected': { color: 'var(--cc-primary)' } },
              }}
            >
              {menu.map((cat) => <Tab key={cat._id} label={cat.name} />)}
            </Tabs>
          </Box>
        )}

        {/* Menu Items */}
        {finalLoading ? renderSkeletons() : (
          <Stack spacing={2} sx={{ mt: 3 }}>
            {menu[activeTab]?.items.map((item) => (
              <Card key={item._id} elevation={0} sx={{
                display: 'flex', overflow: 'hidden',
                bgcolor: 'var(--cc-surface-container-lowest)',
                transition: 'transform 0.15s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-ambient)' }
              }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto', p: 2.5 }}>
                  <CardContent sx={{ p: 0, pb: '0 !important' }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>{item.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--cc-on-surface-variant)', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description || 'Crafted with care by our chef.'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary" fontWeight="800">₹{parseFloat(item.price).toFixed(0)}</Typography>
                      {getItemQuantity(item._id) > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'var(--cc-surface-container)', borderRadius: 'var(--radius-md)', px: 0.5 }}>
                          <IconButton size="small" onClick={() => updateQuantity(item._id, getItemQuantity(item._id) - 1)}><Remove fontSize="small" /></IconButton>
                          <Typography sx={{ mx: 1, fontWeight: 'bold', minWidth: 16, textAlign: 'center' }}>{getItemQuantity(item._id)}</Typography>
                          <IconButton size="small" onClick={() => updateQuantity(item._id, getItemQuantity(item._id) + 1)}><Add fontSize="small" /></IconButton>
                        </Box>
                      ) : (
                        <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => addToCart(item)}
                          sx={{ borderRadius: 'var(--radius-md)', fontWeight: 'bold', borderColor: 'var(--cc-primary)', color: 'var(--cc-primary)' }}>
                          Add
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Box>
                {item.image && (
                  <CardMedia component="img" sx={{ width: 110, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-lg)', m: 1.5 }} image={item.image} alt={item.name} />
                )}
              </Card>
            ))}
          </Stack>
        )}
      </Container>

      {/* Bottom Nav Dock (Floating Glassmorphism) — Matching Stitch Customer Menu */}
      <Box sx={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: 420,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        py: 1.5, px: 2.5, borderRadius: 'var(--radius-2xl)',
        bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(40px)',
        boxShadow: 'var(--shadow-ambient)', zIndex: 100,
      }}>
        <Stack alignItems="center" sx={{ cursor: 'pointer', color: 'var(--cc-primary)' }}>
          <RestaurantIcon fontSize="small" />
          <Typography variant="caption" fontWeight="600">Menu</Typography>
        </Stack>
        <Stack alignItems="center" sx={{ cursor: 'pointer', color: 'var(--cc-on-surface-variant)' }}>
          <Search fontSize="small" />
          <Typography variant="caption">Search</Typography>
        </Stack>
        <Stack alignItems="center" sx={{ cursor: 'pointer', position: 'relative', color: cartCount > 0 ? 'var(--cc-primary)' : 'var(--cc-on-surface-variant)' }}
          onClick={() => cartCount > 0 && navigate(`/checkout/${slug}`)}>
          <Badge badgeContent={cartCount} color="primary"><ShoppingBag fontSize="small" /></Badge>
          <Typography variant="caption" fontWeight={cartCount > 0 ? 600 : 400}>Cart</Typography>
        </Stack>
      </Box>

      {/* Sticky Cart Summary Bar */}
      {cartCount > 0 && (
        <Box sx={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)', maxWidth: 420,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          py: 1.5, px: 3, borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, #5341cd, #6C5CE7)',
          color: 'white', boxShadow: 'var(--shadow-glow)', zIndex: 99,
          cursor: 'pointer',
        }} onClick={() => navigate(`/checkout/${slug}`)}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>{cartCount} item{cartCount > 1 ? 's' : ''} added</Typography>
            <Typography variant="h6" fontWeight="800">₹{cartTotal.toFixed(0)}</Typography>
          </Box>
          <Button variant="text" sx={{ color: 'white', fontWeight: 'bold' }} endIcon={<ShoppingBag />}>View Cart</Button>
        </Box>
      )}
    </Box>
  );
};

export default PublicMenu;
