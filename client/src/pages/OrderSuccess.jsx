import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Container, Typography, Divider, Button,
  CircularProgress, Stack
} from '@mui/material';
import { Restaurant as RestaurantIcon, Search, ShoppingBag, History } from '@mui/icons-material';
import api from '../api';
import { DEMO_ORDER } from '../demoData';

const T = {
  bg: '#0f1117', surface: '#16191f', surfaceAlt: '#1d2129',
  border: 'rgba(255,255,255,0.07)', accent: '#7c6ef0',
  accentDim: 'rgba(124,110,240,0.12)',
  green: '#22c55e', greenDim: 'rgba(34,197,94,0.12)',
  orange: '#f97316', orangeDim: 'rgba(249,115,22,0.12)',
  text: '#e8eaf0', textSub: '#8b8fa8', textMuted: '#4b5068',
};

const sxCard = {
  background: T.surface, border: `1px solid ${T.border}`,
  borderRadius: '16px', p: 3,
};

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
    enabled: !isDemo,
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
    if (ms === 0) return 'Ready! 🎉';
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Received', icon: '🧾', color: T.orange, dim: T.orangeDim },
    { key: 'confirmed', label: 'Confirmed', icon: '✅', color: '#3b82f6', dim: 'rgba(59,130,246,0.12)' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', color: T.accent, dim: T.accentDim },
    { key: 'completed', label: 'Ready', icon: '🎉', color: T.green, dim: T.greenDim },
  ];
  const currentStep = order ? statusSteps.findIndex(s => s.key === order.status) : 0;

  if (finalLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: T.bg }}>
        <CircularProgress sx={{ color: T.accent }} />
      </Box>
    );
  }

  if (!isDemo && (error || !order)) {
    return (
      <Box sx={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Box sx={{ ...sxCard, textAlign: 'center', maxWidth: 400 }}>
          <Typography sx={{ color: T.text, fontWeight: 700, mb: 1 }}>Order not found</Typography>
          <Typography sx={{ color: T.textSub, fontSize: '0.85rem' }}>Please contact the restaurant staff.</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ background: T.bg, minHeight: '100vh', pb: 16 }} className="page-enter">
      {/* Success Header */}
      <Box sx={{
        background: 'linear-gradient(160deg, #1a1730 0%, #0f1117 100%)',
        borderBottom: `1px solid ${T.border}`,
        pt: { xs: 5, sm: 6 }, pb: 4, px: 3, textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', top: '-40%', left: '-10%',
          width: '60%', height: '200%',
          background: 'radial-gradient(ellipse, rgba(34,197,94,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}>
        <Typography sx={{ fontSize: '2.8rem', mb: 1 }}>🎉</Typography>
        <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: { xs: '1.4rem', sm: '1.8rem' }, color: T.text, mb: 0.5 }}>
          Order Placed Successfully!
        </Typography>
        <Typography sx={{ color: T.textSub, fontSize: '0.85rem' }}>
          Order ID:{' '}
          <Box component="span" sx={{ color: T.accent, fontWeight: 700, fontFamily: 'monospace' }}>
            #{isDemo ? 'CC-DEMO' : id.slice(-6).toUpperCase()}
          </Box>
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 3, pb: 2 }}>
        {/* Timer */}
        <Box sx={{ ...sxCard, textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
            Estimated Ready In
          </Typography>
          <Typography sx={{
            fontFamily: '"Manrope",sans-serif', fontWeight: 800,
            fontSize: timeLeft === 0 ? '1.8rem' : '3rem',
            color: timeLeft === 0 ? T.green : T.accent,
            letterSpacing: '-1px', lineHeight: 1,
          }}>
            {formatTime(timeLeft)}
          </Typography>
        </Box>

        {/* Status Timeline */}
        <Box sx={{ ...sxCard, mb: 2 }}>
          <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9rem', mb: 2.5 }}>Order Status</Typography>
          <Stack spacing={0}>
            {statusSteps.map((step, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              return (
                <Box key={step.key} sx={{ display: 'flex', gap: 2, position: 'relative', pb: i < statusSteps.length - 1 ? 3 : 0 }}>
                  {i < statusSteps.length - 1 && (
                    <Box sx={{
                      position: 'absolute', left: 15, top: 36, width: 2,
                      height: 'calc(100% - 12px)',
                      background: isDone ? T.accent : T.border,
                      borderRadius: 1,
                    }} />
                  )}
                  <Box sx={{
                    width: 32, height: 32, minWidth: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: (isDone || isActive) ? step.dim : T.surfaceAlt,
                    border: `2px solid ${(isDone || isActive) ? step.color : T.border}`,
                    fontSize: '0.85rem', zIndex: 1,
                    boxShadow: isActive ? `0 0 12px ${step.color}40` : 'none',
                  }}>
                    {(isDone || isActive) ? step.icon : <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textMuted }}>{i + 1}</Typography>}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: isDone || isActive ? 700 : 500, fontSize: '0.88rem', color: isDone || isActive ? T.text : T.textMuted }}>
                      {step.label}
                    </Typography>
                    {isActive && (
                      <Typography sx={{ fontSize: '0.73rem', color: step.color, fontWeight: 600, mt: 0.2 }}>
                        {step.key === 'preparing' ? 'Chef is adding the magic ✨' : 'In progress…'}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* Order Summary */}
        <Box sx={{ ...sxCard }}>
          <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9rem', mb: 2 }}>Your Order</Typography>
          <Stack spacing={0} divider={<Divider sx={{ borderColor: T.border }} />}>
            {order.items.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: T.text, fontSize: '0.88rem' }}>{item.name}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: T.textMuted }}>× {item.quantity}</Typography>
                </Box>
                <Typography sx={{ fontWeight: 600, color: T.textSub, fontSize: '0.88rem' }}>₹{(item.price * item.quantity).toFixed(0)}</Typography>
              </Box>
            ))}
          </Stack>
          <Box sx={{ mt: 2, p: 2, background: T.surfaceAlt, borderRadius: '12px', border: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9rem' }}>Total (incl. GST)</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: T.accent }}>₹{order.totalAmount.toFixed(0)}</Typography>
          </Box>
        </Box>
      </Container>

      {/* Bottom Nav Dock */}
      <Box sx={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: 420,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        py: 1.5, px: 2.5, borderRadius: '20px',
        background: 'rgba(22,25,31,0.92)', backdropFilter: 'blur(40px)',
        border: `1px solid ${T.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 100,
      }}>
        {[
          { icon: <RestaurantIcon sx={{ fontSize: 20 }} />, label: 'Menu', action: () => navigate(`/menu/${order?.restaurantId?.slug || 'demo'}`) },
          { icon: <Search sx={{ fontSize: 20 }} />, label: 'Search', action: () => {} },
          { icon: <ShoppingBag sx={{ fontSize: 20 }} />, label: 'Cart', action: () => {} },
          { icon: <History sx={{ fontSize: 20 }} />, label: 'Orders', active: true, action: () => {} },
        ].map((item) => (
          <Stack key={item.label} alignItems="center" onClick={item.action}
            sx={{ cursor: 'pointer', color: item.active ? T.accent : T.textSub, gap: 0.3, '&:hover': { color: T.text } }}>
            {item.icon}
            <Typography sx={{ fontSize: '0.65rem', fontWeight: item.active ? 700 : 400 }}>{item.label}</Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
};

export default OrderSuccess;
