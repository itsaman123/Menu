import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Container, Typography, Paper, Divider, Button,
  CircularProgress, Alert, List, ListItem, ListItemText,
  Card, CardContent, Stack
} from '@mui/material';
import { CheckCircle, Timer, Restaurant as RestaurantIcon, Search, ShoppingBag, History } from '@mui/icons-material';
import api from '../api';
import { DEMO_ORDER } from '../demoData';

const OrderSuccess = () => {
  const { id } = useParams();
  const isDemo = id === 'demo_order_id';
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => (await api.get(`/api/orders/${id}`)).data,
    refetchInterval: 5000,
    retry: 2,
    enabled: !isDemo
  });

  const order = isDemo ? DEMO_ORDER : data;
  const finalLoading = isDemo ? false : isLoading;

  useEffect(() => {
    if (order?.createdAt) {
      const orderDate = new Date(order.createdAt).getTime();
      const prepTime = 15 * 60 * 1000;
      const endTime = orderDate + prepTime;

      const interval = setInterval(() => {
        const diff = endTime - Date.now();
        setTimeLeft(diff <= 0 ? 0 : diff);
        if (diff <= 0) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [order]);

  const formatTime = (ms) => {
    if (ms === null) return '--:--';
    if (ms === 0) return 'Ready!';
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Received', icon: '🧾' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'completed', label: 'Ready', icon: '🎉' },
  ];
  const currentStep = order ? statusSteps.findIndex(s => s.key === order.status) : 0;

  if (finalLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isDemo && (error || !order)) {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="error">Order not found. Please contact the restaurant.</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'var(--cc-surface-container-low)', minHeight: '100vh', pb: 14 }} className="page-enter">
      {/* Success Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #5341cd, #6C5CE7)',
        color: 'white', pt: 6, pb: 5, px: 3, textAlign: 'center',
        borderBottomLeftRadius: 'var(--radius-2xl)', borderBottomRightRadius: 'var(--radius-2xl)',
      }}>
        <Typography sx={{ fontSize: '3rem', mb: 1 }}>🎉</Typography>
        <Typography variant="h4" fontWeight="800" gutterBottom>Order Placed Successfully</Typography>
        <Typography variant="body1" sx={{ opacity: 0.85 }}>
          Order ID: <strong>#{isDemo ? 'CC-DEMO' : id.slice(-6).toUpperCase()}</strong>
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ mt: -3 }}>
        {/* Timer */}
        <Paper elevation={0} sx={{ p: 4, mb: 3, textAlign: 'center', bgcolor: 'var(--cc-surface-container-lowest)', boxShadow: 'var(--shadow-card)' }}>
          <Typography variant="body2" sx={{ color: 'var(--cc-on-surface-variant)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, mb: 1 }}>
            Estimated ready in
          </Typography>
          <Typography variant="h2" fontWeight="800" color="primary" sx={{ fontFamily: '"Manrope"', letterSpacing: -1 }}>
            {formatTime(timeLeft)}
          </Typography>
        </Paper>

        {/* Status Timeline */}
        <Paper elevation={0} sx={{ p: 4, mb: 3, bgcolor: 'var(--cc-surface-container-lowest)', boxShadow: 'var(--shadow-card)' }}>
          <Stack spacing={0}>
            {statusSteps.map((step, i) => (
              <Box key={step.key} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
                {/* Vertical line */}
                {i < statusSteps.length - 1 && (
                  <Box sx={{
                    position: 'absolute', left: 15, top: 36, width: 2, height: 'calc(100% - 16px)',
                    bgcolor: i < currentStep ? 'var(--cc-primary)' : 'var(--cc-surface-container-high)',
                  }} />
                )}
                {/* Dot */}
                <Box sx={{
                  width: 32, height: 32, minWidth: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: i <= currentStep ? 'var(--cc-primary)' : 'var(--cc-surface-container-high)',
                  color: i <= currentStep ? 'white' : 'var(--cc-on-surface-variant)',
                  fontSize: '0.9rem', fontWeight: 'bold', zIndex: 1,
                }}>
                  {i <= currentStep ? step.icon : (i + 1)}
                </Box>
                {/* Label */}
                <Box sx={{ pb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={i <= currentStep ? 700 : 400}
                    sx={{ color: i <= currentStep ? 'var(--cc-on-surface)' : 'var(--cc-on-surface-variant)' }}>
                    {step.label}
                  </Typography>
                  {i === currentStep && (
                    <Typography variant="caption" sx={{ color: 'var(--cc-primary)' }}>
                      {step.key === 'preparing' ? 'Chef is adding the magic' : 'In progress...'}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Order Summary */}
        <Paper elevation={0} sx={{ p: 4, mb: 3, bgcolor: 'var(--cc-surface-container-lowest)', boxShadow: 'var(--shadow-card)' }}>
          <Typography variant="h6" fontWeight="700" gutterBottom>Order Summary</Typography>
          <List disablePadding>
            {order.items.map((item, idx) => (
              <ListItem key={idx} sx={{ py: 1.5, px: 0 }}>
                <ListItemText
                  primary={<Typography fontWeight="600">{item.name}</Typography>}
                  secondary={`${item.quantity}×`}
                />
                <Typography variant="body1" fontWeight="600">₹{(item.price * item.quantity).toFixed(0)}</Typography>
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 2, pt: 2, bgcolor: 'var(--cc-surface-container-low)', borderRadius: 'var(--radius-md)', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="700">Total (inc. GST)</Typography>
            <Typography variant="h5" color="primary" fontWeight="800">₹{order.totalAmount.toFixed(0)}</Typography>
          </Box>
        </Paper>
      </Container>

      {/* Bottom Dock Navigation */}
      <Box sx={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: 420,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        py: 1.5, px: 2.5, borderRadius: 'var(--radius-2xl)',
        bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(40px)',
        boxShadow: 'var(--shadow-ambient)', zIndex: 100,
      }}>
        <Stack alignItems="center" sx={{ cursor: 'pointer', color: 'var(--cc-on-surface-variant)' }}
          onClick={() => navigate(`/menu/${order?.restaurantId?.slug || 'demo'}`)}>
          <RestaurantIcon fontSize="small" />
          <Typography variant="caption">Menu</Typography>
        </Stack>
        <Stack alignItems="center" sx={{ cursor: 'pointer', color: 'var(--cc-on-surface-variant)' }}>
          <Search fontSize="small" />
          <Typography variant="caption">Search</Typography>
        </Stack>
        <Stack alignItems="center" sx={{ cursor: 'pointer', color: 'var(--cc-on-surface-variant)' }}>
          <ShoppingBag fontSize="small" />
          <Typography variant="caption">Cart</Typography>
        </Stack>
        <Stack alignItems="center" sx={{ cursor: 'pointer', color: 'var(--cc-primary)' }}>
          <History fontSize="small" />
          <Typography variant="caption" fontWeight="600">Orders</Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default OrderSuccess;
