import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF, glass } from './menuflow/mfTheme';

const inputSx = {
  width: '100%', p: 2, bgcolor: MF.surfaceLow, border: 'none',
  borderRadius: '12px', fontSize: 15, fontFamily: 'Inter, sans-serif',
  color: MF.text, outline: 'none',
  '&:focus': { boxShadow: `0 0 0 4px ${MF.primary}1A`, bgcolor: MF.surfaceLowest },
  transition: 'all 0.2s',
};

const SHORTCUTS = [
  { icon: 'help',      title: 'Help Center',       desc: 'Browse our documentation and tutorials to master MenuFlow.',           link: 'Explore Docs →',    color: MF.tertiary,   bg: `${MF.tertiary}1A` },
  { icon: 'chat',      title: 'Sales Chat',         desc: 'Instant answers for pricing and platform capability questions.',        link: 'Start Chatting →',  color: MF.secondary,  bg: `${MF.secondary}1A` },
  { icon: 'handshake', title: 'Partner Inquiries',  desc: 'Collaborate with us or join our integration ecosystem.',               link: 'Partner Program →', color: MF.primary,    bg: `${MF.primary}1A` },
];

export default function ContactPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const labelSx = (field) => ({
    display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: focused === field ? MF.primary : MF.textSub, mb: 0.75,
    transition: 'color 0.2s',
  });

  return (
    <Box sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <MenuFlowNav />
      <Box component="main" sx={{ pt: '72px' }}>

        {/* Hero */}
        <Box component="section" sx={{ py: 10, px: 6, textAlign: 'center' }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Get In Touch</Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: 36, md: 48 }, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, mb: 2 }}>
              Let&apos;s talk about your restaurant.
            </Typography>
            <Typography sx={{ fontSize: 18, color: MF.textSub, maxWidth: 580, mx: 'auto', lineHeight: 1.65 }}>
              Whether you're managing a local cafe or a global franchise, we're here to help you scale your operations and improve guest experiences.
            </Typography>
          </Box>
        </Box>

        {/* Main grid: Form + Sidebar */}
        <Box component="section" sx={{ pb: 10, px: 6 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3 }}>

            {/* Contact Form */}
            <Box sx={{ bgcolor: MF.surfaceLowest, borderRadius: '24px', p: { xs: 4, md: 6 }, border: `1px solid ${MF.outlineVar}33`, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <Typography variant="h3" sx={{ fontSize: 24, fontWeight: 600, mb: 5 }}>Send us a message</Typography>
              {submitted ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 56, color: MF.primary, display: 'block', marginBottom: 16 }}>check_circle</span>
                  <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 1 }}>Message Sent!</Typography>
                  <Typography sx={{ color: MF.textSub }}>We'll get back to you within one business day.</Typography>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography component="label" sx={labelSx('name')}>Full Name</Typography>
                      <Box component="input" type="text" placeholder="John Doe" required
                        onFocus={() => setFocused('name')} onBlur={() => setFocused('')} sx={inputSx} />
                    </Box>
                    <Box>
                      <Typography component="label" sx={labelSx('email')}>Work Email</Typography>
                      <Box component="input" type="email" placeholder="john@restaurant.com" required
                        onFocus={() => setFocused('email')} onBlur={() => setFocused('')} sx={inputSx} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography component="label" sx={labelSx('restaurant')}>Restaurant Name</Typography>
                      <Box component="input" type="text" placeholder="The Gilded Table" required
                        onFocus={() => setFocused('restaurant')} onBlur={() => setFocused('')} sx={inputSx} />
                    </Box>
                    <Box>
                      <Typography component="label" sx={labelSx('locations')}>Estimated Locations</Typography>
                      <Box component="select" onFocus={() => setFocused('locations')} onBlur={() => setFocused('')} sx={{ ...inputSx, cursor: 'pointer' }}>
                        {['1-5', '6-20', '20-50', '50+'].map(o => <option key={o} value={o}>{o}</option>)}
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    <Typography component="label" sx={labelSx('message')}>Message</Typography>
                    <Box component="textarea" rows={4} placeholder="Tell us about your needs..." required
                      onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
                      sx={{ ...inputSx, resize: 'vertical', minHeight: 100 }} />
                  </Box>
                  <Box component="button" type="submit" sx={{
                    alignSelf: 'flex-start', background: `linear-gradient(135deg, ${MF.primary} 0%, ${MF.secondary} 100%)`,
                    color: '#fff', px: 5, py: 1.75, borderRadius: '12px', fontWeight: 700, fontSize: 15,
                    border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    boxShadow: `0 8px 20px ${MF.primary}33`, transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' }, '&:active': { transform: 'scale(0.97)' },
                  }}>Send Inquiry</Box>
                </Box>
              )}
            </Box>

            {/* Sidebar */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Book Demo */}
              <Box sx={{ bgcolor: MF.primary, color: '#fff', borderRadius: '24px', p: 5, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h3" sx={{ fontSize: 24, fontWeight: 600, mb: 1.5 }}>Book a Personal Demo</Typography>
                  <Typography sx={{ fontSize: 15, opacity: 0.9, mb: 4, lineHeight: 1.65 }}>
                    See how MenuFlow can transform your specific workflow with a 30-minute expert walkthrough.
                  </Typography>
                  {/* Calendar visual */}
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '12px', p: 2.5, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 15 }}>November 2024</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {['chevron_left','chevron_right'].map(i => <span key={i} className="material-symbols-outlined" style={{ cursor: 'pointer', fontSize: 20 }}>{i}</span>)}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 0.5, textAlign: 'center', fontSize: 10, opacity: 0.7, mb: 1 }}>
                      {['MO','TU','WE','TH','FR','SA','SU'].map(d => <Box key={d}>{d}</Box>)}
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 0.5, textAlign: 'center', fontSize: 12 }}>
                      {['28','29','30','31','','',''].map((d, i) => <Box key={i} sx={{ p: 0.5, opacity: d ? 0.3 : 0 }}>{d}</Box>)}
                      {[1,2,3,4,5,6,7,8,9,10].map(d => (
                        <Box key={d} sx={{ p: 0.5, borderRadius: '8px', cursor: 'pointer', ...(d === 4 ? { bgcolor: MF.secondary, color: '#fff', outline: '2px solid rgba(255,255,255,0.5)' } : { '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }) }}>{d}</Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ position: 'absolute', right: -48, bottom: -48, width: 192, height: 192, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
              </Box>

              {/* Trust */}
              <Box sx={{ bgcolor: MF.surfaceHigh, borderRadius: '24px', p: 5, border: `1px solid ${MF.outlineVar}33`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, color: MF.primary, display: 'block', marginBottom: 12 }}>verified_user</span>
                  <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 1 }}>Trust & Security</Typography>
                  <Typography sx={{ fontSize: 15, color: MF.textSub, lineHeight: 1.65 }}>Your data is encrypted and secure. We comply with global hospitality standards.</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: MF.primary, fontWeight: 700, cursor: 'pointer', mt: 4, '&:hover span': { transform: 'translateX(4px)' } }}>
                  <Typography sx={{ fontWeight: 700, color: MF.primary }}>Read Security Whitepaper</Typography>
                  <span className="material-symbols-outlined" style={{ transition: 'transform 0.2s' }}>arrow_forward</span>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Support shortcuts */}
        <Box component="section" sx={{ py: 10, px: 6, bgcolor: MF.surfaceLow }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 1 }}>More ways to connect</Typography>
              <Typography sx={{ color: MF.textSub }}>Quick access to the help you need.</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3 }}>
              {SHORTCUTS.map(({ icon, title, desc, link, color, bg }) => (
                <Box key={title} sx={{
                  bgcolor: MF.surfaceLowest, p: 5, borderRadius: '24px',
                  border: `1px solid ${MF.outlineVar}33`, transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 10px 30px rgba(0,0,0,0.08)', transform: 'translateY(-4px)' },
                }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <span className="material-symbols-outlined">{icon}</span>
                  </Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 1.5 }}>{title}</Typography>
                  <Typography sx={{ fontSize: 15, color: MF.textSub, mb: 3, lineHeight: 1.65 }}>{desc}</Typography>
                  <Typography component="a" href="#" sx={{ fontSize: 15, fontWeight: 700, color: MF.primary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{link}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Locations */}
        <Box component="section" sx={{ py: 10, px: 6 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 8, alignItems: 'center' }}>
            <Box>
              <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 2 }}>Global Presence</Typography>
              <Typography sx={{ fontSize: 17, color: MF.textSub, mb: 5, lineHeight: 1.65 }}>
                While we are remote-first, our strategic hubs allow us to support hospitality groups across every time zone.
              </Typography>
              {[
                { city: 'San Francisco, CA', sub: 'Headquarters & Engineering' },
                { city: 'London, UK',        sub: 'European Operations' },
                { city: 'Singapore',         sub: 'Asia-Pacific Support' },
              ].map(({ city, sub }) => (
                <Box key={city} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <span className="material-symbols-outlined" style={{ color: MF.primary, marginTop: 2 }}>location_on</span>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{city}</Typography>
                    <Typography sx={{ fontSize: 13, color: MF.textSub }}>{sub}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box sx={{ position: 'relative', height: 400, borderRadius: '32px', overflow: 'hidden', bgcolor: MF.surfaceHighest, border: `1px solid ${MF.outlineVar}4D` }}>
              <Box component="img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAigX9arg18cCXrmR75rL3VXkojvqv7qoGmgP75hX7U2TtS6QgOU1ZV_q7m1dA0zVD556dl_kg6ZqPaNZESo7VuIVf6gPqOC3Xe9MjuicXvHkPVlaNVsHSSJJ1lJLk9cNj_JW4jGiOO53r1TuCDckFAWa28-znoH698BQF5MAjueZ1_L9Wh35fGDypEeTFh-PC-TWKwaBYZL9BJ_djcIle9THIS1gav5n8-sp9nsJWHJlrecr94bukvHcrKPUxVQRgyeqy-0OnZ5eAk"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)', opacity: 0.4, mixBlendMode: 'multiply' }}
              />
              {/* Pulse dots */}
              {[{ top: '25%', left: '25%' }, { top: '33%', left: '50%', delay: '1s' }, { bottom: '33%', right: '25%', delay: '0.5s' }].map((pos, i) => (
                <Box key={i} sx={{ position: 'absolute', ...pos }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: MF.primary, borderRadius: '50%', animation: `ping 1.5s ${pos.delay || '0s'} infinite` }} />
                  <Box sx={{ position: 'absolute', top: 0, left: 0, width: 12, height: 12, bgcolor: MF.primary, borderRadius: '50%' }} />
                </Box>
              ))}
              <style>{`@keyframes ping { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(2)} }`}</style>
            </Box>
          </Box>
        </Box>
      </Box>
      <MenuFlowFooter />
    </Box>
  );
}
