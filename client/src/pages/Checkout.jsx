import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useTokens } from '../ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { firebaseApp } from '../firebase';

const auth = getAuth(firebaseApp);

function firebaseErrorMsg(code) {
  switch (code) {
    case 'auth/too-many-requests':    return 'Too many attempts. Please wait and try again.';
    case 'auth/invalid-phone-number': return 'Invalid phone number format.';
    case 'auth/invalid-verification-code': return 'Incorrect OTP. Please check and try again.';
    case 'auth/code-expired':         return 'OTP expired. Please request a new one.';
    default:                          return null;
  }
}

export default function Checkout() {
  const T = useTokens();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const confirmationRef = useRef(null);
  const recaptchaRef = useRef(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-anchor', { size: 'invisible' });
    return () => { recaptchaRef.current?.clear(); };
  }, []);

  const sendOtp = async () => {
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return setError('Enter a valid 10-digit phone number');
    }
    setLoading(true); setError('');
    try {
      const fullPhone = `+91${phone.replace(/\D/g, '')}`;
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, recaptchaRef.current);
      confirmationRef.current = confirmation;
      // Log send event for analytics (fire-and-forget)
      axios.post('/api/otp/log-send', { phone: fullPhone, slug }).catch(() => {});
      setOtpSent(true);
    } catch (err) {
      setError(firebaseErrorMsg(err.code) || 'Failed to send OTP. Please try again.');
      // Reset reCAPTCHA so the user can try again
      recaptchaRef.current?.clear();
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-anchor', { size: 'invisible' });
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) return setError('Enter the 6-digit OTP');
    if (!confirmationRef.current) return setError('Session expired. Please request a new OTP.');
    setLoading(true); setError('');
    try {
      const result = await confirmationRef.current.confirm(code);
      const idToken = await result.user.getIdToken();
      const { data } = await axios.post('/api/otp/verify-firebase', {
        idToken,
        phone: `+91${phone.replace(/\D/g, '')}`,
        slug,
      });
      localStorage.setItem('orderToken', data.orderToken);
      navigate(`/order-success/${slug}`);
    } catch (err) {
      setError(firebaseErrorMsg(err.code) || 'Verification failed. Please try again.');
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

      {/* Hidden reCAPTCHA anchor */}
      <div id="recaptcha-anchor" />

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

          {[
            { name: 'Truffle Infused Dumplings', qty: 1, price: 520 },
            { name: 'Burrata & Heirloom Art',     qty: 2, price: 900 },
          ].map(item => (
            <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: `1px solid ${T.border}` }}>
              <Box>
                <Typography sx={{ fontWeight: 700, color: T.text }}>{item.name}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: T.textSub }}>Qty: {item.qty}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 900, color: T.text }}>₹{item.price}</Typography>
            </Box>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 3 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: T.text }}>Total</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: T.accent }}>₹1,420</Typography>
          </Box>
        </Box>

        {/* OTP Verification Card */}
        <Box sx={{ bgcolor: T.surface, borderRadius: '1rem', p: 4, boxShadow: T.shadowHov }}>
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
                    '&:focus': { boxShadow: '0 0 0 2px rgba(83,65,205,0.2)' },
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
              <Box sx={{ display: 'flex', gap: 1 }}>
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
                      flex: 1, height: 56, textAlign: 'center', bgcolor: T.surface,
                      border: `1px solid ${T.border}`, borderRadius: '0.5rem',
                      fontSize: '1.5rem', fontWeight: 700, color: T.text, outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                      '&:focus': { borderColor: T.accent, boxShadow: '0 0 0 2px rgba(83,65,205,0.2)' },
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
              background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)',
              color: '#fff', fontWeight: 700, borderRadius: '1rem',
              boxShadow: '0 10px 20px rgba(83,65,205,0.2)', cursor: 'pointer',
              border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '1rem',
              transition: 'all 0.3s', '&:hover': { transform: 'scale(1.02)' },
              '&:active': { transform: 'scale(0.95)' },
              '&:disabled': { opacity: 0.7, cursor: 'wait' },
            }}
          >
            {loading ? 'Please wait…' : otpSent ? 'Verify & Place Order' : 'Send OTP'}
          </Box>

          {/* Powered by Firebase note */}
          <Typography sx={{ textAlign: 'center', mt: 2, fontSize: '0.7rem', color: T.textMuted }}>
            Secured by Firebase Authentication
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
