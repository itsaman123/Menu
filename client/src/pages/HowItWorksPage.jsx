import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF, glass } from './menuflow/mfTheme';
import { SplitHeading, CursorBlob, MagneticButton, useTilt3D, useScrollTriggerReliability, gsap, ScrollTrigger } from './menuflow/ScrollFX';

const M = motion.create(Box);
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.93 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } };

const STEPS = [
  { n: '01', title: 'Quick Signup', desc: 'Join the ScanIt ecosystem in seconds. No credit card required. Just your restaurant name and basic details.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC09UE7TRgNlKGWGLnCDeqtwv-_uIcCQ4obA10zGhL1FWxq_EAbhK7pd7RFqV2IAXMC1sS7SAFzpwbpPXAo5A9JosGxr5pTYVZLssH9ulwQpLXzCUEjefwHAeoAwXkE9NvhoZK16QnQp2kBIBzYxB30_jAyAYSP1qzs2nvUEeO1S0CbKNv80HOlXn0gO2cr-N3uQPhZNFtOcyQPAq01VY4T3EnI7ow8rypbfz6jjgo-GhfLENYSmNJDESTDMEKiqHXqaVvmEUMdD2LT', color: MF.primary },
  { n: '02', title: 'Build Your Menu', desc: 'Use our intuitive drag-and-drop editor. Upload high-res imagery, set dynamic pricing, and organize items exactly how you want.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFA0q0AHje19zFzzR0gN_WkMbp6DaMG-wwtcpUBCxDPKq__LE6ZuPsTA3wROGpoG6XqB6xQ7JaplN0223Fy77hUH-CAGRdJBvVAlE-5QzCSq-aiyuuB9CN0EtcaWAEGiW1bXfhhuCAm5ZDrKjG6IzLEO5pKnluS7dpvdoZAWjzoGQksLT3mnEPoTv-WjDpdMT7outogOyxTNNr_RsaUd9RQNM9qqXK-IWwaSrrAzx1LndVeMm6bmYVe7xlKtv8UtQwSzH2iOac9y70', color: '#7c3aed' },
  { n: '03', title: 'Generate Smart QR', desc: 'Instant generation of high-resolution QR codes tailored to your brand. Each code is dynamic — update your menu without reprinting.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDol1lByfRD7S59_2SGdguSUMSVtKh4ORyHFCaMWWg2BnLud75fDTQPf6NUL4BtAw2MJyx8QmFgiIf9ZEF4xo5dl3c6ptUVP2RiP31T1rQsry-6_3OC93Inm2PKtG1zt3GXs7cecq3wOjJ3WTavq7p75_IRjt1lGt0KJNWKQbTivb2QRbzF7OZFQbzr2efl3A-gzF8BH0mhgOoliPmILMY9NJdO0i1N2yWhxXP_KJh0_EThCEdwVY5dfj7iLV1eWNtvWHYfW9_Rt', color: MF.primary },
  { n: '04', title: 'The Magic Scan', desc: 'Guests scan the QR with their own device. No apps to download, no friction. The menu opens instantly in a lightning-fast browser experience.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBY8CFblRDNkr6sc5RY7r8k2MUGMOTmytCfLmDsrwAlVHqMt2KmbtNwRsumEMlgJNMuJhfWo47bzt1Ev2p4SeK-9iYQ6GOz3k7WFrOnVngYJ5WqszXRWD_uYSGif3_XIoj2jA6b6JXc2TWPnRmB4irCyM7o61m86kh4e8Ka2nYoqYu56X3mtnnmxN5-S5uP3eztuhH7d3XYrzEhIHsVo59AN2GqKfON-s6THWUWNMdUOipa6V0wlyOdBxPcAPH8lqyN8GPaNQVkx5Tr', color: '#059669' },
  { n: '05', title: 'Seamless Ordering', desc: 'Customers order directly from their phone. Integrated payments and real-time cart management send orders straight to your kitchen.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT3TOH1CUI2on7nugEPRBlY2i0JypLe1owYE8mKikbDALTTH0aGyw16wpxaP1_x_led90KtV-6byps-NPDHYITsA0FlluDbetP29XvytjaZGQhpYWtGP7kzui7hmpywPQfcrTZITeFzvhrTUW48CwP_z03GYpsYOvbucRp5NdA23P7SyWWCr8aeVCQyXN1d3kGjR4beIV7k20U__WkifkrCmkH_l45Ie_biFiyOR3d9TKhIhoVFduLrcQs0eWrGG1Sxab435LvNo3h', color: '#d97706' },
  { n: '06', title: 'Insights & Growth', desc: 'Monitor performance in real-time. See which dishes trend, track table turnover, and use data-driven insights to optimize your menu and staff.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJUczHkURGTtYGd87542HIAuMm9I1uQJ8alAI-ypWZ0NwsbsBkGFS8xWN9rQoGeYJJvU--JeGJU95d5uuNl2s5srEczcQ0dQZ1TnfhRst1SrV64hoU0cfmrH64LcXB2MZdu6SHRCR7F8nGwyTpy7R6-Q6SLe-R3xfbMWr5MCejlCTNOkUTor57T2xKYVa5mxxXK8zLxD71-9VJa5kjunOV41_CMki_t2bfu2SHBFkbQwW-gx1v5nemAolBMS-_ALDx_EI7hTT5Wt8g', color: '#0891b2' },
];

