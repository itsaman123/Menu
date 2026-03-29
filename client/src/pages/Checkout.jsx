import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, Divider, TextField, Button, 
  CircularProgress, Alert, Stepper, Step, StepLabel, List, ListItem, ListItemText,
  IconButton
} from '@mui/material';
import { ArrowBackIosNew, Verified, PhoneAndroid } from '@mui/icons-material';
import useCart from '../hooks/useCart';
import api from '../api';

const Checkout = () => {
  const { slug } = useParams();
  const isDemo = slug === 'demo';
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!phone) return setError('Phone number is required');
    if (isDemo) {
      setActiveStep(1);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/otp/send-otp', { phone });
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return setError('OTP is required');
    if (isDemo) {
      clearCart();
      navigate(`/order-success/demo_order_id`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/otp/verify-otp', { phone, otp });
      localStorage.setItem('customerToken', res.data.orderToken);
      handlePlaceOrder(res.data.orderToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (token) => {
    try {
      const res = await api.post('/api/orders/create', 
        { restaurantSlug: slug, items: cart },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      clearCart();
      localStorage.removeItem('customerToken');
      navigate(`/order-success/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>Your cart is empty</Typography>
        <Button variant="contained" onClick={() => navigate(`/menu/${slug}`)} sx={{ mt: 2 }}>Explore Menu</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4, minHeight: '100vh', bgcolor: '#fbfbfb' }}>
       <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}><ArrowBackIosNew /></IconButton>
        <Typography variant="h5" fontWeight="900">Final Step {isDemo && "(Demo Mode)"}</Typography>
      </Box>
      
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 5, border: '1px solid #eee' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Bill Breakdown</Typography>
        <List disablePadding>
          {cart.map((item) => (
            <ListItem key={item.menuItemId} sx={{ py: 1.5, px: 0 }}>
              <ListItemText 
                primary={<Typography fontWeight="600">{item.name} x {item.quantity}</Typography>} 
                secondary={`₹${(item.price * item.quantity).toFixed(2)}`} 
              />
            </ListItem>
          ))}
          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
          {[
            { label: 'Total Items Cost', value: cartTotal },
            { label: 'GST/Taxes (5%)', value: cartTotal * 0.05 },
          ].map((row) => (
            <ListItem key={row.label} sx={{ py: 0.5, px: 0 }}>
              <ListItemText primary={<Typography color="text.secondary" variant="body2">{row.label}</Typography>} />
              <Typography variant="body1" fontWeight="bold">₹{row.value.toFixed(2)}</Typography>
            </ListItem>
          ))}
          <Divider sx={{ my: 2 }} />
          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText primary={<Typography fontSize="1.1rem" fontWeight="bold">Grand Total</Typography>} />
            <Typography variant="h5" color="primary" fontWeight="900">
              ₹{(cartTotal * 1.05).toFixed(2)}
            </Typography>
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #eee' }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          <Step><StepLabel>Phone</StepLabel></Step>
          <Step><StepLabel>Verify</StepLabel></Step>
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

        {activeStep === 0 ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <PhoneAndroid color="primary" />
              <Typography variant="body1" fontWeight="bold">Mobile Verification</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>Enter your number to receive a secure login code.</Typography>
            <TextField
              fullWidth
              placeholder="e.g. 9876543210"
              variant="outlined"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={{ mb: 3, mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              onClick={handleSendOTP}
              disabled={loading}
              sx={{ py: 2, borderRadius: 3, fontWeight: 'bold', fontSize: '1rem', textTransform: 'capitalize' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send One-Time Password'}
            </Button>
          </Box>
        ) : (
          <Box>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Verified color="primary" />
              <Typography variant="body1" fontWeight="bold">OTP Sent!</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>Enter the 4-digit code sent to <strong>{phone}</strong></Typography>
            <TextField
              fullWidth
              placeholder="Enter 4 digit code"
              variant="outlined"
              label="OTP Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              onClick={handleVerifyOTP}
              disabled={loading}
              sx={{ py: 2, borderRadius: 3, fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify & Place Order'}
            </Button>
            <Button 
              fullWidth 
              variant="text" 
              sx={{ mt: 2, fontWeight: '600', color: 'text.secondary' }} 
              onClick={() => setActiveStep(0)}
            >
              Change Phone Number
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Checkout;
