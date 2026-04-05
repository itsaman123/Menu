import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Box, Container, Typography, Divider, TextField, Button,
  CircularProgress, Stepper, Step, StepLabel, Stack, IconButton
} from '@mui/material';
import { ArrowBackIosNew, PhoneAndroid, Verified, ShoppingBag } from '@mui/icons-material';
import useCart from '../hooks/useCart';
import api from '../api';

const T = {
  bg: '#0f1117', surface: '#16191f', surfaceAlt: '#1d2129',
  border: 'rgba(255,255,255,0.07)', accent: '#7c6ef0',
  accentDim: 'rgba(124,110,240,0.12)', accentHov: '#9d91f7',
  green: '#22c55e', greenDim: 'rgba(34,197,94,0.12)',
  text: '#e8eaf0', textSub: '#8b8fa8', textMuted: '#4b5068',
  red: '#ef4444', redDim: 'rgba(239,68,68,0.12)',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: T.text, borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.accent },
    '&.Mui-focused fieldset': { borderColor: T.accent, borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { color: T.textSub, fontSize: '0.88rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: T.accent },
  '& input::placeholder': { color: T.textMuted },
};

const sxCard = {
  background: T.surface, border: `1px solid ${T.border}`,
  borderRadius: '16px', p: 3,
};

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
    onError: (err) => setError(err.response?.data?.message || 'Failed to send OTP'),
  });

  const placeOrderMutation = useMutation({
    mutationFn: (token) => api.post('/api/orders/create',
      { restaurantSlug: slug, items: cart, tableNumber },
      { headers: { Authorization: `Bearer ${token}` } }
    ),
    onSuccess: (res) => { clearCart(); navigate(`/order-success/${res.data._id}`); },
    onError: (err) => setError(err.response?.data?.message || 'Failed to place order'),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data) => api.post('/api/otp/verify-otp', data),
    onSuccess: (res) => {
      localStorage.setItem('customerToken', res.data.orderToken);
      placeOrderMutation.mutate(res.data.orderToken);
    },
    onError: (err) => setError(err.response?.data?.message || 'Invalid OTP'),
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
      <Box sx={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, p: 3 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: '20px', background: T.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag sx={{ fontSize: 36, color: T.accent }} />
        </Box>
        <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '1.1rem' }}>Your cart is empty</Typography>
        <Typography sx={{ color: T.textSub, fontSize: '0.85rem' }}>Add some items to your cart first</Typography>
        <Button onClick={() => navigate(`/menu/${slug}`)} sx={{
          mt: 1, px: 3, py: 1, borderRadius: '11px', textTransform: 'none', fontWeight: 700,
          background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`, color: '#fff',
          '&:hover': { background: `linear-gradient(135deg, ${T.accentHov}, #b4a8fc)` },
        }}>
          Explore Menu
        </Button>
      </Box>
    );
  }

  const grandTotal = cartTotal * 1.05;

  return (
    <Box sx={{ background: T.bg, minHeight: '100vh' }} className="page-enter">
      <Container maxWidth="sm" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: T.textSub, '&:hover': { color: T.text, background: T.accentDim } }}>
              <ArrowBackIosNew sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography sx={{ fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: '1.2rem', color: T.text }}>
              Checkout{isDemo && <Box component="span" sx={{ ml: 1.5, px: 1.2, py: 0.3, borderRadius: '7px', background: T.accentDim, color: T.accent, fontSize: '0.65rem', fontWeight: 800, verticalAlign: 'middle' }}>DEMO</Box>}
            </Typography>
          </Box>
          {tableNumber && (
            <Box sx={{ px: 1.5, py: 0.5, borderRadius: '9px', background: T.accentDim, border: `1px solid rgba(124,110,240,0.3)` }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: T.accent }}>Table {tableNumber}</Typography>
            </Box>
          )}
        </Box>

        {/* Order Summary Card */}
        <Box sx={{ ...sxCard, mb: 2 }}>
          <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.95rem', mb: 2 }}>Order Summary</Typography>
          <Stack spacing={0} divider={<Divider sx={{ borderColor: T.border }} />}>
            {cart.map((item) => (
              <Box key={item.menuItemId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: T.text, fontSize: '0.88rem' }}>{item.name}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: T.textMuted }}>× {item.quantity}</Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, color: T.textSub, fontSize: '0.88rem' }}>₹{(item.price * item.quantity).toFixed(0)}</Typography>
              </Box>
            ))}
          </Stack>

          {/* Totals */}
          <Box sx={{ mt: 2, p: 2, background: T.surfaceAlt, borderRadius: '12px', border: `1px solid ${T.border}` }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.82rem', color: T.textSub }}>Subtotal</Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: T.text }}>₹{cartTotal.toFixed(0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.82rem', color: T.textSub }}>GST (5%)</Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: T.text }}>₹{(cartTotal * 0.05).toFixed(0)}</Typography>
              </Box>
              <Divider sx={{ borderColor: T.border }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9rem' }}>Grand Total</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: T.accent }}>₹{grandTotal.toFixed(0)}</Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* OTP Flow Card */}
        <Box sx={{ ...sxCard }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3,
            '& .MuiStepLabel-label': { color: T.textMuted, fontSize: '0.78rem', fontWeight: 600 },
            '& .MuiStepLabel-label.Mui-active': { color: T.accent },
            '& .MuiStepLabel-label.Mui-completed': { color: T.green },
            '& .MuiStepIcon-root': { color: T.surfaceAlt },
            '& .MuiStepIcon-root.Mui-active': { color: T.accent },
            '& .MuiStepIcon-root.Mui-completed': { color: T.green },
            '& .MuiStepConnector-line': { borderColor: T.border },
          }}>
            <Step><StepLabel>Phone</StepLabel></Step>
            <Step><StepLabel>Verify</StepLabel></Step>
          </Stepper>

          {error && (
            <Box sx={{ mb: 2.5, p: 1.5, borderRadius: '10px', background: T.redDim, border: `1px solid rgba(239,68,68,0.2)` }}>
              <Typography sx={{ color: T.red, fontSize: '0.8rem', fontWeight: 600 }}>{error}</Typography>
            </Box>
          )}

          {activeStep === 0 ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '9px', background: T.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneAndroid sx={{ fontSize: 17, color: T.accent }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.95rem' }}>Mobile Verification</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: T.textSub, mb: 2.5, pl: '44px' }}>
                Enter your number to receive a secure OTP.
              </Typography>
              <TextField fullWidth placeholder="+91 98765 43210" value={phone}
                onChange={(e) => setPhone(e.target.value)} sx={{ ...inputSx, mb: 2.5 }} />
              <Button fullWidth onClick={handleSendOTP} disabled={sendOtpMutation.isPending}
                sx={{
                  py: 1.4, borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                  background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`, color: '#fff',
                  boxShadow: '0 4px 20px rgba(124,110,240,0.4)',
                  '&:hover': { background: `linear-gradient(135deg, ${T.accentHov}, #b4a8fc)` },
                  '&:disabled': { opacity: 0.6, color: '#fff' },
                }}>
                {sendOtpMutation.isPending ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Send OTP'}
              </Button>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '9px', background: T.greenDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Verified sx={{ fontSize: 17, color: T.green }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.95rem' }}>OTP Sent!</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: T.textSub, mb: 2.5, pl: '44px' }}>
                Enter the 4-digit code sent to <strong style={{ color: T.text }}>{phone}</strong>
              </Typography>
              <TextField fullWidth label="OTP Code" placeholder="0000" value={otp}
                onChange={(e) => setOtp(e.target.value)} sx={{ ...inputSx, mb: 2.5 }} />
              <Button fullWidth onClick={handleVerifyOTP}
                disabled={verifyOtpMutation.isPending || placeOrderMutation.isPending}
                sx={{
                  py: 1.4, borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                  background: `linear-gradient(135deg, ${T.accent}, #a78bfa)`, color: '#fff',
                  boxShadow: '0 4px 20px rgba(124,110,240,0.4)',
                  '&:hover': { background: `linear-gradient(135deg, ${T.accentHov}, #b4a8fc)` },
                  '&:disabled': { opacity: 0.6, color: '#fff' },
                }}>
                {verifyOtpMutation.isPending || placeOrderMutation.isPending
                  ? <CircularProgress size={22} sx={{ color: '#fff' }} />
                  : 'Verify & Place Order'}
              </Button>
              <Button fullWidth onClick={() => setActiveStep(0)}
                sx={{ mt: 1.5, textTransform: 'none', color: T.textSub, '&:hover': { color: T.text } }}>
                ← Change Phone Number
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Checkout;