/* Each step's image owns its own 3D-tilt hook so hover state doesn't leak between steps */
function TiltStepImage({ img, color }) {
  const tilt = useTilt3D(9);
  return (
    <Box
      ref={tilt.ref}
      {...tilt.handlers}
      component={motion.div}
      style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ ...glass, p: 2.5, borderRadius: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', border: `1px solid ${MF.outlineVar}44`, position: 'relative' }}>
          <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', '&:hover': { transform: 'scale(1.04)' } }} />
          <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${color}25, transparent 60%)`, opacity: 0, transition: 'opacity 0.3s', '&:hover': { opacity: 1 } }} />
        </Box>
      </Box>
    </Box>
  );
}

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const lineRef = useRef(null);
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const dotRefs = useRef([]);

  useScrollTriggerReliability();

  useEffect(() => {
    const onScroll = () => {
      const section = document.getElementById('journey-section');
      if (!section || !lineRef.current) return;
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight)));
      lineRef.current.style.height = `${progress * 100}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    console.log('[gsap] ScrollTrigger mounted on HowItWorksPage', gsap.version);
    const ctx = gsap.context(() => {
      // Curtain: hero shrinks/dims as you scroll past it
      gsap.to(heroRef.current, {
        scale: 0.95, opacity: 0.45, filter: 'blur(1.5px)', transformOrigin: 'center top', ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });

      // Journey center-dots pulse as each step crosses viewport center
      dotRefs.current.forEach((el) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el, start: 'top center', end: 'bottom center',
          onEnter: () => gsap.to(el, { scale: 1.4, duration: 0.4, ease: 'back.out(2)' }),
          onLeave: () => gsap.to(el, { scale: 1, duration: 0.4 }),
          onEnterBack: () => gsap.to(el, { scale: 1.4, duration: 0.4, ease: 'back.out(2)' }),
          onLeaveBack: () => gsap.to(el, { scale: 1, duration: 0.4 }),
        });
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box ref={pageRef} sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <CursorBlob />
      <MenuFlowNav />

      {/* ── Hero ── */}
      <Box ref={heroRef} component="section" sx={{ position: 'relative', minHeight: '68vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #fff7ed 0%, #fffaf6 55%, #fff7ed 100%)', pt: '72px' }}>
        {[
          { top: '-10%', left: '-5%', w: 560, color: `${MF.primary}18`, dur: 20 },
          { bottom: '-8%', right: '-4%', w: 440, color: '#fb923c14', dur: 24, delay: 6 },
          { top: '30%', right: '25%', w: 300, color: '#ea580c12', dur: 16, delay: 9 },
        ].map((o, i) => (
          <M key={i} animate={{ x: [0, 50, 0], y: [0, -40, 0] }} transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: o.delay || 0 }}
            sx={{ position: 'absolute', ...o, width: o.w, height: o.w, borderRadius: '50%', background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        ))}
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />

        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 3, md: 6 }, width: '100%', zIndex: 1, textAlign: 'center', py: 14 }}>
          <M initial="hidden" animate="visible" variants={stagger}>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>The Process</Typography>
            </M>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: { xs: 38, md: 60, lg: 72 }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.07, mb: 3, color: MF.text, fontFamily: 'Manrope, Inter, sans-serif', maxWidth: 860, mx: 'auto' }}>
                Launch your digital menu{' '}
                <Box component="span" sx={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  in minutes.
                </Box>
              </Typography>
            </M>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: MF.textSub, mb: 6, maxWidth: 580, mx: 'auto', lineHeight: 1.75 }}>
                Experience the future of dining with a platform built for speed, precision, and elegance — from setup to scale, every second streamlined.
              </Typography>
            </M>
            <M variants={fadeUp}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <MagneticButton onClick={() => navigate('/contact')}>
                  Get Started <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle', marginLeft: 6 }}>arrow_forward</span>
                </MagneticButton>
                <MagneticButton variant="secondary">▶ Watch Demo</MagneticButton>
              </Box>
            </M>
          </M>
        </Box>

        <M animate={{ y: [0, 10, 0] }} transition={{ duration: 2.2, repeat: Infinity }}
          sx={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 10, color: MF.outlineVar, letterSpacing: '0.15em' }}>SCROLL</Typography>
          <Box sx={{ width: 1.5, height: 44, background: `linear-gradient(to bottom, ${MF.primary}80, transparent)`, borderRadius: 1 }} />
        </M>
      </Box>

      {/* ── Journey — curtains over the shrinking hero, each image gets real 3D tilt ── */}
      <Box id="journey-section" component="section" sx={{
        position: 'relative', py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 },
        zIndex: 5, bgcolor: MF.bg,
        mt: { xs: '-24px', md: '-40px' },
        borderTopLeftRadius: { xs: '24px', md: '36px' }, borderTopRightRadius: { xs: '24px', md: '36px' },
        boxShadow: '0 -20px 40px rgba(0,0,0,0.05)',
      }}>
        <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'absolute', left: '50%', top: 60, bottom: 0, width: 2, transform: 'translateX(-50%)', bgcolor: `${MF.primary}12` }}>
          <Box ref={lineRef} sx={{ width: '100%', background: `linear-gradient(to bottom, ${MF.primary}, #7c3aed)`, boxShadow: `0 0 20px ${MF.primary}60`, transition: 'height 0.1s', height: '0%', position: 'absolute', top: 0 }} />
        </Box>

        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'flex', flexDirection: 'column', gap: { xs: 6, md: 10 } }}>
          {STEPS.map(({ n, title, desc, img, color }, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div key={n}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, amount: 0.25 }}
              >
                <Box sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'column', lg: isLeft ? 'row' : 'row-reverse' }, alignItems: 'center', gap: { xs: 5, lg: 10 } }}>
                  <Box sx={{ flex: 1, textAlign: { xs: 'left', lg: isLeft ? 'right' : 'left' }, display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', lg: isLeft ? 'flex-end' : 'flex-start' } }}>
                    <Typography sx={{ fontSize: 72, fontWeight: 900, color: `${color}25`, lineHeight: 1, mb: 0.5, letterSpacing: '-0.04em', fontFamily: 'Manrope, Inter, sans-serif' }}>{n}</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: color, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 1.5 }}>Step {n}</Typography>
                    <Typography sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 900, letterSpacing: '-0.025em', mb: 2, lineHeight: 1.2 }}>{title}</Typography>
                    <Typography sx={{ fontSize: 16, color: MF.textSub, lineHeight: 1.75, maxWidth: 400 }}>{desc}</Typography>
                  </Box>

                  <Box ref={el => dotRefs.current[i] = el} sx={{
                    display: { xs: 'none', lg: 'flex' }, width: 36, height: 36,
                    borderRadius: '50%', bgcolor: MF.bg, border: `4px solid ${color}`,
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    position: 'absolute', left: '50%', transform: 'translateX(-50%)', zIndex: 10,
                    boxShadow: `0 0 24px ${color}60`,
                  }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <TiltStepImage img={img} color={color} />
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </Box>

      {/* ── Quick facts bar — 3D flip-in cards ── */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 6 }, bgcolor: '#ffffff' }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', background: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #eab308 100%)', borderRadius: { xs: '24px', md: '36px' }, p: { xs: 4, sm: 6, md: 8 }, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(249,115,22,0.18)' }}>
          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 4, mb: { xs: 6, md: 10 }, pb: 5, borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <Box sx={{ maxWidth: { xs: '100%', md: '60%' } }}>
                <SplitHeading text="Built for speed and simplicity." sx={{ fontSize: { xs: 32, md: 46 }, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.15, fontFamily: 'Manrope, Inter, sans-serif' }} />
                <Typography sx={{ fontSize: { xs: 15, md: 17 }, color: 'rgba(255, 255, 255, 0.85)', mt: 1.5, lineHeight: 1.6, fontWeight: 500 }}>
                  We optimize every line of code so your customers get a fast, friction-free ordering experience with absolutely zero setup headaches.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                <motion.button whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.15)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/how-it-works')}
                  style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', border: '1.5px solid rgba(255, 255, 255, 0.4)', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_circle</span>
                  Watch Demo
                </motion.button>
                <motion.button whileHover={{ scale: 1.04, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/contact')}
                  style={{ background: '#ffffff', color: '#ea580c', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  Get Started
                </motion.button>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: { xs: 4, md: 5 } }}>
              {[
                { val: '<200ms', label: 'Menu load time', desc: 'Supercharged speed. Menus load instantly on any mobile device without app installation.' },
                { val: '20 min', label: 'Average setup time', desc: 'Rapid onboarding. Add your menu, download QR codes, and start receiving orders today.' },
                { val: '99.9%', label: 'Platform uptime', desc: 'High availability. Active server replication ensures your digital menus are always open.' },
                { val: '0', label: 'Apps to download', desc: 'Frictionless guest experience. Customers simply scan, order, and pay directly on their browser.' },
              ].map(({ val, label, desc }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, y: 50, rotateX: -40 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  style={{ transformPerspective: 1000, textAlign: 'left', position: 'relative' }}
                >
                  <Typography sx={{ fontSize: { xs: 40, md: 54 }, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1, mb: 1.5, fontFamily: 'Manrope, Inter, sans-serif', textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    {val}
                  </Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#fef08a', letterSpacing: '-0.01em', mb: 1.25, textTransform: 'uppercase' }}>{label}</Typography>
                  <Typography sx={{ fontSize: 13.5, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontWeight: 400 }}>{desc}</Typography>
                </motion.div>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── CTA ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 } }}>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, amount: 0.3 }}>
          <Box sx={{ maxWidth: 960, mx: 'auto', background: MF.gradient, borderRadius: '44px', p: { xs: 6, md: 12 }, textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography sx={{ fontSize: { xs: 30, md: 52 }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, mb: 3, fontFamily: 'Manrope, Inter, sans-serif' }}>
                Ready to launch<br />your digital menu?
              </Typography>
              <Typography sx={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', mb: 6, maxWidth: 480, mx: 'auto', lineHeight: 1.75 }}>
                Join over 2,000 restaurants that have elevated their dining experience. Set up in under 20 minutes.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <MagneticButton onClick={() => navigate('/contact')} style={{ background: '#fff', color: MF.primary, boxShadow: '0 12px 36px rgba(0,0,0,0.15)' }}>
                  Launch Your Menu
                </MagneticButton>
                <motion.button whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/contact')}
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', padding: '17px 44px', borderRadius: 16, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Talk to Sales
                </motion.button>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Box>

      <MenuFlowFooter />
    </Box>
  );
}