import { useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF, glass } from './menuflow/mfTheme';

const M = motion.create(Box);
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp  = { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } } };

function PinCard({ icon, title, desc, color = MF.primary, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, amount: 0.2 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 60, position: 'relative' }}
    >
      <motion.div animate={{ y: hovered ? -28 : 0, rotateX: hovered ? 6 : 0 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} style={{ transformStyle: 'preserve-3d', width: '100%' }}>
        <Box sx={{ background: '#fff', border: hovered ? `1px solid ${color}55` : '1px solid rgba(232,213,196,0.6)', borderRadius: '24px', p: { xs: 4, md: 5 }, boxShadow: hovered ? `0 24px 60px ${color}18` : '0 8px 24px rgba(0,0,0,0.04)', transition: 'border-color 0.3s, box-shadow 0.3s', height: '100%' }}>
          <Box sx={{ width: 60, height: 60, borderRadius: '18px', background: `linear-gradient(135deg, ${color}18, ${color}38)`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, border: `1px solid ${color}28` }}>
            <span className="material-symbols-outlined" style={{ color, fontSize: 30, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
          </Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 1.5, color: MF.text, letterSpacing: '-0.01em' }}>{title}</Typography>
          <Typography sx={{ fontSize: 15, color: MF.textSub, lineHeight: 1.7 }}>{desc}</Typography>
        </Box>
      </motion.div>
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ scaleY: 0, opacity: 0 }}
            style={{ transformOrigin: 'top', width: 2, height: 52, background: `linear-gradient(to bottom, ${color}, transparent)`, marginTop: 4 }} />
        )}
      </AnimatePresence>
      <Box sx={{ position: 'absolute', bottom: 14, width: hovered ? 14 : 10, height: hovered ? 14 : 10, borderRadius: '50%', bgcolor: color, boxShadow: hovered ? `0 0 22px 6px ${color}88` : `0 0 10px 2px ${color}55`, transition: 'all 0.3s' }} />
    </motion.div>
  );
}

