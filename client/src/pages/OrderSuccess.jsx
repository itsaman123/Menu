import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTokens } from '../ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../environment';

/* Steps: pending/confirmed → 0, preparing → 1, completed → 2, cancelled → -1 */
const STEP_INDEX = { pending: 0, confirmed: 0, preparing: 1, completed: 2, cancelled: -1 };

export default function OrderSuccess() {
  const T = useTokens();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: order,
    isLoading: loading,
    error: queryError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const token = localStorage.getItem('orderToken');
      const { data } = await axios.get(`${API_BASE_URL}/api/orders/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return data;
    },
    enabled: !!id,
    retry: false,
    // Poll so status changes made from the admin's Live Orders view show up
    // here without the customer having to manually refresh.
    refetchInterval: (query) => (query.state.data?.status === 'completed' || query.state.data?.status === 'cancelled' ? false : 5000),
  });

  const authFailed = queryError?.response?.status === 401 || queryError?.response?.status === 403;
  const error = !id ? 'Could not load order details.'
    : authFailed ? 'Verify your phone number to view this order.'
    : queryError ? 'Could not load order details.'
    : '';

  const restaurantName = order?.restaurantId?.name || 'Restaurant';
  const estimatedPrepTime = order?.restaurantId?.estimatedPrepTime || '15-20 mins';
  // Older orders (placed before per-restaurant GST toggling) don't have subtotal/gstAmount
  // stored — fall back to the old fixed-5% assumption for those.
  const subtotal = order ? (order.subtotal ?? order.totalAmount / 1.05) : 0;
  const gst      = order ? (order.gstAmount ?? order.totalAmount - subtotal) : 0;
  const gstRatePct = order?.gstRatePct || (gst > 0 ? Math.round((gst / subtotal) * 100) : 0);

  /* Status display */
  const STATUS_MAP = {
    pending:    { label: 'Pending',    bg: '#ffdcc3', color: '#2f1500' },
    confirmed:  { label: 'Confirmed',  bg: '#6cf8bb', color: '#00714d' },
    preparing:  { label: 'Preparing',  bg: '#6cf8bb', color: '#00714d' },
    completed:  { label: 'Completed',  bg: '#ffedd5', color: '#f97316' },
    cancelled:  { label: 'Cancelled',  bg: '#ffd6d6', color: '#ba1a1a' },
  };
  const st = STATUS_MAP[order?.status] || STATUS_MAP.pending;
  const stepIdx = STEP_INDEX[order?.status] ?? 0;
  const progressPct = stepIdx < 0 ? 0 : ((stepIdx + 1) / 3) * 100;

  return (
      <Box sx={{
        bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', p: { xs: 2, sm: 3 },
      }}>
        {loading ? (
          <CircularProgress sx={{ color: '#f97316' }} />
        ) : error ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#ba1a1a', fontWeight: 700, mb: 2 }}>{error}</Typography>
            {authFailed && (
              <Box component="button" onClick={() => navigate('/my-orders')} sx={{
                px: 4, py: 1.5, mr: 1.5, background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none',
                borderRadius: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700,
              }}>
                Verify Phone Number
              </Box>
            )}
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
                  { label: 'Est. Time',  value: estimatedPrepTime, highlight: true },
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
                      <Typography sx={{ fontWeight: 700, color: row.highlight ? '#f97316' : T.text, fontSize: '0.875rem' }}>
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
                      <Box key={i}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        {item.notes && (
                          <Typography sx={{ fontSize: '0.75rem', color: T.textSub, fontStyle: 'italic', pl: '30px', mt: 0.25 }}>
                            "{item.notes}"
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>

                  {order.notes && (
                    <Box sx={{ bgcolor: T.surfaceHigh, borderRadius: '0.75rem', p: 1.5, mb: 2 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textSub, mb: 0.25 }}>
                        Order Notes
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: T.text }}>{order.notes}</Typography>
                    </Box>
                  )}

                  <Box sx={{ borderTop: `1px dashed ${T.surfaceHigh}`, pt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>Subtotal</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: T.text, fontWeight: 600 }}>₹{subtotal.toFixed(2)}</Typography>
                    </Box>
                    {gst > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>GST ({gstRatePct}%)</Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: T.text, fontWeight: 600 }}>₹{gst.toFixed(2)}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: `1px solid ${T.surfaceHigh}` }}>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 900, color: T.text }}>Total</Typography>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 900, color: '#f97316' }}>
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
                    <Typography key={s} sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: i <= stepIdx ? '#006c49' : T.textMuted }}>
                      {s}
                    </Typography>
                  ))}
                </Box>
                <Box sx={{ height: 8, bgcolor: T.surfaceHigh, borderRadius: '9999px', overflow: 'hidden' }}>
                  <Box sx={{
                    height: '100%', width: `${progressPct}%`, bgcolor: order?.status === 'cancelled' ? '#ba1a1a' : '#006c49',
                    borderRadius: '9999px', transition: 'width 0.4s ease',
                    ...(order?.status !== 'completed' && order?.status !== 'cancelled' && {
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
                    }),
                  }} />
                </Box>
              </Box>

              {/* Action buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Track Order */}
                <Box
                  component="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  sx={{
                    width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: '#fff', fontWeight: 700, borderRadius: '1rem',
                    boxShadow: '0 10px 20px rgba(249,115,22,0.2)', cursor: isFetching ? 'wait' : 'pointer',
                    border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '1rem',
                    opacity: isFetching ? 0.8 : 1,
                    '&:hover': { transform: 'scale(1.02)' }, '&:active': { transform: 'scale(0.95)' },
                    transition: 'transform 0.15s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {isFetching ? 'hourglass_empty' : 'track_changes'}
                  </span>
                  {isFetching ? 'Refreshing…' : 'Track Order'}
                </Box>

                {/* View all orders */}
                <Box
                  component="button"
                  onClick={() => navigate('/my-orders')}
                  sx={{
                    width: '100%', height: 44, bgcolor: 'transparent', color: T.textSub,
                    fontWeight: 600, borderRadius: '1rem', border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                    '&:hover': { color: T.text },
                  }}
                >
                  View All My Orders
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
                Powered by ScanIt
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
  );
}
