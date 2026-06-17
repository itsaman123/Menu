import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useTokens } from '../ThemeContext';
import api from '../api';

function playOrderAlarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Three ascending dings: C5 → E5 → G5
    [[0, 523], [0.25, 659], [0.5, 784]].forEach(([delay, freq]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.45);
    });
    // Close context after sound finishes
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // AudioContext not supported — silent fail
  }
}

const M = motion.create(Box);

const STATUS_FLOW = {
  pending:   { next: 'confirmed',  nextLabel: 'Confirm',    color: '#884800', bg: '#ffdcc3' },
  confirmed: { next: 'preparing',  nextLabel: 'Start Prep', color: '#2563eb', bg: '#dbeafe' },
  preparing: { next: 'completed',  nextLabel: 'Mark Ready', color: '#006c49', bg: '#6cf8bb' },
  completed: { next: null,         nextLabel: 'Done',       color: '#5341cd', bg: '#e4dfff' },
  cancelled: { next: null,         nextLabel: 'Cancelled',  color: '#ba1a1a', bg: '#ffd6d6' },
};

function timeSince(dateStr) {
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (mins < 1) return '<1m';
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function LiveOrdersView() {
  const T = useTokens();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState({});
  const [filter, setFilter]       = useState('active');
  const [muted, setMuted]         = useState(false);

  // Track order IDs we've already seen so we only alarm on truly new ones
  const knownIds  = useRef(null);
  const mutedRef  = useRef(muted);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/api/orders/restaurant');

      // First load: just record what exists, no alarm
      if (knownIds.current === null) {
        knownIds.current = new Set(data.map(o => o._id));
      } else {
        const newPending = data.filter(
          o => o.status === 'pending' && !knownIds.current.has(o._id)
        );
        if (newPending.length > 0) {
          // Add all new IDs to known set
          newPending.forEach(o => knownIds.current.add(o._id));
          if (!mutedRef.current) playOrderAlarm();
        }
        // Also track any other new orders (confirmed/etc) so they don't re-trigger
        data.forEach(o => knownIds.current.add(o._id));
      }

      setOrders(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function updateStatus(orderId, newStatus) {
    setUpdating(p => ({ ...p, [orderId]: true }));
    try {
      const { data } = await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === data._id ? data : o));
    } catch {
      // silent
    } finally {
      setUpdating(p => ({ ...p, [orderId]: false }));
    }
  }

  const active    = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status));
  const completed = orders.filter(o => o.status === 'completed');
  const cancelled = orders.filter(o => o.status === 'cancelled');
  const pending   = orders.filter(o => o.status === 'pending');
  const preparing = orders.filter(o => o.status === 'preparing');

  const displayed = filter === 'active'    ? active
                  : filter === 'completed' ? completed
                  : cancelled;

  return (
    <M
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-end' }, justifyContent: 'space-between', gap: 3, mb: 5 }}>
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 900, color: T.text, letterSpacing: '-0.05em' }}>
            Live Orders
          </Typography>
          <Typography sx={{ color: T.textSub, mt: 0.5, fontWeight: 500 }}>Real-time floor management and kitchen synchronization.</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ bgcolor: T.surfaceAlt, px: 3, py: 1.5, borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <span className="material-symbols-outlined" style={{ color: '#006c49', fontSize: 16 }}>radio_button_checked</span>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#006c49' }}>Kitchen Live</Typography>
          </Box>
          {/* Sound mute toggle */}
          <Box
            component="button"
            onClick={() => setMuted(m => !m)}
            title={muted ? 'Unmute order alarm' : 'Mute order alarm'}
            sx={{
              p: 1.5, bgcolor: muted ? '#ffd6d6' : T.surfaceAlt, border: 'none', borderRadius: '50%',
              cursor: 'pointer', color: muted ? '#ba1a1a' : T.textSub,
              display: 'flex', '&:hover': { bgcolor: muted ? '#ffc5c5' : T.surfaceHigh },
              transition: 'all 0.15s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {muted ? 'volume_off' : 'volume_up'}
            </span>
          </Box>
          <Box
            component="button"
            onClick={fetchOrders}
            sx={{ p: 1.5, bgcolor: T.surfaceAlt, border: 'none', borderRadius: '50%', cursor: 'pointer', color: T.textSub, display: 'flex', '&:hover': { bgcolor: T.surfaceHigh } }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>refresh</span>
          </Box>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 5 }}>
        <Box sx={{ bgcolor: T.surfaceAlt, p: 3, borderRadius: '0.75rem' }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>Pending</Typography>
          <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: T.text }}>{pending.length}</Typography>
        </Box>
        <Box sx={{ bgcolor: '#6c5ce7', p: 3, borderRadius: '0.75rem' }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5, color: 'rgba(250,246,255,0.8)' }}>Preparing</Typography>
          <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#faf6ff' }}>{preparing.length}</Typography>
        </Box>
        <Box sx={{ bgcolor: T.surface, p: 3, borderRadius: '0.75rem', boxShadow: T.shadow }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>Completed Today</Typography>
          <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#006c49' }}>{completed.length}</Typography>
        </Box>
        <Box sx={{ bgcolor: T.surface, p: 3, borderRadius: '0.75rem', boxShadow: T.shadow }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>Total Orders</Typography>
          <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: T.text }}>{orders.length}</Typography>
        </Box>
      </Box>

      {/* Filter tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 4, bgcolor: T.surface, p: 1, borderRadius: '9999px', width: 'fit-content', boxShadow: T.shadow }}>
        {[
          { key: 'active',    label: `Active (${active.length})` },
          { key: 'completed', label: `Completed (${completed.length})` },
          { key: 'cancelled', label: `Cancelled (${cancelled.length})` },
        ].map(f => (
          <Box
            component="button"
            key={f.key}
            onClick={() => setFilter(f.key)}
            sx={{
              px: { xs: 2, sm: 3 }, py: 1, borderRadius: '9999px', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 700,
              transition: 'all 0.2s',
              bgcolor: filter === f.key ? '#5341cd' : 'transparent',
              color:   filter === f.key ? '#fff'    : T.textSub,
            }}
          >
            {f.label}
          </Box>
        ))}
      </Box>

      {/* Orders grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#5341cd' }} />
        </Box>
      ) : displayed.length === 0 ? (
        <Box sx={{ bgcolor: T.surface, p: { xs: 6, md: 10 }, borderRadius: '0.75rem', textAlign: 'center', boxShadow: T.shadow }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: T.textMuted, display: 'block', marginBottom: 16 }}>receipt_long</span>
          <Typography sx={{ color: T.textSub, fontWeight: 600, fontSize: '1.05rem' }}>
            No {filter} orders right now.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 4 }}>
          {displayed.map(order => {
            const sf = STATUS_FLOW[order.status] || STATUS_FLOW.pending;
            const wait = timeSince(order.createdAt);
            const isUpdating = !!updating[order._id];
            return (
              <Box key={order._id} sx={{
                bgcolor: T.surface, borderRadius: '0.75rem', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', boxShadow: T.shadow,
                transition: 'box-shadow 0.2s', '&:hover': { boxShadow: T.shadowHov },
              }}>
                {/* Card header */}
                <Box sx={{ p: 3, borderBottom: `1px solid ${T.surfaceHigh}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Box component="span" sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', bgcolor: sf.bg, color: sf.color, px: 1.5, py: 0.25, borderRadius: '4px' }}>
                        {order.status}
                      </Box>
                      <Box component="span" sx={{ fontSize: '10px', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        #{String(order._id).slice(-6).toUpperCase()}
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '1.375rem', fontWeight: 900, color: T.text }}>
                      {order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
                    </Typography>
                    {order.customerPhone && (
                      <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, mt: 0.25 }}>
                        {order.customerPhone}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Wait</Typography>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: order.status === 'pending' ? '#ba1a1a' : T.text }}>
                      {wait}
                    </Typography>
                  </Box>
                </Box>

                {/* Items */}
                <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {order.items.map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: T.text, fontWeight: 500, fontSize: '0.9rem' }}>
                        {item.quantity}x {item.name}
                      </Typography>
                      <Typography sx={{ color: T.textSub, fontSize: '0.875rem', fontWeight: 700 }}>
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </Typography>
                    </Box>
                  ))}
                  <Box sx={{ pt: 2, mt: 'auto', borderTop: `1px dashed ${T.surfaceHigh}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</Typography>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: T.text }}>₹{order.totalAmount.toFixed(2)}</Typography>
                  </Box>
                </Box>

                {/* Actions */}
                {sf.next && (
                  <Box sx={{ p: 3, bgcolor: T.surfaceAlt, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <Box
                      component="button"
                      onClick={() => updateStatus(order._id, 'cancelled')}
                      disabled={isUpdating}
                      sx={{
                        bgcolor: T.surfaceHigh, color: '#ba1a1a', py: 1.5, px: 2, borderRadius: '9999px',
                        fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                        border: 'none', cursor: isUpdating ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                        '&:hover': { bgcolor: '#ffd6d6' }, transition: 'all 0.15s',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>cancel</span>
                      Cancel
                    </Box>
                    <Box
                      component="button"
                      onClick={() => updateStatus(order._id, sf.next)}
                      disabled={isUpdating}
                      sx={{
                        bgcolor: isUpdating ? T.surfaceHigh : '#5341cd', color: isUpdating ? T.textMuted : '#fff',
                        py: 1.5, px: 2, borderRadius: '9999px',
                        fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                        border: 'none', cursor: isUpdating ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                        boxShadow: isUpdating ? 'none' : '0 4px 6px rgba(83,65,205,0.2)',
                        '&:hover': { bgcolor: isUpdating ? T.surfaceHigh : '#4029ba' }, transition: 'all 0.15s',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                        {isUpdating ? 'hourglass_empty' : 'check_circle'}
                      </span>
                      {isUpdating ? '...' : sf.nextLabel}
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </M>
  );
}
