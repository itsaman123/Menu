import React, { useState, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { useTokens } from '../ThemeContext';

const M = motion.create(Box);

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

function QRCard({ label, url, T }) {
  const canvasRef = useRef(null);

  const download = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${label.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [label]);

  return (
    <Box sx={{
      bgcolor: T.surface, borderRadius: '1rem', p: 3, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 2, boxShadow: T.shadow,
      transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: T.shadowHov },
    }}>
      <Box ref={canvasRef} sx={{
        p: 2, bgcolor: '#fff', borderRadius: '0.75rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <QRCodeCanvas
          value={url}
          size={140}
          bgColor="#ffffff"
          fgColor="#1a1a2e"
          level="H"
          marginSize={1}
        />
      </Box>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: T.text, letterSpacing: '-0.01em' }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: '10px', color: T.textMuted, textAlign: 'center',
        maxWidth: 160, wordBreak: 'break-all', lineHeight: 1.4,
      }}>
        {url}
      </Typography>
      <Box
        component="button"
        onClick={download}
        sx={{
          width: '100%', py: 1, bgcolor: T.surfaceAlt, border: 'none', borderRadius: '0.5rem',
          color: T.textSub, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
          transition: 'all 0.15s', '&:hover': { bgcolor: '#5341cd', color: '#fff' },
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
        Download PNG
      </Box>
    </Box>
  );
}

export default function QRGeneratorView() {
  const T = useTokens();
  const user = getUser();
  const slug = user.slug || '';
  const menuBase = `${window.location.origin}/menu/${slug}`;

  const [count, setCount]       = useState(5);
  const [withTable, setWithTable] = useState(true);
  const [qrList, setQrList]     = useState([]);
  const [copied, setCopied]     = useState(false);

  function generate() {
    if (!slug) return;
    const list = [];
    if (!withTable) {
      list.push({ label: user.restaurantName || 'Menu', url: menuBase });
    } else {
      for (let i = 1; i <= count; i++) {
        list.push({ label: `Table ${i}`, url: `${menuBase}?table=${i}` });
      }
    }
    setQrList(list);
  }

  function copyUrl() {
    navigator.clipboard.writeText(menuBase).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const gridRef = useRef(null);

  function downloadAll() {
    if (!gridRef.current) return;
    const canvases = gridRef.current.querySelectorAll('canvas');
    canvases.forEach((canvas, i) => {
      const { label } = qrList[i] || {};
      const link = document.createElement('a');
      link.download = `qr-${(label || `table-${i+1}`).toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  return (
    <M initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      sx={{ display: 'flex', flexDirection: 'column', color: T.text }}
    >
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#5341cd', mb: 1 }}>Administration</Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 900, color: T.text, letterSpacing: '-0.05em', lineHeight: 1 }}>
          QR Generator
        </Typography>
        <Typography sx={{ color: T.textSub, mt: 1.5, fontSize: '1rem' }}>
          Generate QR codes for your tables — customers scan to view your live menu.
        </Typography>
      </Box>

      {/* Menu URL Card */}
      <Box sx={{ bgcolor: T.surface, borderRadius: '1rem', p: 4, mb: 5, boxShadow: T.shadow }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
          Your Public Menu URL
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{
            flex: 1, minWidth: 200, px: 2.5, py: 1.5,
            bgcolor: T.surfaceAlt, borderRadius: '0.75rem',
            fontFamily: 'monospace', fontSize: '0.9rem', color: T.accent,
            fontWeight: 600, wordBreak: 'break-all',
          }}>
            {menuBase}
          </Box>
          <Box
            component="button"
            onClick={copyUrl}
            sx={{
              px: 3, py: 1.5, bgcolor: copied ? '#6cf8bb' : T.surfaceAlt,
              color: copied ? '#00714d' : T.textSub,
              border: 'none', borderRadius: '0.75rem', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: copied ? '#6cf8bb' : T.surfaceHigh },
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied!' : 'Copy URL'}
          </Box>
          <Box
            component="a"
            href={menuBase}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              px: 3, py: 1.5, bgcolor: '#5341cd', color: '#fff',
              border: 'none', borderRadius: '0.75rem', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: 1,
              textDecoration: 'none', flexShrink: 0,
              transition: 'opacity 0.2s', '&:hover': { opacity: 0.9 },
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
            Open Menu
          </Box>
        </Box>
      </Box>

      {/* Generator Controls */}
      <Box sx={{ bgcolor: T.surface, borderRadius: '1rem', p: 4, mb: 5, boxShadow: T.shadow }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: T.text, mb: 3 }}>Generate QR Codes</Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-end' }}>
          {/* Table toggle */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              QR Type
            </Typography>
            <Box sx={{ display: 'flex', bgcolor: T.surfaceAlt, borderRadius: '0.75rem', p: 0.5, gap: 0.5 }}>
              {[
                { label: 'Per Table', value: true },
                { label: 'Single', value: false },
              ].map(opt => (
                <Box
                  key={String(opt.value)}
                  component="button"
                  onClick={() => setWithTable(opt.value)}
                  sx={{
                    px: 2.5, py: 1, borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700,
                    bgcolor: withTable === opt.value ? '#5341cd' : 'transparent',
                    color:   withTable === opt.value ? '#fff'    : T.textSub,
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Count input */}
          {withTable && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Number of Tables
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="button"
                  onClick={() => setCount(c => Math.max(1, c - 1))}
                  sx={{ width: 40, height: 40, bgcolor: T.surfaceAlt, border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: T.text, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, '&:hover': { bgcolor: T.surfaceHigh } }}
                >−</Box>
                <Box
                  component="input"
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={e => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                  sx={{
                    width: 72, height: 40, textAlign: 'center',
                    bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`,
                    borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 800,
                    fontFamily: 'Inter, sans-serif', color: T.text, outline: 'none',
                    '&:focus': { borderColor: '#5341cd' },
                    '&::-webkit-inner-spin-button': { display: 'none' },
                  }}
                />
                <Box
                  component="button"
                  onClick={() => setCount(c => Math.min(100, c + 1))}
                  sx={{ width: 40, height: 40, bgcolor: T.surfaceAlt, border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: T.text, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, '&:hover': { bgcolor: T.surfaceHigh } }}
                >+</Box>
              </Box>
            </Box>
          )}

          {/* Generate button */}
          <Box
            component="button"
            onClick={generate}
            disabled={!slug}
            sx={{
              px: 4, py: 1.5, background: 'linear-gradient(135deg, #5341CD, #6C5CE7)', color: '#fff',
              border: 'none', borderRadius: '0.75rem', cursor: slug ? 'pointer' : 'not-allowed',
              fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: 1,
              boxShadow: '0 10px 20px rgba(83,65,205,0.2)',
              opacity: slug ? 1 : 0.5,
              transition: 'opacity 0.2s', '&:hover': { opacity: slug ? 0.9 : 0.5 },
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>qr_code_2</span>
            Generate {withTable ? `${count} QR Code${count !== 1 ? 's' : ''}` : 'QR Code'}
          </Box>
        </Box>

        {!slug && (
          <Typography sx={{ mt: 2, fontSize: '0.8rem', color: '#ba1a1a', fontWeight: 600 }}>
            No restaurant slug found. Please log out and log in again.
          </Typography>
        )}
      </Box>

      {/* QR Grid */}
      {qrList.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: T.text }}>
              {qrList.length} QR Code{qrList.length !== 1 ? 's' : ''} Ready
            </Typography>
            <Box
              component="button"
              onClick={downloadAll}
              sx={{
                px: 3, py: 1.25, bgcolor: T.surfaceAlt, color: T.textSub,
                border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.75rem', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.8rem', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: 1,
                transition: 'all 0.15s', '&:hover': { bgcolor: '#5341cd', color: '#fff', borderColor: '#5341cd' },
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download_for_offline</span>
              Download All
            </Box>
          </Box>

          <Box
            ref={gridRef}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)', xl: 'repeat(5,1fr)' },
              gap: 3,
            }}
          >
            {qrList.map(({ label, url }) => (
              <QRCard key={label} label={label} url={url} T={T} />
            ))}
          </Box>
        </Box>
      )}
    </M>
  );
}
