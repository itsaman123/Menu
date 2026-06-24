import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF } from './menuflow/mfTheme';

const M = motion.create(Box);
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp  = { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } } };

const SHORTCUTS = [
  { icon: 'help',      title: 'Help Center',      desc: 'Browse documentation and tutorials to master every ScanIt feature at your pace.', link: 'Explore Docs →',    color: MF.primary,   bg: `${MF.primary}15`   },
  { icon: 'chat',      title: 'Sales Chat',        desc: 'Instant answers for pricing, capabilities, and enterprise integration questions.',  link: 'Start Chatting →',  color: '#7c3aed',    bg: '#7c3aed15'         },
  { icon: 'handshake', title: 'Partner Program',   desc: 'Collaborate with us or join our integration ecosystem and reseller network.',       link: 'Learn More →',      color: '#059669',    bg: '#05906915'         },
];

const OFFICES = [
  { city: 'San Francisco, CA', sub: 'Headquarters & Engineering' },
  { city: 'London, UK',        sub: 'European Operations' },
  { city: 'Singapore',         sub: 'Asia-Pacific Support' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [focused,   setFocused]   = useState('');
  const [hovered,   setHovered]   = useState(null);

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
    <Box sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
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

      {/* ── Form + Sidebar ── */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3 }}>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
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
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setSubmitted(false)} style={{ marginTop: 28, background: 'transparent', border: `1.5px solid ${MF.outlineVar}`, color: MF.text, padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        Send Another
                      </motion.button>
                    </Box>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Box component="form" onSubmit={e => { e.preventDefault(); setSubmitted(true); }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                        {[
                          { field: 'name',  label: 'Full Name',      type: 'text',  placeholder: 'John Doe' },
                          { field: 'email', label: 'Work Email',      type: 'email', placeholder: 'john@restaurant.com' },
                        ].map(({ field, label: lbl, type, placeholder }) => (
                          <Box key={field}>
                            <Typography component="label" sx={label(field)}>{lbl}</Typography>
                            <Box component="input" type={type} placeholder={placeholder} required
                              onFocus={() => setFocused(field)} onBlur={() => setFocused('')} sx={inputSx} />
                          </Box>
                        ))}
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                        <Box>
                          <Typography component="label" sx={label('restaurant')}>Restaurant Name</Typography>
                          <Box component="input" type="text" placeholder="The Gilded Table" required
                            onFocus={() => setFocused('restaurant')} onBlur={() => setFocused('')} sx={inputSx} />
                        </Box>
                        <Box>
                          <Typography component="label" sx={label('locations')}>Estimated Locations</Typography>
                          <Box component="select" onFocus={() => setFocused('locations')} onBlur={() => setFocused('')} sx={{ ...inputSx, cursor: 'pointer', appearance: 'auto' }}>
                            {['1-5', '6-20', '20-50', '50+'].map(o => <option key={o} value={o}>{o}</option>)}
                          </Box>
                        </Box>
                      </Box>
                      <Box>
                        <Typography component="label" sx={label('message')}>Message</Typography>
                        <Box component="textarea" rows={5} placeholder="Tell us about your needs and current setup..." required
                          onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
                          sx={{ ...inputSx, resize: 'vertical', minHeight: 120 }} />
                      </Box>
                      <motion.button type="submit" whileHover={{ scale: 1.02, boxShadow: '0 16px 48px rgba(249,115,22,0.45)' }} whileTap={{ scale: 0.97 }}
                        style={{ alignSelf: 'flex-start', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', padding: '15px 36px', borderRadius: 14, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 10px 30px rgba(249,115,22,0.35)' }}>
                        Send Inquiry →
                      </motion.button>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Book Demo */}
              <Box sx={{ background: MF.gradient, color: '#fff', borderRadius: '28px', p: 5, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent)', pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '100px', px: 1.5, py: 0.5, mb: 2.5 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
                    <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Available now</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 800, mb: 1.5, letterSpacing: '-0.02em' }}>Book a Personal Demo</Typography>
                  <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.7 }}>See how ScanIt transforms your specific workflow with a 30-minute expert walkthrough.</Typography>
                  {/* Mini calendar visual */}
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: '16px', p: 2.5, border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>June 2026</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {['chevron_left','chevron_right'].map(ic => <span key={ic} className="material-symbols-outlined" style={{ cursor: 'pointer', fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>{ic}</span>)}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 0.5, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.6)', mb: 1 }}>
                      {['MO','TU','WE','TH','FR','SA','SU'].map(d => <Box key={d}>{d}</Box>)}
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 0.5, textAlign: 'center', fontSize: 12 }}>
                      {[18,19,20,21,22,23,24,25,26,27,28,29,30].map(d => (
                        <Box key={d} sx={{ p: 0.75, borderRadius: '8px', cursor: 'pointer', color: '#fff', ...(d === 19 ? { background: 'rgba(255,255,255,0.3)', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } : { '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }, color: 'rgba(255,255,255,0.7)' }) }}>{d}</Box>
                      ))}
                    </Box>
                  </Box>
                  <motion.button whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }} whileTap={{ scale: 0.97 }}
                    style={{ marginTop: 20, width: '100%', background: '#fff', color: MF.primary, padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Schedule 30-min Call
                  </motion.button>
                </Box>
              </Box>

              {/* Trust */}
              <Box sx={{ background: '#fff', border: '1px solid rgba(228,228,231,0.6)', borderRadius: '24px', p: 4 }}>
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

      {/* ── Shortcuts (Pin-style hover) ── */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 }, bgcolor: MF.surfaceLow }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>More ways to connect</Typography>
              <Typography sx={{ fontSize: { xs: 28, md: 44 }, fontWeight: 900, letterSpacing: '-0.035em', fontFamily: 'Manrope, Inter, sans-serif' }}>Quick access to help</Typography>
            </Box>
          </M>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3 }}>
            {SHORTCUTS.map(({ icon, title, desc, link, color, bg }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                onMouseEnter={() => setHovered(title)} onMouseLeave={() => setHovered(null)}
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

      {/* ── Global Presence ── */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 10, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Global presence</Typography>
            <Typography sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 900, letterSpacing: '-0.03em', mb: 3, lineHeight: 1.15, fontFamily: 'Manrope, Inter, sans-serif' }}>We're global,<br />across every time zone</Typography>
            <Typography sx={{ fontSize: 16, color: MF.textSub, mb: 5.5, lineHeight: 1.75 }}>
              Our remote-first team operates from strategic hubs, providing round-the-clock support for hospitality groups worldwide.
            </Typography>
            {OFFICES.map(({ city, sub }, i) => (
              <motion.div key={city} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3.5, pb: 3.5, borderBottom: i < OFFICES.length - 1 ? `1px solid ${MF.outlineVar}40` : 'none' }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: `${MF.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25 }}>
                    <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 18, fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.25 }}>{city}</Typography>
                    <Typography sx={{ fontSize: 13, color: MF.textSub }}>{sub}</Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
            <Box sx={{ position: 'relative', height: 420, borderRadius: '32px', overflow: 'hidden', bgcolor: MF.surfaceLow, border: `1px solid ${MF.outlineVar}` }}>
              <Box component="img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAigX9arg18cCXrmR75rL3VXkojvqv7qoGmgP75hX7U2TtS6QgOU1ZV_q7m1dA0zVD556dl_kg6ZqPaNZESo7VuIVf6gPqOC3Xe9MjuicXvHkPVlaNVsHSSJJ1lJLk9cNj_JW4jGiOO53r1TuCDckFAWa28-znoH698BQF5MAjueZ1_L9Wh35fGDypEeTFh-PC-TWKwaBYZL9BJ_djcIle9THIS1gav5n8-sp9nsJWHJlrecr94bukvHcrKPUxVQRgyeqy-0OnZ5eAk"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, filter: 'grayscale(0.6) sepia(0.2)' }}
              />
              {/* Glowing pulse dots */}
              {[
                { top: '28%', left: '22%' },
                { top: '35%', left: '52%', delay: '0.8s' },
                { bottom: '30%', right: '22%', delay: '1.6s' },
              ].map((pos, i) => (
                <Box key={i} sx={{ position: 'absolute', ...pos }}>
                  <Box sx={{ width: 14, height: 14, bgcolor: MF.primary, borderRadius: '50%', animation: `ping 2s ${pos.delay || '0s'} infinite`, opacity: 0.5, position: 'absolute', top: 0, left: 0 }} />
                  <Box sx={{ width: 14, height: 14, bgcolor: MF.primary, borderRadius: '50%', position: 'absolute', top: 0, left: 0, boxShadow: `0 0 12px 3px ${MF.primary}80` }} />
                </Box>
              ))}
              <style>{`@keyframes ping { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(2.5);opacity:0} }`}</style>
            </Box>
          </motion.div>
        </Box>
      </Box>

      <MenuFlowFooter />
    </Box>
  );
}
