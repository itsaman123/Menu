import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { useTokens } from '../ThemeContext';

const M = motion.create(Box);
const LOGO_KEY = 'qr_logo_dataurl';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

/* ─── QR Card ─── */
function QRCard({ label, url, logo, T, onDownloadSinglePdf, onRemove }) {
  const canvasRef = useRef(null);

  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const out = document.createElement('canvas');
    const scale = 4;
    out.width  = canvas.width  * scale;
    out.height = canvas.height * scale;
    const ctx = out.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, out.width, out.height);
    const link = document.createElement('a');
    link.download = `qr-${label.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = out.toDataURL('image/png');
    link.click();
  }, [label]);

  return (
    <Box sx={{ bgcolor: T.surface, borderRadius: '1rem', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, boxShadow: T.shadow, transition: 'all 0.2s', position: 'relative', '&:hover': { transform: 'translateY(-2px)', boxShadow: T.shadowHov }, '&:hover .qr-remove': { opacity: 1 } }}>
      {/* Remove button */}
      <Box className="qr-remove" component="button" onClick={onRemove}
        sx={{ position: 'absolute', top: 10, right: 10, opacity: 0, transition: 'opacity 0.15s', width: 24, height: 24, bgcolor: '#ba1a1a', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
      </Box>

      <Box ref={canvasRef} sx={{ p: 2, bgcolor: '#fff', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <QRCodeCanvas
          value={url}
          size={140}
          bgColor="#ffffff"
          fgColor="#1a1a2e"
          level="H"
          marginSize={1}
          imageSettings={logo ? { src: logo, height: 32, width: 32, excavate: true } : undefined}
        />
      </Box>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: T.text, letterSpacing: '-0.01em' }}>{label}</Typography>
      <Typography sx={{ fontSize: '10px', color: T.textMuted, textAlign: 'center', maxWidth: 160, wordBreak: 'break-all', lineHeight: 1.4 }}>{url}</Typography>
      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        <Box component="button" onClick={downloadPng}
          sx={{ flex: 1, py: 1, bgcolor: T.surfaceAlt, border: 'none', borderRadius: '0.5rem', color: T.textSub, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, transition: 'all 0.15s', '&:hover': { bgcolor: T.surfaceHigh } }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>image</span>PNG
        </Box>
        <Box component="button" onClick={onDownloadSinglePdf}
          sx={{ flex: 1, py: 1, bgcolor: T.surfaceAlt, border: 'none', borderRadius: '0.5rem', color: T.textSub, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, transition: 'all 0.15s', '&:hover': { bgcolor: '#f97316', color: '#fff' } }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>picture_as_pdf</span>PDF
        </Box>
      </Box>
    </Box>
  );
}

/* ─── PDF builder ─── */
async function buildPdf(qrList, pdfCanvases, restaurantName, slug, single = false) {
  const { default: jsPDF } = await import('jspdf');

  if (single !== false) {
    const pdf   = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210, pageH = 297;
    const qrMM  = 100;
    const cx    = pageW / 2;
    const qrX   = cx - qrMM / 2;
    const qrY   = pageH / 2 - qrMM / 2 - 15;
    const { label, url } = qrList[single];
    const canvas = pdfCanvases[single];
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');

    pdf.setFillColor(255, 250, 246);
    pdf.rect(0, 0, pageW, pageH, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(130, 130, 130);
    pdf.text(restaurantName.toUpperCase(), cx, qrY - 9, { align: 'center' });
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(220, 220, 230);
    pdf.roundedRect(qrX - 6, qrY - 6, qrMM + 12, qrMM + 12, 4, 4, 'FD');
    pdf.addImage(imgData, 'PNG', qrX, qrY, qrMM, qrMM, undefined, 'NONE');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(26, 26, 46);
    pdf.text(label, cx, qrY + qrMM + 12, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(160, 160, 160);
    pdf.text(url, cx, qrY + qrMM + 19, { align: 'center', maxWidth: 160 });
    pdf.setFontSize(9);
    pdf.setTextColor(249, 115, 22);
    pdf.text('Scan with your phone camera to view the menu', cx, qrY + qrMM + 26, { align: 'center' });
    pdf.save(`qr-${label.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    return;
  }

  const pdf   = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210, pageH = 297;
  const margin = 10;
  const cols = 2, rows = 2;
  const perPage = cols * rows;
  const cellW = (pageW - margin * 2) / cols;
  const cellH = (pageH - margin * 2) / rows;
  const qrMM  = 68;
  const pad   = 5;

  qrList.forEach(({ label, url }, idx) => {
    const posInPage = idx % perPage;
    if (posInPage === 0 && idx > 0) pdf.addPage();
    const col = posInPage % cols;
    const row = Math.floor(posInPage / cols);
    const cxCell = margin + col * cellW + cellW / 2;
    const topY   = margin + row * cellH + pad;

    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(220, 220, 230);
    pdf.roundedRect(margin + col * cellW + pad, topY, cellW - pad * 2, cellH - pad * 2, 3, 3, 'FD');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(150, 150, 150);
    pdf.text(restaurantName.toUpperCase(), cxCell, topY + 9, { align: 'center' });

    const qrY = topY + 13;
    const qrX = cxCell - qrMM / 2;
    const canvas = pdfCanvases[idx];
    if (canvas) pdf.addImage(canvas.toDataURL('image/png'), 'PNG', qrX, qrY, qrMM, qrMM, undefined, 'NONE');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(26, 26, 46);
    pdf.text(label, cxCell, qrY + qrMM + 8, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.5);
    pdf.setTextColor(160, 160, 160);
    pdf.text(url, cxCell, qrY + qrMM + 14, { align: 'center', maxWidth: cellW - 16 });
    pdf.setFontSize(7);
    pdf.setTextColor(249, 115, 22);
    pdf.text('Scan to view menu', cxCell, qrY + qrMM + 20, { align: 'center' });
  });

  pdf.save(`qr-codes-${slug}.pdf`);
}

