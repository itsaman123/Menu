import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTokens } from '../ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

/* ─── Print Receipt (only visible when window.print() is called) ─── */
function PrintReceipt({ order, restaurantName }) {
  if (!order) return null;

  const subtotal = order.totalAmount / 1.05;
  const gst      = order.totalAmount - subtotal;
  const dateStr  = new Date(order.createdAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  return (
    <Box
      id="print-receipt"
      sx={{
        display: 'none',
        '@media print': { display: 'block' },
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '12px',
        width: '72mm',
        mx: 'auto',
        p: '4mm',
        color: '#000',
        bgcolor: '#fff',
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: '4mm' }}>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '15px', fontWeight: 'bold', letterSpacing: '0.05em' }}>
          {restaurantName || 'Restaurant'}
        </Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '11px', mt: '1mm' }}>
          Powered by QR Menu
        </Typography>
        <Box sx={{ borderTop: '1px dashed #000', mt: '3mm', mb: '3mm' }} />
        <Typography sx={{ fontFamily: 'inherit', fontSize: '11px' }}>
          Order #{String(order._id).slice(-8).toUpperCase()}
        </Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', mt: '1mm' }}>{dateStr}</Typography>
        {order.tableNumber && (
          <Typography sx={{ fontFamily: 'inherit', fontSize: '11px', mt: '1mm', fontWeight: 'bold' }}>
            Table: {order.tableNumber}
          </Typography>
        )}
      </Box>

      <Box sx={{ borderTop: '1px dashed #000', mb: '3mm' }} />

      {/* Header row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '1mm' }}>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', fontWeight: 'bold', flex: 1 }}>ITEM</Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>QTY</Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', fontWeight: 'bold', width: '55px', textAlign: 'right' }}>AMT</Typography>
      </Box>
      <Box sx={{ borderTop: '1px dashed #000', mb: '2mm' }} />

      {/* Items */}
      {order.items.map((item, i) => (
        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: '1.5mm', alignItems: 'flex-start' }}>
          <Typography sx={{ fontFamily: 'inherit', fontSize: '11px', flex: 1, pr: '2mm', lineHeight: 1.3 }}>
            {item.name}
          </Typography>
          <Typography sx={{ fontFamily: 'inherit', fontSize: '11px', width: '30px', textAlign: 'center' }}>
            x{item.quantity}
          </Typography>
          <Typography sx={{ fontFamily: 'inherit', fontSize: '11px', width: '55px', textAlign: 'right' }}>
            ₹{(item.price * item.quantity).toFixed(2)}
          </Typography>
        </Box>
      ))}

      <Box sx={{ borderTop: '1px dashed #000', mt: '2mm', mb: '2mm' }} />

      {/* Totals */}
      {[
        { label: 'Subtotal',  value: subtotal.toFixed(2) },
        { label: 'GST (5%)', value: gst.toFixed(2) },
      ].map(row => (
        <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: '1mm' }}>
          <Typography sx={{ fontFamily: 'inherit', fontSize: '11px' }}>{row.label}</Typography>
          <Typography sx={{ fontFamily: 'inherit', fontSize: '11px' }}>₹{row.value}</Typography>
        </Box>
      ))}

      <Box sx={{ borderTop: '1px solid #000', mt: '2mm', mb: '2mm' }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold' }}>TOTAL</Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold' }}>
          ₹{order.totalAmount.toFixed(2)}
        </Typography>
      </Box>

      <Box sx={{ borderTop: '1px dashed #000', mt: '4mm', mb: '3mm' }} />

      {/* Footer */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '11px' }}>
          Thank you for dining with us!
        </Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', mt: '1mm', color: '#555' }}>
          Please visit again
        </Typography>
      </Box>
    </Box>
  );
}

