import React, { useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useTokens } from '../ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../environment';

export default function Checkout() {
  const T = useTokens();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [hasToken, setHasToken] = useState(!!localStorage.getItem('orderToken'));
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemNotes, setItemNotes] = useState({}); // { menuItemId: note }
  const [orderNotes, setOrderNotes] = useState('');
  const [openNoteFor, setOpenNoteFor] = useState(null); // menuItemId currently being edited
  const inputRefs = useRef([]);

  // Read cart saved by PublicMenu before navigating here
  const pendingCart = JSON.parse(localStorage.getItem('pendingCart') || '{"items":[]}');
  const cartItems = pendingCart.items || [];
  const cartTotal = cartItems.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
  const gstEnabled = pendingCart.gstEnabled !== false;
  const gstRate = pendingCart.gstRate ?? 5;
  const gstAmount = gstEnabled ? cartTotal * (gstRate / 100) : 0;
  const grandTotal = cartTotal + gstAmount;

  const placeOrderDirectly = async () => {
    setLoading(true); setError('');
    const orderToken = localStorage.getItem('orderToken');
    try {
      const cart = JSON.parse(localStorage.getItem('pendingCart') || '{"items":[]}');
      const { data: order } = await axios.post(`${API_BASE_URL}/api/orders/create`, {
        restaurantSlug: cart.restaurantSlug || slug,
        items: (cart.items || []).map(i => ({ menuItemId: i.menuItemId, name: i.name, quantity: i.quantity, notes: itemNotes[i.menuItemId] || '' })),
        tableNumber: cart.tableNumber || '',
        notes: orderNotes,
      }, {
        headers: { Authorization: `Bearer ${orderToken}` },
      });
      localStorage.removeItem('pendingCart');
      navigate(`/order-success/${order._id}`);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('orderToken');
        setHasToken(false);
        setError('Your session has expired. Please verify your phone number again.');
      } else {
        setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      }
    }
    setLoading(false);
  };

  const sendOtp = async () => {
    const rawPhone = phone.replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      return setError('Enter a valid 10-digit phone number');
    }
    setLoading(true); setError('');
    try {
      await axios.post(`${API_BASE_URL}/api/otp/send`, { phone: rawPhone, slug });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) return setError('Enter the 6-digit OTP');
    setLoading(true); setError('');
    try {
      const rawPhone = phone.replace(/\D/g, '');
      const { data } = await axios.post(`${API_BASE_URL}/api/otp/verify`, {
        otp: code,
        phone: rawPhone,
        slug,
      });
      const orderToken = data.orderToken;
      localStorage.setItem('orderToken', orderToken);

      // Create the order using the verified OTP token
      const cart = JSON.parse(localStorage.getItem('pendingCart') || '{"items":[]}');
      const { data: order } = await axios.post(`${API_BASE_URL}/api/orders/create`, {
        restaurantSlug: cart.restaurantSlug || slug,
        items: (cart.items || []).map(i => ({ menuItemId: i.menuItemId, name: i.name, quantity: i.quantity, notes: itemNotes[i.menuItemId] || '' })),
        tableNumber: cart.tableNumber || '',
        notes: orderNotes,
      }, {
        headers: { Authorization: `Bearer ${orderToken}` },
      });
      localStorage.removeItem('pendingCart');
      navigate(`/order-success/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    }
    setLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp]; next[index] = value; setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text }}>

      {/* Header */}
      <Box component="header" sx={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        bgcolor: T.navBg, backdropFilter: 'blur(24px)', boxShadow: T.shadowHov,
      }}>
        <Box sx={{ maxWidth: 600, mx: 'auto', px: 3, height: 64, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box component="button" onClick={() => navigate(-1)} sx={{
            width: 40, height: 40, borderRadius: '50%', bgcolor: T.surfaceAlt,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer', color: T.text,
          }}>
            <span className="material-symbols-outlined">arrow_back</span>
          </Box>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Checkout</Typography>
        </Box>
      </Box>

      <Box component="main" sx={{ pt: 12, pb: 16, maxWidth: 600, mx: 'auto', px: 3 }}>

        {/* Cart Summary Card */}
        <Box sx={{ bgcolor: T.surface, borderRadius: '1rem', p: 4, boxShadow: T.shadowHov, mb: 4 }}>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 800, color: T.text, mb: 3, letterSpacing: '-0.025em' }}>Your Order</Typography>

          {cartItems.length === 0 ? (
            <Typography sx={{ color: T.textSub, textAlign: 'center', py: 3 }}>No items in cart.</Typography>
          ) : cartItems.map(item => (
            <Box key={item.menuItemId} sx={{ py: 2, borderBottom: `1px solid ${T.border}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 11, height: 11, borderRadius: '2px', flexShrink: 0, border: `2px solid ${item.isVeg !== false ? '#006c49' : '#ba1a1a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: item.isVeg !== false ? '#006c49' : '#ba1a1a' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: T.text }}>{item.name}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: T.textSub, mt: 0.25 }}>Qty: {item.quantity}</Typography>
                </Box>
                {item.price != null && (
                  <Typography sx={{ fontWeight: 900, color: T.text }}>₹{(item.price * item.quantity).toFixed(0)}</Typography>
                )}
              </Box>
              {openNoteFor === item.menuItemId ? (
                <Box component="input" autoFocus placeholder="Add a note for this item (e.g. no onions)…"
                  value={itemNotes[item.menuItemId] || ''}
                  onChange={e => setItemNotes(p => ({ ...p, [item.menuItemId]: e.target.value }))}
                  onBlur={() => setOpenNoteFor(null)}
                  sx={{
                    width: '100%', mt: 1.5, height: 38, px: 1.5, borderRadius: '0.5rem',
                    bgcolor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, outline: 'none',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', boxSizing: 'border-box',
                    '&:focus': { borderColor: T.accent, boxShadow: '0 0 0 2px rgba(249,115,22,0.15)' },
                    '&::placeholder': { color: T.textMuted },
                  }} />
              ) : (
                <Box onClick={() => setOpenNoteFor(item.menuItemId)} sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.25, cursor: 'pointer',
                  color: itemNotes[item.menuItemId] ? T.textSub : T.accent, width: 'fit-content',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                    {itemNotes[item.menuItemId] ? 'edit_note' : 'add'}
                  </span>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, fontStyle: itemNotes[item.menuItemId] ? 'italic' : 'normal' }}>
                    {itemNotes[item.menuItemId] || 'Add a note'}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}

          {cartItems.length > 0 && (
            <Box sx={{ pt: 3 }}>
              <Typography component="label" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, display: 'block', mb: 1 }}>
                Notes for the whole order
              </Typography>
              <Box component="textarea" rows={2} placeholder="e.g. Please make it less spicy, extra napkins…"
                value={orderNotes} onChange={e => setOrderNotes(e.target.value)}
                sx={{
                  width: '100%', p: 1.5, borderRadius: '0.75rem', resize: 'vertical',
                  bgcolor: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, outline: 'none',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', boxSizing: 'border-box',
                  '&:focus': { borderColor: T.accent, boxShadow: '0 0 0 2px rgba(249,115,22,0.15)' },
                  '&::placeholder': { color: T.textMuted },
                }} />
            </Box>
          )}

          {cartTotal > 0 && (
            <Box sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: T.textSub, fontSize: '0.9rem' }}>Item Total</Typography>
                <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9rem' }}>₹{cartTotal.toFixed(0)}</Typography>
              </Box>
              {gstEnabled && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: T.textSub, fontSize: '0.9rem' }}>GST ({gstRate}%)</Typography>
                  <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.9rem' }}>₹{gstAmount.toFixed(0)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, mt: 0.5, borderTop: `1px dashed ${T.border}` }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: T.text }}>Total</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: T.accent }}>₹{grandTotal.toFixed(0)}</Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* OTP Verification Card */}
        <Box sx={{ bgcolor: T.surface, borderRadius: '1rem', p: 4, boxShadow: T.shadowHov }}>
          {hasToken ? (
            <>
              <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 800, color: T.text, mb: 1 }}>Confirm Order</Typography>
              <Typography sx={{ color: T.textSub, fontSize: '0.875rem', mb: 4 }}>
                You are already verified. Click below to place your order.
              </Typography>
              {error && (
                <Typography sx={{ color: T.red, bgcolor: T.redDim, p: 1.5, borderRadius: 1, mb: 3, fontSize: '0.875rem', textAlign: 'center' }}>
                  {error}
                </Typography>
              )}
              <Box component="button" disabled={loading}
                onClick={placeOrderDirectly}
                sx={{
                  width: '100%', height: 56,
                  background: 'linear-gradient(to bottom right, #f97316, #ea580c)',
                  color: '#fff', fontWeight: 700, borderRadius: '1rem',
                  boxShadow: '0 10px 20px rgba(249,115,22,0.2)', cursor: 'pointer',
                  border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '1rem',
                  transition: 'all 0.3s', '&:hover': { transform: 'scale(1.02)' },
                  '&:active': { transform: 'scale(0.95)' },
                  '&:disabled': { opacity: 0.7, cursor: 'wait' },
                }}
              >
                {loading ? 'Please wait…' : 'Place Order'}
              </Box>
              <Box component="button" onClick={() => { localStorage.removeItem('orderToken'); setHasToken(false); setError(''); }}
                sx={{ width: '100%', mt: 2, background: 'none', border: 'none', cursor: 'pointer', color: T.accent, fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', p: 0 }}>
                Use a different number
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 800, color: T.text, mb: 1 }}>Verify Your Number</Typography>
              <Typography sx={{ color: T.textSub, fontSize: '0.875rem', mb: 4 }}>
            {otpSent
              ? `A 6-digit code was sent to +91 ${phone}. Enter it below.`
              : 'A one-time code will be sent to your phone for order confirmation.'}
          </Typography>

          {error && (
            <Typography sx={{ color: T.red, bgcolor: T.redDim, p: 1.5, borderRadius: 1, mb: 3, fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          {/* Phone Input */}
          {!otpSent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              <Typography component="label" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>
                Phone Number
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{
                  height: 56, px: 2, bgcolor: T.surfaceAlt, borderRadius: '1rem',
                  display: 'flex', alignItems: 'center', color: T.textSub, fontWeight: 700,
                }}>+91</Box>
                <Box component="input" type="tel" value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  sx={{
                    flex: 1, height: 56, px: 3, borderRadius: '1rem',
                    bgcolor: T.surfaceAlt, border: 'none', color: T.text, outline: 'none',
                    fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '1rem',
                    '&:focus': { boxShadow: '0 0 0 2px rgba(249,115,22,0.2)' },
                    '&::placeholder': { color: T.textMuted },
                  }}
                />
              </Box>
            </Box>
          )}

          {/* 6-digit OTP Input */}
          {otpSent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              <Typography component="label" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>
                Enter 6-Digit OTP
              </Typography>
              <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 } }}>
                {otp.map((digit, i) => (
                  <Box
                    key={i}
                    component="input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    ref={el => (inputRefs.current[i] = el)}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    sx={{
                      flex: '1 1 0', width: 0, minWidth: 0,
                      height: { xs: 44, sm: 56 }, textAlign: 'center', bgcolor: T.surface,
                      border: `1px solid ${T.border}`, borderRadius: '0.5rem', p: 0,
                      fontSize: { xs: '1.1rem', sm: '1.5rem' }, fontWeight: 700, color: T.text, outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                      '&:focus': { borderColor: T.accent, boxShadow: '0 0 0 2px rgba(249,115,22,0.2)' },
                    }}
                  />
                ))}
              </Box>
              <Box component="button" onClick={() => { setOtpSent(false); setOtp(['','','','','','']); setError(''); }}
                sx={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: T.accent, fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', p: 0 }}>
                Change number
              </Box>
            </Box>
          )}

          {/* Action Button */}
          <Box component="button" disabled={loading}
            onClick={otpSent ? verifyOtp : sendOtp}
            sx={{
              width: '100%', height: 56,
              background: 'linear-gradient(to bottom right, #f97316, #ea580c)',
              color: '#fff', fontWeight: 700, borderRadius: '1rem',
              boxShadow: '0 10px 20px rgba(249,115,22,0.2)', cursor: 'pointer',
              border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '1rem',
              transition: 'all 0.3s', '&:hover': { transform: 'scale(1.02)' },
              '&:active': { transform: 'scale(0.95)' },
              '&:disabled': { opacity: 0.7, cursor: 'wait' },
            }}
          >
            {loading ? 'Please wait…' : otpSent ? 'Verify & Place Order' : 'Send OTP'}
          </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
