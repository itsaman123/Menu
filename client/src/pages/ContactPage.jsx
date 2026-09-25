import { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF } from './menuflow/mfTheme';
import { API_BASE_URL } from '../environment';
import { SplitHeading, CursorBlob, MagneticButton, useTilt3D, useScrollTriggerReliability, gsap } from './menuflow/ScrollFX';

const M = motion.create(Box);
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } } };

const SHORTCUTS = [
  { icon: 'help', title: 'Help Center', desc: 'Browse documentation and tutorials to master every ScanIt feature at your pace.', link: 'Explore Docs →', color: MF.primary, bg: `${MF.primary}15` },
  { icon: 'chat', title: 'Sales Chat', desc: 'Instant answers for pricing, capabilities, and enterprise integration questions.', link: 'Start Chatting →', color: '#7c3aed', bg: '#7c3aed15' },
  { icon: 'handshake', title: 'Partner Program', desc: 'Collaborate with us or join our integration ecosystem and reseller network.', link: 'Learn More →', color: '#059669', bg: '#05906915' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState('');
  const [hovered, setHovered] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', restaurant: '', locations: '1-5', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const pageRef = useRef(null);
  const trustTilt = useTilt3D(8);

  useScrollTriggerReliability();

  useEffect(() => {
    console.log('[gsap] ScrollTrigger mounted on ContactPage', gsap.version);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await axios.post(`${API_BASE_URL}/api/contact`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `${form.restaurant} (${form.locations} locations)`,
        message: form.message,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputSx = {
    width: '100%', p: '14px 16px',
    bgcolor: MF.surfaceLow, border: `1.5px solid ${focused ? MF.primary : MF.outlineVar}33`,
    borderRadius: '12px', fontSize: 15, fontFamily: 'Inter, sans-serif',
    color: MF.text, outline: 'none',
    '&:focus': { boxShadow: `0 0 0 4px ${MF.primary}14`, bgcolor: MF.surfaceLowest, borderColor: MF.primary },
    transition: 'all 0.2s', display: 'block',
  };

  const label = (field) => ({
    display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: focused === field ? MF.primary : MF.textSub, mb: 1,
    transition: 'color 0.2s',
  });

  return (
    <Box ref={pageRef} sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <CursorBlob />
      <MenuFlowNav />

      {/* ── Hero ── */}
      <Box component="section" sx={{ position: 'relative', minHeight: '56vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #fff7ed 0%, #fffaf6 55%, #fff7ed 100%)', pt: '72px' }}>
        {[
          { top: '-8%', left: '-4%', w: 500, color: `${MF.primary}18`, dur: 20 },
          { bottom: '-8%', right: '-4%', w: 420, color: '#fb923c14', dur: 24, delay: 5 },
        ].map((o, i) => (
          <M key={i} animate={{ x: [0, 50, 0], y: [0, -40, 0] }} transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: o.delay || 0 }}
            sx={{ position: 'absolute', ...o, width: o.w, height: o.w, borderRadius: '50%', background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        ))}
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />

        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 3, md: 6 }, width: '100%', zIndex: 1, textAlign: 'center', py: 12 }}>
          <M initial="hidden" animate="visible" variants={stagger}>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Get In Touch</Typography>
            </M>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: { xs: 38, md: 60, lg: 68 }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.07, mb: 3, color: MF.text, fontFamily: 'Manrope, Inter, sans-serif', maxWidth: 760, mx: 'auto' }}>
                Let's talk about your{' '}
                <Box component="span" sx={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>restaurant.</Box>
              </Typography>
            </M>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: MF.textSub, maxWidth: 560, mx: 'auto', lineHeight: 1.75 }}>
                Whether you're managing a local cafe or a global franchise, we're here to help you scale and improve guest experiences.
              </Typography>
            </M>
          </M>
        </Box>
      </Box>

      {/* ── Form + Sidebar — both now enter with a 3D flip ── */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3 }}>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -40, rotateY: -12 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            style={{ transformPerspective: 1400 }}
          >
            <Box sx={{ background: '#fff', borderRadius: '28px', p: { xs: 4, md: 6 }, border: '1px solid rgba(228,228,231,0.6)', boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}>
              <Typography sx={{ fontSize: 26, fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>Send us a message</Typography>
              <Typography sx={{ fontSize: 14, color: MF.textSub, mb: 5 }}>We respond within one business day.</Typography>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <motion.div animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.6 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#4ade80', display: 'block', marginBottom: 20, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </motion.div>
                      <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 1.5 }}>Message Sent!</Typography>
                      <Typography sx={{ color: MF.textSub, fontSize: 16, lineHeight: 1.7 }}>We'll get back to you within one business day. In the meantime, explore our docs.</Typography>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', restaurant: '', locations: '1-5', message: '' }); }} style={{ marginTop: 28, background: 'transparent', border: `1.5px solid ${MF.outlineVar}`, color: MF.text, padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        Send Another
                      </motion.button>
                    </Box>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                        {[
                          { field: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                          { field: 'email', label: 'Work Email', type: 'email', placeholder: 'john@restaurant.com' },
                        ].map(({ field, label: lbl, type, placeholder }) => (
                          <Box key={field}>
                            <Typography component="label" sx={label(field)}>{lbl}</Typography>
                            <Box component="input" type={type} placeholder={placeholder} required
                              value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                              onFocus={() => setFocused(field)} onBlur={() => setFocused('')} sx={inputSx} />
                          </Box>
                        ))}
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                        <Box>
                          <Typography component="label" sx={label('phone')}>Phone Number</Typography>
                          <Box component="input" type="tel" placeholder="+91 98765 43210" required
                            value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                            onFocus={() => setFocused('phone')} onBlur={() => setFocused('')} sx={inputSx} />
                        </Box>
                        <Box>
                          <Typography component="label" sx={label('restaurant')}>Restaurant Name</Typography>
                          <Box component="input" type="text" placeholder="The Gilded Table" required
                            value={form.restaurant} onChange={e => setForm(p => ({ ...p, restaurant: e.target.value }))}
                            onFocus={() => setFocused('restaurant')} onBlur={() => setFocused('')} sx={inputSx} />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                        <Box>
                          <Typography component="label" sx={label('locations')}>Estimated Locations</Typography>
                          <Box component="select" value={form.locations} onChange={e => setForm(p => ({ ...p, locations: e.target.value }))}
                            onFocus={() => setFocused('locations')} onBlur={() => setFocused('')} sx={{ ...inputSx, cursor: 'pointer', appearance: 'auto' }}>
                            {['1-5', '6-20', '20-50', '50+'].map(o => <option key={o} value={o}>{o}</option>)}
                          </Box>
                        </Box>
                      </Box>
                      <Box>
                        <Typography component="label" sx={label('message')}>Message</Typography>
                        <Box component="textarea" rows={5} placeholder="Tell us about your needs and current setup..." required
                          value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                          onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
                          sx={{ ...inputSx, resize: 'vertical', minHeight: 120 }} />
                      </Box>
                      {error && <Typography sx={{ color: '#dc2626', fontSize: 14, fontWeight: 600 }}>{error}</Typography>}
                      <MagneticButton type="submit" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
                        {submitting ? 'Sending…' : 'Send Inquiry →'}
                      </MagneticButton>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </motion.div>

          {/* Sidebar — 3D mouse-tilt trust card */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: 12 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            style={{ transformPerspective: 1400 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                ref={trustTilt.ref}
                {...trustTilt.handlers}
                component={motion.div}
                style={{ rotateX: trustTilt.rotateX, rotateY: trustTilt.rotateY, transformStyle: 'preserve-3d' }}
                sx={{ background: '#fff', border: '1px solid rgba(228,228,231,0.6)', borderRadius: '24px', p: 4 }}
              >
                <Box sx={{ width: 46, height: 46, borderRadius: '14px', bgcolor: `${MF.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                  <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 26, fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </Box>
                <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 1 }}>Trust & Security</Typography>
                <Typography sx={{ fontSize: 14, color: MF.textSub, lineHeight: 1.7, mb: 3 }}>Your data is encrypted and secure. We comply with global hospitality data standards including GDPR and CCPA.</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                  <Typography sx={{ fontWeight: 700, color: MF.primary, fontSize: 14 }}>Read Security Whitepaper</Typography>
                  <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 18 }}>arrow_forward</span>
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* ── Shortcuts — full 3D flip-up entrance ── */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 }, bgcolor: MF.surfaceLow }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>More ways to connect</Typography>
              <SplitHeading text="Quick access to help" sx={{ fontSize: { xs: 28, md: 44 }, fontWeight: 900, letterSpacing: '-0.035em', fontFamily: 'Manrope, Inter, sans-serif' }} />
            </Box>
          </M>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3 }}>
            {SHORTCUTS.map(({ icon, title, desc, link, color, bg }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 60, rotateX: -40, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                transition={{ duration: 0.75, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                onMouseEnter={() => setHovered(title)} onMouseLeave={() => setHovered(null)}
                style={{ transformPerspective: 1200 }}
              >
                <Box sx={{ background: '#fff', border: hovered === title ? `1px solid ${color}45` : '1px solid rgba(228,228,231,0.6)', borderRadius: '24px', p: { xs: 4, md: 5 }, boxShadow: hovered === title ? `0 20px 50px ${color}15` : '0 8px 24px rgba(0,0,0,0.04)', transition: 'border-color 0.3s, box-shadow 0.3s', height: '100%' }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: '16px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, border: `1px solid ${color}25` }}>
                    <span className="material-symbols-outlined" style={{ color, fontSize: 26, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </Box>
                  <Typography sx={{ fontSize: 19, fontWeight: 700, mb: 1.5 }}>{title}</Typography>
                  <Typography sx={{ fontSize: 14, color: MF.textSub, mb: 3.5, lineHeight: 1.7 }}>{desc}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography component="a" href="#" sx={{ fontSize: 14, fontWeight: 700, color, textDecoration: 'none' }}>{link}</Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>

      <MenuFlowFooter />
    </Box>
  );
}