export default function OrderSuccess() {
  const T = useTokens();
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data);
      } catch {
        setError('Could not load order details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function handlePrint() {
    window.print();
  }

  const restaurantName = order?.restaurantId?.name || 'Restaurant';
  const subtotal = order ? order.totalAmount / 1.05 : 0;
  const gst      = order ? order.totalAmount - subtotal : 0;

  /* Status display */
  const STATUS_MAP = {
    pending:    { label: 'Pending',    bg: '#ffdcc3', color: '#2f1500' },
    confirmed:  { label: 'Confirmed',  bg: '#6cf8bb', color: '#00714d' },
    preparing:  { label: 'Preparing',  bg: '#6cf8bb', color: '#00714d' },
    completed:  { label: 'Completed',  bg: '#e4dfff', color: '#5341cd' },
    cancelled:  { label: 'Cancelled',  bg: '#ffd6d6', color: '#ba1a1a' },
  };
  const st = STATUS_MAP[order?.status] || STATUS_MAP.pending;

  return (
    <>
      {/* ── Print-only receipt (hidden on screen) ── */}
      <PrintReceipt order={order} restaurantName={restaurantName} />

      {/* ── Screen content (hidden when printing) ── */}
      <Box sx={{
        bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', p: { xs: 2, sm: 3 },
        '@media print': { display: 'none' },
      }}>
        {loading ? (
          <CircularProgress sx={{ color: '#5341cd' }} />
        ) : error ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#ba1a1a', fontWeight: 700, mb: 2 }}>{error}</Typography>
            <Box component="button" onClick={() => navigate(-2)} sx={{
              px: 4, py: 1.5, bgcolor: T.surfaceAlt, color: T.text, border: 'none',
              borderRadius: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700,
            }}>
              Back to Menu
            </Box>
          </Box>
        ) : (
          <Box sx={{ maxWidth: 480, width: '100%' }}>
            {/* Success Card */}
            <Box sx={{
              bgcolor: T.surface, borderRadius: '1.5rem',
              p: { xs: 3, sm: 5 }, boxShadow: T.shadowHov, textAlign: 'center',
            }}>
              {/* Icon */}
              <Box sx={{
                width: 88, height: 88, borderRadius: '50%', bgcolor: '#6cf8bb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 3, boxShadow: '0 8px 28px rgba(0,108,73,0.2)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 44, color: '#006c49', fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </Box>

              <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem' }, fontWeight: 900, color: T.text, mb: 1, letterSpacing: '-0.025em' }}>
                Order Placed!
              </Typography>
              <Typography sx={{ color: T.textSub, fontSize: '0.95rem', mb: 4, lineHeight: 1.625 }}>
                Your order has been confirmed and sent to the kitchen. Sit back and relax!
              </Typography>

              {/* Order Meta */}
              <Box sx={{ bgcolor: T.surfaceAlt, borderRadius: '1rem', p: { xs: 2, sm: 3 }, mb: 3, textAlign: 'left' }}>
                {[
                  { label: 'Order ID',   value: `#${String(id || '').slice(-8).toUpperCase()}` },
                  { label: 'Restaurant', value: restaurantName },
                  ...(order?.tableNumber ? [{ label: 'Table', value: order.tableNumber }] : []),
                  { label: 'Status',     pill: true },
                  { label: 'Est. Time',  value: '15-20 mins', highlight: true },
                ].map((row, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: i < 4 ? 2 : 0 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>
                      {row.label}
                    </Typography>
                    {row.pill ? (
                      <Box component="span" sx={{ bgcolor: st.bg, color: st.color, px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {st.label}
                      </Box>
                    ) : (
                      <Typography sx={{ fontWeight: 700, color: row.highlight ? '#5341cd' : T.text, fontSize: '0.875rem' }}>
                        {row.value}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>

              {/* Order Items Breakdown */}
              {order?.items?.length > 0 && (
                <Box sx={{ bgcolor: T.surfaceAlt, borderRadius: '1rem', p: { xs: 2, sm: 3 }, mb: 3, textAlign: 'left' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, mb: 2 }}>
                    Order Items
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                    {order.items.map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                          <Box sx={{
                            width: 22, height: 22, borderRadius: '50%', bgcolor: T.surfaceHigh, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', fontWeight: 900, color: T.textSub,
                          }}>
                            {item.quantity}
                          </Box>
                          <Typography sx={{ fontSize: '0.875rem', color: T.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.name}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: T.text, ml: 2, flexShrink: 0 }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ borderTop: `1px dashed ${T.surfaceHigh}`, pt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>Subtotal</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: T.text, fontWeight: 600 }}>₹{subtotal.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>GST (5%)</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: T.text, fontWeight: 600 }}>₹{gst.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: `1px solid ${T.surfaceHigh}` }}>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 900, color: T.text }}>Total</Typography>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 900, color: '#5341cd' }}>
                        ₹{order.totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Status progress bar */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  {['Order Placed', 'Preparing', 'Ready'].map((s, i) => (
                    <Typography key={s} sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: i === 0 ? '#006c49' : T.textMuted }}>
                      {s}
                    </Typography>
                  ))}
                </Box>
                <Box sx={{ height: 8, bgcolor: T.surfaceHigh, borderRadius: '9999px', overflow: 'hidden' }}>
                  <Box sx={{
                    height: '100%', width: '33%', bgcolor: '#006c49', borderRadius: '9999px',
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
                  }} />
                </Box>
              </Box>

              {/* Action buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Print Bill */}
                <Box
                  component="button"
                  onClick={handlePrint}
                  sx={{
                    width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
                    background: 'linear-gradient(135deg, #5341CD, #6C5CE7)',
                    color: '#fff', fontWeight: 700, borderRadius: '1rem',
                    boxShadow: '0 10px 20px rgba(83,65,205,0.2)', cursor: 'pointer',
                    border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '1rem',
                    '&:hover': { transform: 'scale(1.02)' }, '&:active': { transform: 'scale(0.95)' },
                    transition: 'transform 0.15s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>print</span>
                  Print Bill / Receipt
                </Box>

                {/* Track Order */}
                <Box
                  component="button"
                  sx={{
                    width: '100%', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
                    bgcolor: T.surfaceAlt, color: T.text, fontWeight: 700, borderRadius: '1rem',
                    border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                    '&:hover': { bgcolor: T.surfaceHigh },
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>track_changes</span>
                  Track Order
                </Box>

                {/* Back to Menu */}
                <Box
                  component="button"
                  onClick={() => navigate(-2)}
                  sx={{
                    width: '100%', height: 44, bgcolor: 'transparent', color: T.textSub,
                    fontWeight: 600, borderRadius: '1rem', border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                    '&:hover': { color: T.text },
                  }}
                >
                  ← Back to Menu
                </Box>
              </Box>
            </Box>

            {/* Badge */}
            <Box sx={{ mt: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <span className="material-symbols-outlined" style={{ color: T.textMuted, fontSize: 16 }}>verified</span>
              <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, fontWeight: 500 }}>
                Powered by QR Menu
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