/* ─── Stepper ─── */
function Stepper({ value, onChange, min = 1, max = 100, T }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box component="button" onClick={() => onChange(Math.max(min, value - 1))}
        sx={{ width: 36, height: 36, bgcolor: T.surfaceAlt, border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: T.text, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, '&:hover': { bgcolor: T.surfaceHigh } }}>−</Box>
      <Box component="input" type="number" min={min} max={max} value={value}
        onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
        sx={{ width: 64, height: 36, textAlign: 'center', bgcolor: T.surfaceAlt, border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 800, fontFamily: 'Inter, sans-serif', color: T.text, outline: 'none', '&:focus': { borderColor: '#f97316' }, '&::-webkit-inner-spin-button': { display: 'none' } }} />
      <Box component="button" onClick={() => onChange(Math.min(max, value + 1))}
        sx={{ width: 36, height: 36, bgcolor: T.surfaceAlt, border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: T.text, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, '&:hover': { bgcolor: T.surfaceHigh } }}>+</Box>
    </Box>
  );
}

/* ─── Main View ─── */
export default function QRGeneratorView() {
  const T      = useTokens();
  const user   = getUser();
  const slug   = user.slug || '';
  const menuBase = `${window.location.origin}/menu/${slug}`;

  const [count, setCount]       = useState(5);
  const [addCount, setAddCount] = useState(1);
  const [withTable, setWithTable] = useState(true);
  const [qrList, setQrList]     = useState([]);
  const [copied, setCopied]     = useState(false);
  const [logo, setLogo]         = useState('');
  const [pdfBusy, setPdfBusy]   = useState(false);

  const gridRef = useRef(null);
  const pdfRef  = useRef(null);

  /* ── Persist & load ── */
  useEffect(() => {
    if (!slug) return;
    try {
      const saved = localStorage.getItem(LOGO_KEY);
      if (saved) setLogo(saved);
    } catch { /* ignore */ }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    try {
      const saved = localStorage.getItem(`qr_list_${slug}`);
      if (saved) setQrList(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    try { localStorage.setItem(`qr_list_${slug}`, JSON.stringify(qrList)); }
    catch { /* ignore */ }
  }, [qrList, slug]);

  /* ── Table helpers ── */
  const tableQRs  = qrList.filter(q => /^Table \d+$/.test(q.label));
  const hasTables = tableQRs.length > 0;
  const tableNums = tableQRs.map(q => parseInt(q.label.replace('Table ', ''))).sort((a, b) => a - b);
  const nextTableNum = hasTables ? tableNums[tableNums.length - 1] + 1 : 1;

  /* ── Generate fresh (replaces all) ── */
  function generateFresh() {
    if (!slug) return;
    if (qrList.length > 0 && !window.confirm(`Replace all ${qrList.length} existing QR code${qrList.length !== 1 ? 's' : ''} and start fresh?`)) return;
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

  /* ── Add more tables (appends, preserving sequence) ── */
  function addMoreTables() {
    if (!slug) return;
    const newItems = Array.from({ length: addCount }, (_, i) => ({
      label: `Table ${nextTableNum + i}`,
      url:   `${menuBase}?table=${nextTableNum + i}`,
    }));
    setQrList(prev => [...prev, ...newItems]);
  }

  /* ── Remove single ── */
  function removeQR(label) {
    setQrList(prev => prev.filter(q => q.label !== label));
  }

  /* ── Clear all ── */
  function clearAll() {
    if (!window.confirm('Remove all QR codes?')) return;
    setQrList([]);
  }

  /* ── Copy URL ── */
  function copyUrl() {
    navigator.clipboard.writeText(menuBase).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  /* ── Logo ── */
  function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      setLogo(dataUrl);
      try { localStorage.setItem(LOGO_KEY, dataUrl); } catch { /* ignore */ }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }
  function removeLogo() {
    setLogo('');
    localStorage.removeItem(LOGO_KEY);
  }

  /* ── Download PNG (all) ── */
  function downloadAllPng() {
    if (!gridRef.current) return;
    gridRef.current.querySelectorAll('canvas').forEach((srcCanvas, i) => {
      const { label } = qrList[i] || {};
      const out = document.createElement('canvas');
      const scale = 4;
      out.width  = srcCanvas.width  * scale;
      out.height = srcCanvas.height * scale;
      const ctx = out.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(srcCanvas, 0, 0, out.width, out.height);
      const link = document.createElement('a');
      link.download = `qr-${(label || `item-${i + 1}`).toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = out.toDataURL('image/png');
      link.click();
    });
  }

  /* ── PDF ── */
  const getPdfCanvases = () => Array.from(pdfRef.current?.querySelectorAll('canvas') || []);

  async function downloadAllPdf() {
    setPdfBusy(true);
    try { await buildPdf(qrList, getPdfCanvases(), user.restaurantName || '', slug); }
    catch (e) { console.error(e); }
    finally { setPdfBusy(false); }
  }

  async function downloadSinglePdf(idx) {
    setPdfBusy(true);
    try { await buildPdf(qrList, getPdfCanvases(), user.restaurantName || '', slug, idx); }
    catch (e) { console.error(e); }
    finally { setPdfBusy(false); }
  }

  /* ─────────── Render ─────────── */
  return (
    <M initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      sx={{ display: 'flex', flexDirection: 'column', color: T.text }}
    >
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#f97316', mb: 1 }}>Administration</Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 900, color: T.text, letterSpacing: '-0.05em', lineHeight: 1 }}>QR Generator</Typography>
        <Typography sx={{ color: T.textSub, mt: 1.5, fontSize: '1rem' }}>
          QR codes are saved automatically — add more tables any time without losing existing ones.
        </Typography>
      </Box>

      {/* Menu URL Card */}
      <Box sx={{ bgcolor: T.surface, borderRadius: '1rem', p: 4, mb: 3, boxShadow: T.shadow }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>Your Public Menu URL</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 200, px: 2.5, py: 1.5, bgcolor: T.surfaceAlt, borderRadius: '0.75rem', fontFamily: 'monospace', fontSize: '0.9rem', color: T.accent, fontWeight: 600, wordBreak: 'break-all' }}>{menuBase}</Box>
          <Box component="button" onClick={copyUrl}
            sx={{ px: 3, py: 1.5, bgcolor: copied ? '#6cf8bb' : T.surfaceAlt, color: copied ? '#00714d' : T.textSub, border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 1, transition: 'all 0.2s', '&:hover': { bgcolor: copied ? '#6cf8bb' : T.surfaceHigh }, flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{copied ? 'check' : 'content_copy'}</span>
            {copied ? 'Copied!' : 'Copy URL'}
          </Box>
          <Box component="a" href={menuBase} target="_blank" rel="noopener noreferrer"
            sx={{ px: 3, py: 1.5, bgcolor: '#f97316', color: '#fff', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', flexShrink: 0, transition: 'opacity 0.2s', '&:hover': { opacity: 0.9 } }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
            Open Menu
          </Box>
        </Box>
      </Box>

      {/* Logo Customization */}
      <Box sx={{ bgcolor: T.surface, borderRadius: '1rem', p: 4, mb: 3, boxShadow: T.shadow }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: T.text, mb: 0.25 }}>Restaurant Logo</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: T.textSub }}>Appears centered inside every QR code. Use a square PNG or SVG for best results.</Typography>
          </Box>
          {logo && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: '9999px', px: 2, py: 0.5 }}>
              <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: 14 }}>check_circle</span>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a' }}>Logo active</Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          {logo && (
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Box component="img" src={logo} alt="Logo preview" sx={{ width: 72, height: 72, borderRadius: '0.75rem', objectFit: 'contain', border: `1.5px solid ${T.surfaceHigh}`, bgcolor: '#fff', p: 1, display: 'block' }} />
              <Box component="button" onClick={removeLogo} sx={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, bgcolor: '#ba1a1a', color: '#fff', border: '2px solid #fff', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
              </Box>
            </Box>
          )}
          {logo && (
            <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flexShrink: 0 }}>
              <QRCodeCanvas value={menuBase || 'https://example.com'} size={80} bgColor="#ffffff" fgColor="#1a1a2e" level="H" marginSize={1} imageSettings={{ src: logo, height: 18, width: 18, excavate: true }} />
            </Box>
          )}
          <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 1.5, bgcolor: T.surfaceAlt, border: `1.5px dashed ${T.surfaceHigh}`, borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.15s', '&:hover': { borderColor: '#f97316', bgcolor: 'rgba(249,115,22,0.04)' } }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: T.textMuted }}>add_photo_alternate</span>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: T.textSub }}>{logo ? 'Change Logo' : 'Upload Logo'}</Typography>
            <Box component="input" type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleLogoUpload} sx={{ display: 'none' }} />
          </Box>
          {!logo && <Typography sx={{ fontSize: '0.8rem', color: T.textMuted, maxWidth: 260 }}>QR uses error-correction level H — allows up to 30% coverage, ideal for logos.</Typography>}
        </Box>
      </Box>

      {/* ── QR Controls ── */}
      <Box sx={{ bgcolor: T.surface, borderRadius: '1rem', p: 4, mb: 5, boxShadow: T.shadow }}>

        {/* ── State: has tables → show add-more UI ── */}
        {hasTables ? (
          <>
            {/* Summary bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: T.surfaceAlt, borderRadius: '0.875rem', mb: 3.5, flexWrap: 'wrap' }}>
              <Box sx={{ width: 40, height: 40, bgcolor: 'rgba(249,115,22,0.12)', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: 22 }}>table_restaurant</span>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800, color: T.text, fontSize: '0.95rem' }}>
                  Table {tableNums[0]} – {tableNums[tableNums.length - 1]}
                  <Box component="span" sx={{ ml: 1.5, fontWeight: 700, fontSize: '0.8rem', color: T.textSub }}>· {tableQRs.length} QR code{tableQRs.length !== 1 ? 's' : ''}</Box>
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: T.textMuted, mt: 0.25 }}>Saved · persists across sessions</Typography>
              </Box>
              <Box component="button" onClick={clearAll}
                sx={{ px: 2, py: 0.875, bgcolor: 'rgba(186,26,26,0.08)', color: '#ba1a1a', border: '1px solid rgba(186,26,26,0.2)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, '&:hover': { bgcolor: 'rgba(186,26,26,0.14)' } }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>Clear all
              </Box>
            </Box>

            {/* Add more tables */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tables to add</Typography>
                <Stepper value={addCount} onChange={setAddCount} T={T} />
              </Box>

              {/* Preview label */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Will create</Typography>
                <Box sx={{ px: 2, py: 0.875, height: 36, bgcolor: T.surfaceAlt, borderRadius: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: T.text }}>
                    Table {nextTableNum}{addCount > 1 ? ` – ${nextTableNum + addCount - 1}` : ''}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'transparent', textTransform: 'uppercase', letterSpacing: '0.07em' }}>·</Typography>
                <Box component="button" onClick={addMoreTables} disabled={!slug}
                  sx={{ px: 3.5, py: 0.875, height: 36, background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 1, boxShadow: '0 4px 14px rgba(249,115,22,0.3)', '&:hover': { opacity: 0.9 } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                  Add {addCount} Table{addCount !== 1 ? 's' : ''}
                </Box>
              </Box>
            </Box>

            {/* Divider + regenerate from scratch */}
            <Box sx={{ borderTop: `1px solid ${T.surfaceHigh}`, pt: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Regenerate from Table 1</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Stepper value={count} onChange={setCount} T={T} />
                    <Box component="button" onClick={generateFresh} disabled={!slug}
                      sx={{ px: 2.5, py: 0.875, height: 36, bgcolor: T.surfaceAlt, color: T.textSub, border: `1px solid ${T.surfaceHigh}`, borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 0.75, '&:hover': { bgcolor: T.surfaceHigh } }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
                      Regenerate
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: T.textMuted }}>This replaces all existing QR codes</Typography>
            </Box>
          </>
        ) : (
          /* ── State: no QRs yet → initial setup ── */
          <>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: T.text, mb: 3 }}>Generate QR Codes</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-end' }}>
              {/* Type toggle */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.07em' }}>QR Type</Typography>
                <Box sx={{ display: 'flex', bgcolor: T.surfaceAlt, borderRadius: '0.75rem', p: 0.5, gap: 0.5 }}>
                  {[{ label: 'Per Table', value: true }, { label: 'Single Menu', value: false }].map(opt => (
                    <Box key={String(opt.value)} component="button" onClick={() => setWithTable(opt.value)}
                      sx={{ px: 2.5, py: 1, borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700, bgcolor: withTable === opt.value ? '#f97316' : 'transparent', color: withTable === opt.value ? '#fff' : T.textSub, transition: 'all 0.15s' }}>
                      {opt.label}
                    </Box>
                  ))}
                </Box>
              </Box>

              {withTable && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Number of Tables</Typography>
                  <Stepper value={count} onChange={setCount} T={T} />
                </Box>
              )}

              <Box component="button" onClick={generateFresh} disabled={!slug}
                sx={{ px: 4, py: 1.5, background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', borderRadius: '0.75rem', cursor: slug ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 1, boxShadow: '0 10px 20px rgba(249,115,22,0.2)', opacity: slug ? 1 : 0.5, transition: 'opacity 0.2s', '&:hover': { opacity: slug ? 0.9 : 0.5 } }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>qr_code_2</span>
                Generate {withTable ? `${count} QR Code${count !== 1 ? 's' : ''}` : 'QR Code'}
              </Box>
            </Box>
            {!slug && <Typography sx={{ mt: 2, fontSize: '0.8rem', color: '#ba1a1a', fontWeight: 600 }}>No restaurant slug found. Please log out and log in again.</Typography>}
          </>
        )}
      </Box>

      {/* ── QR Grid ── */}
      <AnimatePresence>
        {qrList.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Grid header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: T.text }}>
                {qrList.length} QR Code{qrList.length !== 1 ? 's' : ''}
                {logo && <Box component="span" sx={{ ml: 1.5, fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', bgcolor: 'rgba(22,163,74,0.1)', px: 1.25, py: 0.25, borderRadius: '9999px' }}>Logo included</Box>}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Box component="button" onClick={downloadAllPng}
                  sx={{ px: 3, py: 1.25, bgcolor: T.surfaceAlt, color: T.textSub, border: `1.5px solid ${T.surfaceHigh}`, borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 1, transition: 'all 0.15s', '&:hover': { bgcolor: T.surfaceHigh } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>image</span>All PNG
                </Box>
                <Box component="button" onClick={downloadAllPdf} disabled={pdfBusy}
                  sx={{ px: 3, py: 1.25, bgcolor: pdfBusy ? T.surfaceHigh : '#f97316', color: pdfBusy ? T.textMuted : '#fff', border: 'none', borderRadius: '0.75rem', cursor: pdfBusy ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 1, transition: 'all 0.15s', '&:hover': { opacity: pdfBusy ? 1 : 0.9 } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
                  {pdfBusy ? 'Generating…' : 'All PDF'}
                </Box>
              </Box>
            </Box>

            {/* Cards */}
            <Box ref={gridRef} sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)', xl: 'repeat(5,1fr)' }, gap: 3 }}>
              {qrList.map(({ label, url }, idx) => (
                <QRCard key={label} label={label} url={url} logo={logo} T={T}
                  onDownloadSinglePdf={() => downloadSinglePdf(idx)}
                  onRemove={() => removeQR(label)}
                />
              ))}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: T.surfaceAlt, borderRadius: '0.75rem', p: 2.5 }}>
              <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: 18 }}>info</span>
              <Typography sx={{ fontSize: '0.8rem', color: T.textSub }}>
                QR codes are <strong>saved to this browser</strong>. PDF exports at 800px (~290 DPI) — suitable for professional printing.
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden high-res canvases for PDF (800px) */}
      <Box ref={pdfRef} aria-hidden="true" sx={{ position: 'fixed', top: -99999, left: -99999, pointerEvents: 'none', zIndex: -1 }}>
        {qrList.map(({ label, url }) => (
          <QRCodeCanvas key={label} value={url} size={800} bgColor="#ffffff" fgColor="#1a1a2e" level="H" marginSize={2}
            imageSettings={logo ? { src: logo, height: 176, width: 176, excavate: true } : undefined} />
        ))}
      </Box>
    </M>
  );
}
