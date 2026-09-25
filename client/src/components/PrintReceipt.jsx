import React from 'react';
import { Box, Typography } from '@mui/material';

/* Print-only receipt — invisible on screen, shown only inside @media print */
export default function PrintReceipt({ order, restaurantName }) {
  if (!order) return null;

  // Older orders (placed before per-restaurant GST toggling) don't have subtotal/gstAmount
  // stored — fall back to the old fixed-5% assumption for those.
  const subtotal = order.subtotal ?? order.totalAmount / 1.05;
  const gst      = order.gstAmount ?? order.totalAmount - subtotal;
  const gstRatePct = order.gstRatePct || (gst > 0 ? Math.round((gst / subtotal) * 100) : 0);
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
          Powered by ScanIt
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
        <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', fontWeight: 'bold', flex: 1 }}>Description</Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>Qty</Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', fontWeight: 'bold', width: '55px', textAlign: 'right' }}>Amount</Typography>
      </Box>
      <Box sx={{ borderTop: '1px dashed #000', mb: '2mm' }} />

      {/* Items */}
      {order.items.map((item, i) => (
        <Box key={i} sx={{ mb: '1.5mm' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography sx={{ fontFamily: 'inherit', fontSize: '11px', flex: 1, pr: '2mm', lineHeight: 1.3 }}>
              {item.name}
            </Typography>
            <Typography sx={{ fontFamily: 'inherit', fontSize: '11px', width: '30px', textAlign: 'center' }}>
              {item.quantity}
            </Typography>
            <Typography sx={{ fontFamily: 'inherit', fontSize: '11px', width: '55px', textAlign: 'right' }}>
              {(item.price * item.quantity).toFixed(2)}
            </Typography>
          </Box>
          {item.notes && (
            <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', fontStyle: 'italic', pl: '2mm' }}>
              Note: {item.notes}
            </Typography>
          )}
        </Box>
      ))}

      {order.notes && (
        <>
          <Box sx={{ borderTop: '1px dashed #000', mt: '1mm', mb: '2mm' }} />
          <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', fontWeight: 'bold' }}>ORDER NOTES:</Typography>
          <Typography sx={{ fontFamily: 'inherit', fontSize: '10px', fontStyle: 'italic' }}>{order.notes}</Typography>
        </>
      )}

      <Box sx={{ borderTop: '1px dashed #000', mt: '2mm', mb: '2mm' }} />

      {/* Totals */}
      {[
        { label: 'Subtotal',  value: subtotal.toFixed(2) },
        ...(gst > 0 ? [{ label: `GST (${gstRatePct}%)`, value: gst.toFixed(2) }] : []),
      ].map(row => (
        <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: '1mm' }}>
          <Typography sx={{ fontFamily: 'inherit', fontSize: '11px' }}>{row.label}</Typography>
          <Typography sx={{ fontFamily: 'inherit', fontSize: '11px' }}>{row.value}</Typography>
        </Box>
      ))}

      <Box sx={{ borderTop: '1px solid #000', mt: '2mm', mb: '2mm' }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold' }}>TOTAL</Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold' }}>
          {order.totalAmount.toFixed(2)}
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
