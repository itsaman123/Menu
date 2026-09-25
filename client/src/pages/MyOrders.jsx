import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../environment';

const STATUS_MAP = {
  pending:    { label: 'Pending',    bg: '#ffdcc3', color: '#2f1500' },
  confirmed:  { label: 'Confirmed',  bg: '#6cf8bb', color: '#00714d' },
  preparing:  { label: 'Preparing',  bg: '#6cf8bb', color: '#00714d' },
  completed:  { label: 'Completed',  bg: '#ffedd5', color: '#f97316' },
  cancelled:  { label: 'Cancelled',  bg: '#ffd6d6', color: '#ba1a1a' },
};
const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing'];

export default function MyOrders() {
  const T = useTokens();
  const navigate = useNavigate();

  // Only show the loading spinner if we actually have a saved token to try.
  const [checking, setChecking] = useState(() => !!localStorage.getItem('orderToken'));
  const [orders, setOrders] = useState(null);      // null = not loaded yet

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const fetchOrders = useCallback(async (token) => {
    const { data } = await axios.get(`${API_BASE_URL}/api/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOrders(data);
  }, []);

  // Try the token saved from a previous OTP verification first, so returning
  // customers don't have to re-verify every time they open this page.
  useEffect(() => {
    const token = localStorage.getItem('orderToken');
    if (!token) return;
    async function tryStoredToken() {
      try {
        await fetchOrders(token);
      } catch {
        localStorage.removeItem('orderToken');
      } finally {
        setChecking(false);
      }
    }
    tryStoredToken();
  }, [fetchOrders]);

  const sendOtp = async () => {
    const rawPhone = phone.replace(/\D/g, '');
    if (rawPhone.length !== 10) return setError('Enter a valid 10-digit phone number');
    setLoading(true); setError('');
    try {
      await axios.post(`${API_BASE_URL}/api/otp/send`, { phone: rawPhone });
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
      const { data } = await axios.post(`${API_BASE_URL}/api/otp/verify`, { otp: code, phone: rawPhone });
      localStorage.setItem('orderToken', data.orderToken);
      await fetchOrders(data.orderToken);
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

  const useDifferentNumber = () => {
    localStorage.removeItem('orderToken');
    setOrders(null);
    setPhone(''); setOtp(['', '', '', '', '', '']); setOtpSent(false); setError('');
  };

  const active = (orders || []).filter(o => ACTIVE_STATUSES.includes(o.status));
  const past   = (orders || []).filter(o => !ACTIVE_STATUSES.includes(o.status));

  function OrderCard({ order }) {
    const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
    const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
    });
    const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
    return (
      <Box
        onClick={() => navigate(`/order-success/${order._id}`)}
        sx={{
          bgcolor: T.surface, borderRadius: '1rem', p: 3, boxShadow: T.shadow, cursor: 'pointer',
          transition: 'all 0.2s', '&:hover': { boxShadow: T.shadowHov, transform: 'translateY(-1px)' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: T.text, fontSize: '1rem' }}>
              {order.restaurantId?.name || 'Restaurant'}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, mt: 0.25 }}>
              #{String(order._id).slice(-8).toUpperCase()} · {dateStr}
            </Typography>
          </Box>
          <Box component="span" sx={{ bgcolor: st.bg, color: st.color, px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            {st.label}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.875rem', color: T.textSub }}>
            {itemCount} item{itemCount !== 1 ? 's' : ''}{order.tableNumber ? ` · Table ${order.tableNumber}` : ''}
          </Typography>
          <Typography sx={{ fontWeight: 900, color: T.text }}>₹{order.totalAmount.toFixed(0)}</Typography>
        </Box>
      </Box>
    );
  }

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
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.025em' }}>My Orders</Typography>
        </Box>
      </Box>

      <Box component="main" sx={{ pt: 12, pb: 16, maxWidth: 600, mx: 'auto', px: 3 }}>
        {checking ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#f97316' }} />
          </Box>
        ) : orders !== null ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Box component="button" onClick={useDifferentNumber} sx={{ background: 'none', border: 'none', cursor: 'pointer', color: T.accent, fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', p: 0 }}>
                Use a different number
              </Box>
            </Box>

            {orders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: T.textMuted, display: 'block', marginBottom: 16 }}>receipt_long</span>
                <Typography sx={{ color: T.textSub, fontWeight: 600 }}>No orders yet.</Typography>
              </Box>
            ) : (
              <>
                {active.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, mb: 1.5 }}>
                      Active ({active.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {active.map(o => <OrderCard key={o._id} order={o} />)}
                    </Box>
                  </Box>
                )}
                {past.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, mb: 1.5 }}>
                      Past Orders ({past.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {past.map(o => <OrderCard key={o._id} order={o} />)}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </>
        ) : (
          /* OTP Verification Card */
          <Box sx={{ bgcolor: T.surface, borderRadius: '1rem', p: 4, boxShadow: T.shadowHov }}>
            <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 800, color: T.text, mb: 1 }}>Verify Your Number</Typography>
            <Typography sx={{ color: T.textSub, fontSize: '0.875rem', mb: 4 }}>
              {otpSent
                ? `A 6-digit code was sent to +91 ${phone}. Enter it below.`
                : 'Enter the phone number you used to order, to view your order history.'}
            </Typography>

            {error && (
              <Typography sx={{ color: T.red, bgcolor: T.redDim, p: 1.5, borderRadius: 1, mb: 3, fontSize: '0.875rem', textAlign: 'center' }}>
                {error}
              </Typography>
            )}

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
                <Box component="button" onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); setError(''); }}
                  sx={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: T.accent, fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', p: 0 }}>
                  Change number
                </Box>
              </Box>
            )}

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
              {loading ? 'Please wait…' : otpSent ? 'View My Orders' : 'Send OTP'}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
