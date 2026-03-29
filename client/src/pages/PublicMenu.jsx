import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, Container, Typography, Tabs, Tab, Card, CardContent, CardMedia, 
  CircularProgress, Alert, AppBar, useTheme, Button, IconButton, Badge, Fab, Skeleton, Stack
} from '@mui/material';
import { Add, Remove, ShoppingCart } from '@mui/icons-material';
import api from '../api';
import useCart from '../hooks/useCart';
import { DEMO_RESTAURANT, DEMO_MENU } from '../demoData';

const PublicMenu = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const { cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  const { data, isLoading, error } = useQuery({
    queryKey: ['publicMenu', slug],
    queryFn: async () => (await api.get(`/public/menu/${slug}`)).data,
    retry: 1,
    enabled: slug !== 'demo' // Disable for demo mode (using dummy data)
  });

  const isDemo = slug === 'demo';
  const restaurant = isDemo ? DEMO_RESTAURANT : data?.restaurant;
  const menu = isDemo ? DEMO_MENU : data?.menu || [];
  const finalLoading = isDemo ? false : isLoading;

  const getItemQuantity = (itemId) => {
    return cart.find((i) => i.menuItemId === itemId)?.quantity || 0;
  };

  if (error) {
    return (
      <Container sx={{ mt: 4 }}><Alert severity="error" variant="filled">
          {error?.response?.data?.message || 'Error loading menu. Please check the URL or try again later.'}
        </Alert></Container>
    );
  }

  const renderSkeletons = () => (
    <Box sx={{ mt: 4 }}>
      {[1, 2, 3].map((i) => (
        <Card key={i} sx={{ display: 'flex', mb: 3, borderRadius: 4, height: 120 }}>
          <Box sx={{ flex: 1, p: 2 }}><Skeleton width="60%" height={30} /><Skeleton width="80%" /><Skeleton width="40%" height={30} /></Box>
          <Skeleton variant="rectangular" width={120} height={120} />
        </Card>
      ))}
    </Box>
  );

  if (menu.length === 0 && !finalLoading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">No menu items available yet.</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', pb: 12 }}>
      {/* Restaurant Header */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        pt: 6, pb: 4, 
        px: 3,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {isDemo && (
          <Box sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255,255,255,0.2)', px: 1, borderRadius: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>DEMO MODE</Typography>
          </Box>
        )}
        {finalLoading ? (
          <Container maxWidth="sm"><Skeleton variant="text" sx={{ fontSize: '3rem', bgcolor: 'rgba(255,255,255,0.1)' }} width="70%" /><Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} width="40%" /></Container>
        ) : (
          <Container maxWidth="sm">
            <Typography variant="h3" fontWeight="900" sx={{ mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{restaurant.name}</Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Scan, Order, Enjoy</Typography>
          </Container>
        )}
      </Box>

      <Container maxWidth="sm" sx={{ mt: -3 }}>
        {finalLoading ? (
          <Paper sx={{ top: 16, borderRadius: 4, p: 2 }}><Skeleton variant="rectangular" height={40} /></Paper>
        ) : (
          <AppBar position="sticky" sx={{ top: 16, bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', zIndex: 100 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, v) => setActiveTab(v)} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{ '& .MuiTabs-indicator': { height: 3, borderRadius: 3 }, '& .MuiTab-root': { fontWeight: 600, minHeight: 60 } }}
            >
              {menu.map((category) => <Tab key={category._id} label={category.name} />)}
            </Tabs>
          </AppBar>
        )}

        {finalLoading ? renderSkeletons() : (
          <Box sx={{ mt: 4 }}>
            {menu[activeTab]?.items.map((item) => (
              <Card key={item._id} sx={{ display: 'flex', mb: 2.5, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto', p: 2 }}>
                  <CardContent sx={{ p: 0, pb: '0 !important' }}>
                    <Typography component="div" variant="h6" fontWeight="700">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description || 'Deliciously crafted for you.'}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary.main" fontWeight="900">₹{parseFloat(item.price).toFixed(2)}</Typography>
                      {getItemQuantity(item._id) > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 2, px: 0.5 }}>
                          <IconButton size="small" onClick={() => updateQuantity(item._id, getItemQuantity(item._id) - 1)}><Remove fontSize="small" /></IconButton>
                          <Typography sx={{ mx: 1, fontWeight: 'bold' }}>{getItemQuantity(item._id)}</Typography>
                          <IconButton size="small" onClick={() => updateQuantity(item._id, getItemQuantity(item._id) + 1)}><Add fontSize="small" /></IconButton>
                        </Box>
                      ) : (
                        <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => addToCart(item)} sx={{ borderRadius: 2, fontWeight: 'bold' }}>Add</Button>
                      )}
                    </Box>
                  </CardContent>
                </Box>
                {item.image && <CardMedia component="img" sx={{ width: 110, height: 110, objectFit: 'cover' }} image={item.image} alt={item.name} />}
              </Card>
            ))}
          </Box>
        )}
      </Container>

      {cartCount > 0 && (
        <Box sx={{ position: 'fixed', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', px: 2 }}>
          <Fab 
            variant="extended" 
            color="primary" 
            sx={{ width: '100%', maxWidth: 'sm', height: 56, borderRadius: 3, boxShadow: '0 8px 16px rgba(255, 87, 34, 0.3)' }}
            onClick={() => navigate(`/checkout/${slug}`)}
          >
            <Badge badgeContent={cartCount} color="secondary" sx={{ mr: 2 }}><ShoppingCart /></Badge>
            View Cart • ₹{cartTotal.toFixed(2)}
          </Fab>
        </Box>
      )}
    </Box>
  );
};

export default PublicMenu;
