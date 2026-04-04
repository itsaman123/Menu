import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Box, Container, Typography, Paper, Divider, TextField, Button,
  CircularProgress, Alert, Stepper, Step, StepLabel, List, ListItem, ListItemText,
  IconButton, Stack
} from '@mui/material';
import { ArrowBackIosNew, Verified, PhoneAndroid, ShoppingBag } from '@mui/icons-material';
import useCart from '../hooks/useCart';
import api from '../api';

const Checkout = () => {
  const { slug } = useParams();
  const isDemo = slug === 'demo';
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const tableNumber = sessionStorage.getItem(`table-${slug}`);
  const [activeStep, setActiveStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const sendOtpMutation = useMutation({
    mutationFn: (phoneNum) => api.post('/api/otp/send-otp', { phone: phoneNum }),
    onSuccess: () => setActiveStep(1),
    onError: (err) => setError(err.response?.data?.message || 'Failed to send OTP')
  });

  const placeOrderMutation = useMutation({
    mutationFn: (token) => api.post('/api/orders/create',
      { restaurantSlug: slug, items: cart, tableNumber },
      { headers: { Authorization: `Bearer ${token}` } }
    ),
    onSuccess: (res) => {
      clearCart();
      navigate(`/order-success/${res.data._id}`);
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to place order')
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data) => api.post('/api/otp/verify-otp', data),
    onSuccess: (res) => {
      localStorage.setItem('customerToken', res.data.orderToken);
      placeOrderMutation.mutate(res.data.orderToken);
    },
    onError: (err) => setError(err.response?.data?.message || 'Invalid OTP')
  });

  const handleSendOTP = () => {
    if (!phone) return setError('Phone number is required');
    if (isDemo) { setActiveStep(1); return; }
    setError('');
    sendOtpMutation.mutate(phone);
  };

  const handleVerifyOTP = () => {
    if (!otp) return setError('OTP is required');
    if (isDemo) { clearCart(); navigate(`/order-success/demo_order_id`); return; }
    setError('');
    verifyOtpMutation.mutate({ phone, otp });
  };

  if (cart.length === 0) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <ShoppingBag sx={{ fontSize: 80, color: 'var(--cc-outline-variant)', mb: 2 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>Your cart is empty</Typography>
        <Button variant="contained" onClick={() => navigate(`/menu/${slug}`)} sx={{ mt: 2 }}>Explore Menu</Button>
      </Container>
    );
  }

  const grandTotal = cartTotal * 1.05;

  return (
    <Container maxWidth="sm" sx={{ py: 4, minHeight: '100vh' }} className="page-enter">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}><ArrowBackIosNew /></IconButton>
          <Typography variant="h5" fontWeight="800">Checkout {isDemo && <Typography component="span" variant="caption" sx={{ bgcolor: 'var(--cc-surface-container)', px: 1, py: 0.5, borderRadius: 'var(--radius-full)', ml: 1 }}>DEMO</Typography>}</Typography>
        </Box>
        {tableNumber && (
          <Typography variant="subtitle2" sx={{ bgcolor: 'var(--cc-primary)', color: 'white', px: 2, py: 0.5, borderRadius: 'var(--radius-full)' }}>
            Table: {tableNumber}
          </Typography>
        )}
      </Box>

      {/* Bill */}
      <Paper elevation={0} sx={{ p: 4, mb: 3, bgcolor: 'var(--cc-surface-container-lowest)', boxShadow: 'var(--shadow-card)' }}>
        <Typography variant="h6" fontWeight="700" gutterBottom>Order Summary</Typography>
        <List disablePadding>
          {cart.map((item) => (
            <ListItem key={item.menuItemId} sx={{ py: 1.5, px: 0 }}>
              <ListItemText
                primary={<Typography fontWeight="600">{item.name} × {item.quantity}</Typography>}
                secondary={<Typography variant="body2" color="text.secondary">₹{(item.price * item.quantity).toFixed(0)}</Typography>}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 2, pt: 2, bgcolor: 'var(--cc-surface-container-low)', borderRadius: 'var(--radius-md)', p: 2 }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Subtotal</Typography>
              <Typography variant="body2" fontWeight="600">₹{cartTotal.toFixed(0)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">GST (5%)</Typography>
              <Typography variant="body2" fontWeight="600">₹{(cartTotal * 0.05).toFixed(0)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight="800">Grand Total</Typography>
              <Typography variant="h5" color="primary" fontWeight="800">₹{grandTotal.toFixed(0)}</Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* OTP Flow */}
      <Paper elevation={0} sx={{ p: 4, bgcolor: 'var(--cc-surface-container-lowest)', boxShadow: 'var(--shadow-card)' }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          <Step><StepLabel>Phone</StepLabel></Step>
          <Step><StepLabel>Verify</StepLabel></Step>
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {activeStep === 0 ? (
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <PhoneAndroid sx={{ color: 'var(--cc-primary)' }} />
              <Typography variant="subtitle1" fontWeight="700">Mobile Verification</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Enter your number to receive a secure OTP.</Typography>
            <TextField fullWidth placeholder="e.g. +919876543210" value={phone} onChange={(e) => setPhone(e.target.value)} sx={{ mb: 3 }} />
            <Button fullWidth variant="contained" size="large" onClick={handleSendOTP} disabled={sendOtpMutation.isPending}
              sx={{ py: 1.8, fontSize: '0.95rem' }}>
              {sendOtpMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
            </Button>
          </Box>
        ) : (
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Verified sx={{ color: 'var(--cc-primary)' }} />
              <Typography variant="subtitle1" fontWeight="700">OTP Sent!</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Enter the 4-digit code sent to <strong>{phone}</strong></Typography>
            <TextField fullWidth placeholder="Enter OTP" label="OTP Code" value={otp} onChange={(e) => setOtp(e.target.value)} sx={{ mb: 3 }} />
            <Button fullWidth variant="contained" size="large" onClick={handleVerifyOTP} disabled={verifyOtpMutation.isPending || placeOrderMutation.isPending}
              sx={{ py: 1.8, fontSize: '0.95rem' }}>
              {verifyOtpMutation.isPending || placeOrderMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Verify & Place Order'}
            </Button>
            <Button fullWidth variant="text" sx={{ mt: 2, color: 'var(--cc-on-surface-variant)' }} onClick={() => setActiveStep(0)}>
              Change Phone Number
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Checkout;
