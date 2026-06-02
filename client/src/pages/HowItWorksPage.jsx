import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF, glass } from './menuflow/mfTheme';

const M = motion.create(Box);
const reveal = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };

const STEPS = [
  { n: '01', title: 'Quick Signup',       desc: 'Join the MenuFlow ecosystem in seconds. No credit card required. Just your restaurant name and basic details.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC09UE7TRgNlKGWGLnCDeqtwv-_uIcCQ4obA10zGhL1FWxq_EAbhK7pd7RFqV2IAXMC1sS7SAFzpwbpPXAo5A9JosGxr5pTYVZLssH9ulwQpLXzCUEjefwHAeoAwXkE9NvhoZK16QnQp2kBIBzYxB30_jAyAYSP1qzs2nvUEeO1S0CbKNv80HOlXn0gO2cr-N3uQPhZNFtOcyQPAq01VY4T3EnI7ow8rypbfz6jjgo-GhfLENYSmNJDESTDMEKiqHXqaVvmEUMdD2LT',
    accent: MF.primary },
  { n: '02', title: 'Setup Your Menu',    desc: 'Use our intuitive drag-and-drop editor to build your menu. Upload high-res imagery, set dynamic pricing, and organize items.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFA0q0AHje19zFzzR0gN_WkMbp6DaMG-wwtcpUBCxDPKq__LE6ZuPsTA3wROGpoG6XqB6xQ7JaplN0223Fy77hUH-CAGRdJBvVAlE-5QzCSq-aiyuuB9CN0EtcaWAEGiW1bXfhhuCAm5ZDrKjG6IzLEO5pKnluS7dpvdoZAWjzoGQksLT3mnEPoTv-WjDpdMT7outogOyxTNNr_RsaUd9RQNM9qqXK-IWwaSrrAzx1LndVeMm6bmYVe7xlKtv8UtQwSzH2iOac9y70',
    accent: MF.secondary },
  { n: '03', title: 'Generate Smart QR',  desc: 'Instant generation of high-resolution QR codes tailored to your brand. Each code is dynamic—update your menu without reprinting.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDol1lByfRD7S59_2SGdguSUMSVtKh4ORyHFCaMWWg2BnLud75fDTQPf6NUL4BtAw2MJyx8QmFgiIf9ZEF4xo5dl3c6ptUVP2RiP31T1rQsry-6_3OC93Inm2PKtG1zt3GXs7cecq3wOjJ3WTavq7p75_IRjt1lGt0KJNWKQbTivb2QRbzF7OZFQbzr2efl3A-gzF8BH0mhgOoliPmILMY9NJdO0i1N2yWhxXP_KJh0_EThCEdwVY5dfj7iLV1eWNtvWHYfW9_Rt',
    accent: MF.primary },
  { n: '04', title: 'The Magic Scan',     desc: "Guests scan the QR with their own device. No apps to download, no friction. The menu opens instantly in a lightning-fast browser experience.",
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBY8CFblRDNkr6sc5RY7r8k2MUGMOTmytCfLmDsrwAlVHqMt2KmbtNwRsumEMlgJNMuJhfWo47bzt1Ev2p4SeK-9iYQ6GOz3k7WFrOnVngYJ5WqszXRWD_uYSGif3_XIoj2jA6b6JXc2TWPnRmB4irCyM7o61m86kh4e8Ka2nYoqYu56X3mtnnmxN5-S5uP3eztuhH7d3XYrzEhIHsVo59AN2GqKfON-s6THWUWNMdUOipa6V0wlyOdBxPcAPH8lqyN8GPaNQVkx5Tr',
    accent: MF.secondary },
  { n: '05', title: 'Seamless Ordering',  desc: 'Customers order directly from their phone. With integrated payments and real-time cart management, the order goes straight to your kitchen.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT3TOH1CUI2on7nugEPRBlY2i0JypLe1owYE8mKikbDALTTH0aGyw16wpxaP1_x_led90KtV-6byps-NPDHYITsA0FlluDbetP29XvytjaZGQhpYWtGP7kzui7hmpywPQfcrTZITeFzvhrTUW48CwP_z03GYpsYOvbucRp5NdA23P7SyWWCr8aeVCQyXN1d3kGjR4beIV7k20U__WkifkrCmkH_l45Ie_biFiyOR3d9TKhIhoVFduLrcQs0eWrGG1Sxab435LvNo3h',
    accent: MF.primary },
  { n: '06', title: 'Insights & Tracking',desc: 'Monitor performance in real-time. See which dishes are trending, track table turnover, and use data-driven insights to optimize your menu.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJUczHkURGTtYGd87542HIAuMm9I1uQJ8alAI-ypWZ0NwsbsBkGFS8xWN9rQoGeYJJvU--JeGJU95d5uuNl2s5srEczcQ0dQZ1TnfhRst1SrV64hoU0cfmrH64LcXB2MZdu6SHRCR7F8nGwyTpy7R6-Q6SLe-R3xfbMWr5MCejlCTNOkUTor57T2xKYVa5mxxXK8zLxD71-9VJa5kjunOV41_CMki_t2bfu2SHBFkbQwW-gx1v5nemAolBMS-_ALDx_EI7hTT5Wt8g',
    accent: MF.secondary },
];

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const indicatorRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const section = document.getElementById('journey-section');
      if (!section || !indicatorRef.current) return;
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight)));
      indicatorRef.current.style.height = `${progress * 100}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Box sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <MenuFlowNav />
      <Box component="main" sx={{ pt: '72px' }}>

        {/* Hero */}
        <Box component="section" sx={{ position: 'relative', py: 10, bgcolor: MF.surfaceLowest, overflow: 'hidden' }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', px: 6, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>The Process</Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: 40, md: 64 }, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.1, mb: 3, maxWidth: 800, mx: 'auto' }}>
              Launch your digital menu in minutes.
            </Typography>
            <Typography sx={{ fontSize: 18, color: MF.textSub, maxWidth: 560, mx: 'auto', mb: 5, lineHeight: 1.65 }}>
              Experience the future of dining with a platform built for speed, precision, and elegance. From setup to scale, we've streamlined every second.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box component="button" onClick={() => navigate('/register')} sx={{
                bgcolor: MF.primary, color: '#fff', px: 5, py: 1.75, borderRadius: '12px',
                fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 1,
                boxShadow: `0 8px 24px ${MF.primary}4D`, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' },
              }}>
                Get Started <span className="material-symbols-outlined">arrow_forward</span>
              </Box>
              <Box component="button" sx={{ bgcolor: MF.surface, color: MF.text, border: `1px solid ${MF.outlineVar}`, px: 5, py: 1.75, borderRadius: '12px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', '&:hover': { bgcolor: MF.surfaceHigh } }}>
                Watch Demo
              </Box>
            </Box>
          </Box>
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: 500, height: 500, bgcolor: `${MF.primary}08`, borderRadius: '50%', filter: 'blur(80px)', transform: 'translate(30%,-30%)' }} />
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 500, height: 500, bgcolor: `${MF.secondary}08`, borderRadius: '50%', filter: 'blur(80px)', transform: 'translate(-30%,30%)' }} />
        </Box>

        {/* Journey */}
        <Box id="journey-section" component="section" sx={{ position: 'relative', py: 10 }}>
          {/* Journey line */}
          <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, transform: 'translateX(-50%)' }}>
            <Box sx={{ height: '100%', width: '100%', background: `linear-gradient(to bottom, ${MF.primary}, ${MF.secondary})`, opacity: 0.15 }} />
            <Box ref={indicatorRef} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', background: `linear-gradient(to bottom, ${MF.primary}, ${MF.secondary})`, boxShadow: `0 0 15px ${MF.primary}4D`, transition: 'height 0.1s', height: '0%' }} />
          </Box>

          <Box sx={{ maxWidth: 1280, mx: 'auto', px: 6, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STEPS.map(({ n, title, desc, img, accent }, i) => {
              const isLeft = i % 2 === 0;
              return (
                <M key={n} initial={{ opacity: 0.4 }} whileInView={{ opacity: 1 }} viewport={{ once: false, amount: 0.3 }} transition={{ duration: 0.5 }}>
                  <Box sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'column', lg: isLeft ? 'row' : 'row-reverse' }, alignItems: 'center', gap: 10 }}>
                    {/* Text */}
                    <Box sx={{ flex: 1, textAlign: { xs: 'left', lg: isLeft ? 'right' : 'left' }, display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', lg: isLeft ? 'flex-end' : 'flex-start' } }}>
                      <Typography sx={{ fontSize: 64, fontWeight: 900, color: `${accent}33`, lineHeight: 1, mb: 0.5 }}>{n}</Typography>
                      <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 1.5 }}>{title}</Typography>
                      <Typography sx={{ fontSize: 17, color: MF.textSub, lineHeight: 1.65, maxWidth: 400 }}>{desc}</Typography>
                    </Box>
                    {/* Center dot */}
                    <Box sx={{ display: { xs: 'none', lg: 'flex' }, width: 32, height: 32, borderRadius: '50%', bgcolor: MF.surfaceLowest, border: `4px solid ${accent}`, zIndex: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: accent }} />
                    </Box>
                    {/* Image */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ ...glass, p: 3, borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'relative', '&:hover .hover-overlay': { opacity: 1 } }}>
                        <Box sx={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', border: `1px solid ${MF.outlineVar}33`, bgcolor: '#f5f5f5', position: 'relative' }}>
                          <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <Box className="hover-overlay" sx={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${accent}33, transparent)`, opacity: 0, transition: 'opacity 0.3s' }} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </M>
              );
            })}
          </Box>
        </Box>

        {/* Final CTA */}
        <Box component="section" sx={{ py: 10, bgcolor: MF.surfaceHighest, px: 6 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', textAlign: 'center' }}>
            <Typography variant="h1" sx={{ fontSize: { xs: 36, md: 48 }, fontWeight: 700, letterSpacing: '-0.03em', mb: 2 }}>Ready to transform your service?</Typography>
            <Typography sx={{ fontSize: 17, color: MF.textSub, maxWidth: 520, mx: 'auto', mb: 5, lineHeight: 1.65 }}>
              Join over 2,000 restaurants that have elevated their dining experience with MenuFlow.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box component="button" onClick={() => navigate('/register')} sx={{ bgcolor: MF.primary, color: '#fff', px: 5, py: 1.75, borderRadius: '12px', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: `0 8px 24px ${MF.primary}4D`, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}>
                Launch Your Menu
              </Box>
              <Box component="button" onClick={() => navigate('/contact')} sx={{ bgcolor: MF.surfaceLowest, color: MF.text, border: `1px solid ${MF.outlineVar}`, px: 5, py: 1.75, borderRadius: '12px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', '&:hover': { bgcolor: MF.surfaceHigh } }}>
                Talk to Sales
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <MenuFlowFooter />
    </Box>
  );
}