function TeamCard({ name, role, src }) {
  const ref = useRef(null);
  const mx  = useMotionValue(0);
  const my  = useMotionValue(0);
  const rX  = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 400, damping: 30 });
  const rY  = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 400, damping: 30 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
      onMouseMove={e => { const r = ref.current?.getBoundingClientRect(); if (r) { mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); } }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{ rotateX: rX, rotateY: rY, transformStyle: 'preserve-3d', perspective: '800px' }}
    >
      <Box sx={{ aspectRatio: '3/4', borderRadius: '20px', overflow: 'hidden', mb: 2, position: 'relative' }}>
        <Box component="img" src={src} sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(80%)', transition: 'all 0.6s', '&:hover': { filter: 'grayscale(0)', transform: 'scale(1.05)' } }} />
        <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)` }} />
      </Box>
      <Typography sx={{ fontSize: 17, fontWeight: 700, mb: 0.5 }}>{name}</Typography>
      <Typography sx={{ fontSize: 12, color: MF.textSub, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{role}</Typography>
    </motion.div>
  );
}

const TIMELINE = [
  { year: '2020', title: 'The Foundation',    desc: 'ScanIt launches the first touchless QR menu that prioritized design and speed over generic templates.', color: MF.primary },
  { year: '2021', title: 'Global Scale',      desc: 'Secured Series A funding. Expanded to 15 countries. Introduced multi-language support and AI-driven menu optimization.', color: '#ea580c' },
  { year: '2022', title: 'Full Integration',  desc: 'Launched deep integrations with major POS systems, creating a seamless loop from digital order to kitchen fulfillment.', color: '#059669' },
  { year: 'Now',  title: 'The Next Frontier', desc: 'Developing predictive analytics to help restaurants reduce food waste and optimize staff scheduling through behavioral insights.', color: '#d97706' },
];

const VALUES = [
  { icon: 'lightbulb',  title: 'Innovation',     desc: "We don't settle for good enough. We constantly explore the intersection of design and data to solve complex problems simply.", color: MF.primary },
  { icon: 'verified',   title: 'Reliability',    desc: 'In hospitality, uptime is everything. Our infrastructure is built for enterprise-grade stability so your business never misses a beat.', color: '#ea580c' },
  { icon: 'favorite',   title: 'Customer-First', desc: 'We listen more than we talk. Our roadmap is defined by real-world feedback from chefs and managers who use ScanIt every day.', color: '#dc2626' },
];

const TEAM = [
  { name: 'Julian Vance',   role: 'Co-Founder & CEO',      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6FdmrSpPkXBt967tyzgCvtACNiULoCZGJEQxx5UDOziQn9slFK64i1aNVOhfrjhJZjCBp6YpwuUOAm5zqipHZdtZ1mD0v1Ao_MP8ge9cPAn2IgB3lC8-hpmA6dYdHttn8lJL7Ii7sgs-HgWa5yLXmjYHXpnAymhdWoY8PabU06fBF5cOB0J4el_z6K5FKinGNdbGv0IcUxk7sBKoy3dng4xDeK0MYf3Rn6-TsJ-zoNJo225P0BiT2p7U-RoVgb4mJJjr-AKaFZNO2' },
  { name: 'Elena Rodriguez', role: 'Chief Product Officer', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnDqVuzXqlrsZhwchLIfHOAi7PNXf5Y4ktFyCWWv48_I-KfWWEJaPvQtq74b67fletarj7HnycLd14peFay91Tu5EmxF9AaZlMXPcDnfoG-uwBADpRql0DHOpmuZrJiJziJ-cnM75P9zYdlZKkDPpmNkPHZu-k6n_CnUZXihkz2KW5PLSzXZrrFMvDtzCUyaK26oyK_sDa4Bv58IBPrAWSl6d4dWK9juPXWpsIcMhBGhXNV2zaVc4XUSkO2WQfQzuRWE7VIdUt5N40' },
  { name: 'Marcus Thorne',   role: 'VP of Engineering',     src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVJQzqtcOXxeWQQWHDzULAuJWRy34p8p8_AA-Wzsuir6TUhLoex-C7H3ECHAcjEjjx5hCakFKlt1pL4N4dxldWoDkOZwNXDIhWvfBqnSTy4gebcBXWJy8-lttwc8ezr4sjcuq7PkN_3tHUZIpzhPkLm2yDnkZIzXPBytkD3_Vr2kPCBuA42qNapiA8LAyUnFl_Sf19E9Mxq4ZdcXN0azQ9oblCrlegue7Q1HhN4lb5IaEEBBi2Rsj5sIx2EBFGCcNO8OWVvrGoDVUI' },
  { name: 'Sarah Jenkins',   role: 'Head of Operations',    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPU32ZNpy4i4MGQ0ulE9c_2LvxmDDWMTVNPu9tcWctIxaoCg1BV1qLbL4V54h3iLxHOarZG65TpIDW88nrIppFjW7eSxW9PswzWs5UcCvCaHZJBp6YpwuUOAm5zqipHZ9dZ1mD0v1Ao_MP8ge9cPAn2IgB3lC8-hpmA6dYdHttn8lJL7Ii7sgs-HgWa5yLXmjYHXpnAymhdWoY8PabU06fBF5cOB0J4el_z6K5FKinGNdbGv0IcUxk7sBKoy3dng4xDeK0MYf3Rn6-TsJ-zoNJo225P0BiT2p7U-RoVgb4mJJjr-AKaFZNO2' },
];

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <MenuFlowNav />

      {/* ── Hero ── */}
      <Box component="header" sx={{ position: 'relative', minHeight: '68vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #fff7ed 0%, #fffaf6 55%, #fff7ed 100%)', pt: '72px' }}>
        {[
          { top: '-10%', left: '-5%', w: 540, color: `${MF.primary}20`, dur: 20 },
          { bottom: '-8%', right: '-5%', w: 440, color: '#fb923c18', dur: 26, delay: 6 },
          { top: '35%', right: '22%', w: 280, color: '#ea580c14', dur: 15, delay: 9 },
        ].map((o, i) => (
          <M key={i} animate={{ x: [0, 55, 0], y: [0, -45, 0] }} transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: o.delay || 0 }}
            sx={{ position: 'absolute', ...o, width: o.w, height: o.w, borderRadius: '50%', background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        ))}
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 3, md: 6 }, width: '100%', zIndex: 1, textAlign: 'center', py: 14 }}>
          <M initial="hidden" animate="visible" variants={stagger}>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Our Mission</Typography>
            </M>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: { xs: 38, md: 60, lg: 72 }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.07, mb: 3, color: MF.text, fontFamily: 'Manrope, Inter, sans-serif', maxWidth: 800, mx: 'auto' }}>
                We're on a mission to{' '}
                <Box component="span" sx={{ background: 'linear-gradient(135deg, #f97316, #ea580c, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  modernize hospitality.
                </Box>
              </Typography>
            </M>
            <M variants={fadeUp}>
              <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: MF.textSub, maxWidth: 580, mx: 'auto', lineHeight: 1.75 }}>
                Beyond just digital menus, we are building the infrastructure for the next generation of dining experiences.
              </Typography>
            </M>
          </M>
        </Box>
      </Box>

      {/* ── Narrative ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 16 }, px: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 10, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, bgcolor: `${MF.primary}15`, borderRadius: '14px', mb: 3, border: `1px solid ${MF.primary}25` }}>
              <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 28, fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            </Box>
            <Typography sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 900, letterSpacing: '-0.03em', mb: 3.5, lineHeight: 1.15, fontFamily: 'Manrope, Inter, sans-serif' }}>Why We Built This</Typography>
            {[
              "In 2020, we watched as the hospitality industry faced its most significant challenge in decades — not just logistical struggles, but a fundamental disconnect between traditional service and a rapidly digital world.",
              "ScanIt was born from a simple observation: most 'solutions' were friction-heavy, clunky, and sterile. We believed that technology should be invisible — a silent partner that enables waiters to be hosts and chefs to be artists.",
              "Today we're serving thousands of locations globally, but our core philosophy remains: simplify the operational complexity so the magic of dining can take center stage.",
            ].map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: i * 0.12 }} viewport={{ once: true }}>
                <Typography sx={{ fontSize: 16, color: MF.textSub, lineHeight: 1.8, mb: 2.5 }}>{p}</Typography>
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ position: 'absolute', inset: -20, background: `linear-gradient(135deg, ${MF.primary}10, #ea580c10)`, borderRadius: '32px', pointerEvents: 'none' }} />
              <Box sx={{ position: 'relative', borderRadius: '28px', overflow: 'hidden', aspectRatio: '4/3', border: `1px solid ${MF.outlineVar}55`, boxShadow: '0 30px 70px rgba(0,0,0,0.1)' }}>
                <Box component="img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdhchNkaRx6slnrPDDU3IJ8lbIdVMzPGxJ8Omwv5b083kl7VsYvBozaoespOb06_22m0xrtDt_kp5KRSgCk8_9jGjgivSMvvUnJTb2B8dFVXntzhTDPa_3vf8Qy9ODM2MBCJAlY72CbTmB_fNzMkyqVGR1832oSuGgWXfiEWeMM_b5aTEGkyAhmwIIg9qCP8wSA6sKSqed3pvHbBSn4BSTPqfd7vyzIlEs6q_2TsxwKq1f4lcRy8c_DNel5WO1ArkT3OheFPWkd6WA"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%)', transition: 'filter 0.7s', '&:hover': { filter: 'grayscale(0%)' } }} />
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* ── Timeline ── */}
      <Box component="section" sx={{ bgcolor: MF.surfaceLow, py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, background: `radial-gradient(ellipse, ${MF.primary}08 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <Box sx={{ maxWidth: 1100, mx: 'auto', position: 'relative', zIndex: 1 }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 10 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Company journey</Typography>
              <Typography sx={{ fontSize: { xs: 30, md: 48 }, fontWeight: 900, letterSpacing: '-0.035em', color: MF.text, fontFamily: 'Manrope, Inter, sans-serif' }}>Four years redefining dining</Typography>
            </Box>
          </M>

          {/* Center line */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', left: '50%', top: 160, bottom: 40, width: 2, background: `linear-gradient(to bottom, transparent, ${MF.primary}, ${MF.primary}, transparent)`, transform: 'translateX(-50%)', opacity: 0.25 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TIMELINE.map(({ year, title, desc, color }, i) => (
              <motion.div key={year} initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, amount: 0.4 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 5, py: 4 }}>
                  {i % 2 === 0 ? (
                    <>
                      <Box sx={{ flex: 1, textAlign: { md: 'right' }, gridColumn: { xs: '1/-1', md: 'auto' } }}>
                        <Typography sx={{ fontSize: 30, fontWeight: 900, color, mb: 0.75, letterSpacing: '-0.02em' }}>{year}</Typography>
                        <Typography sx={{ fontSize: 22, fontWeight: 700, color: MF.text, mb: 1.5 }}>{title}</Typography>
                        <Typography sx={{ fontSize: 15, color: MF.textSub, lineHeight: 1.75, maxWidth: 420, ml: { md: 'auto' } }}>{desc}</Typography>
                      </Box>
                      <Box sx={{ display: { xs: 'none', md: 'flex' }, width: 20, height: 20, borderRadius: '50%', bgcolor: color, border: `4px solid ${MF.surfaceLow}`, outline: `6px solid ${color}40`, flexShrink: 0, zIndex: 1, boxShadow: `0 0 20px ${color}60` }} />
                      <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />
                    </>
                  ) : (
                    <>
                      <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />
                      <Box sx={{ display: { xs: 'none', md: 'flex' }, width: 20, height: 20, borderRadius: '50%', bgcolor: color, border: `4px solid ${MF.surfaceLow}`, outline: `6px solid ${color}40`, flexShrink: 0, zIndex: 1, boxShadow: `0 0 20px ${color}60` }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 30, fontWeight: 900, color, mb: 0.75, letterSpacing: '-0.02em' }}>{year}</Typography>
                        <Typography sx={{ fontSize: 22, fontWeight: 700, color: MF.text, mb: 1.5 }}>{title}</Typography>
                        <Typography sx={{ fontSize: 15, color: MF.textSub, lineHeight: 1.75, maxWidth: 420 }}>{desc}</Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Values (Pin Cards) ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 16 }, px: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 10 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Guiding principles</Typography>
              <Typography sx={{ fontSize: { xs: 30, md: 48 }, fontWeight: 900, letterSpacing: '-0.035em', fontFamily: 'Manrope, Inter, sans-serif' }}>What drives us</Typography>
            </Box>
          </M>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3 }}>
            {VALUES.map((v, i) => <PinCard key={v.title} {...v} index={i} />)}
          </Box>
        </Box>
      </Box>

      {/* ── Team ── */}
      <Box component="section" sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, bgcolor: MF.surfaceLow }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 10, flexWrap: 'wrap', gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Leadership</Typography>
                <Typography sx={{ fontSize: { xs: 30, md: 44 }, fontWeight: 900, letterSpacing: '-0.035em', fontFamily: 'Manrope, Inter, sans-serif' }}>The people behind ScanIt</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                <Typography sx={{ fontWeight: 700, color: MF.primary, fontSize: 15 }}>See Open Roles</Typography>
                <span className="material-symbols-outlined" style={{ color: MF.primary }}>arrow_forward</span>
              </Box>
            </Box>
          </M>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 4 }}>
            {TEAM.map(t => <TeamCard key={t.name} {...t} />)}
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
                Join us in shaping<br />the future of dining.
              </Typography>
              <Typography sx={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', mb: 6, maxWidth: 480, mx: 'auto', lineHeight: 1.75 }}>
                Whether you're a restaurant owner or a talented engineer, we'd love to have you on board.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')}
                  style={{ background: '#fff', color: MF.primary, padding: '17px 44px', borderRadius: 16, fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 12px 36px rgba(0,0,0,0.15)' }}>
                  Start Free Trial
                </motion.button>
                <motion.button whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/contact')}
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', padding: '17px 44px', borderRadius: 16, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Contact the Team
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
