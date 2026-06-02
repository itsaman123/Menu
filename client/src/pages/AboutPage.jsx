import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF, glass } from './menuflow/mfTheme';

const M = motion.create(Box);
const reveal = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };

const TIMELINE = [
  { year: '2020', title: 'The Foundation',  desc: 'MenuFlow is founded, launching the first touchless QR menu that prioritized design and speed over generic templates.' },
  { year: '2021', title: 'Global Scale',    desc: 'Secured Series A funding and expanded to 15 countries. Introduced multi-language support and AI-driven menu optimization.' },
  { year: '2022', title: 'Full Integration',desc: 'Launched deep integrations with major POS systems, creating a seamless loop from digital order to kitchen fulfillment.' },
  { year: 'Now',  title: 'The Next Frontier', desc: 'Developing predictive analytics to help restaurants reduce food waste and optimize staff scheduling through behavioral insights.' },
];

const VALUES = [
  { icon: 'lightbulb', title: 'Innovation', desc: "We don't settle for 'good enough.' We constantly explore the intersection of design and data to solve complex problems simply.", bg: MF.primaryFixed, iconColor: MF.primary },
  { icon: 'verified',  title: 'Reliability', desc: 'In hospitality, uptime is everything. Our infrastructure is built for enterprise-grade stability, ensuring your business never misses a beat.', bg: '#e9ddff', iconColor: MF.secondary },
  { icon: 'favorite',  title: 'Customer-First', desc: 'We listen more than we talk. Our roadmap is defined by the real-world feedback of the chefs and managers who use MenuFlow every day.', bg: '#c9e6ff', iconColor: MF.tertiary },
];

const TEAM = [
  { name: 'Julian Vance',   role: 'Co-Founder & CEO',      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6FdmrSpPkXBt967tyzgCvtACNiULoCZGJEQxx5UDOziQn9slFK64i1aNVOhfrjhJZjCBp6YpwuUOAm5zqipHZdtZ1mD0v1Ao_MP8ge9cPAn2IgB3lC8-hpmA6dYdHttn8lJL7Ii7sgs-HgWa5yLXmjYHXpnAymhdWoY8PabU06fBF5cOB0J4el_z6K5FKinGNdbGv0IcUxk7sBKoy3dng4xDeK0MYf3Rn6-TsJ-zoNJo225P0BiT2p7U-RoVgb4mJJjr-AKaFZNO2' },
  { name: 'Elena Rodriguez', role: 'Chief Product Officer', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnDqVuzXqlrsZhwchLIfHOAi7PNXf5Y4ktFyCWWv48_I-KfWWEJaPvQtq74b67fletarj7HnycLd14peFay91Tu5EmxF9AaZlMXPcDnfoG-uwBADpRql0DHOpmuZrJiJziJ-cnM75P9zYdlZKkDPpmNkPHZu-k6n_CnUZXihkz2KW5PLSzXZrrFMvDtzCUyaK26oyK_sDa4Bv58IBPrAWSl6d4dWK9juPXWpsIcMhBGhXNV2zaVc4XUSkO2WQfQzuRWE7VIdUt5N40' },
  { name: 'Marcus Thorne',   role: 'VP of Engineering',     src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVJQzqtcOXxeWQQWHDzULAuJWRy34p8p8_AA-Wzsuir6TUhLoex-C7H3ECHAcjEjjx5hCakFKlt1pL4N4dxldWoDkOZwNXDIhWvfBqnSTy4gebcBXWJy8-lttwc8ezr4sjcuq7PkN_3tHUZIpzhPkLm2yDnkZIzXPBytkD3_Vr2kPCBuA42qNapiA8LAyUnFl_Sf19E9Mxq4ZdcXN0azQ9oblCrlegue7Q1HhN4lb5IaEEBBi2Rsj5sIx2EBFGCcNO8OWVvrGoDVUI' },
  { name: 'Sarah Jenkins',   role: 'Head of Operations',    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPU32ZNpy4i4MGQ0ulE9c_2LvxmDDWMTVNPu9tcWctIxaoCg1BV1qLbL4V54h3iLxHOarZG65TpIDW88nrIppFjW7eSxW9PswzWs5UcCvCdmvEOaCmuSN4Sy_dNieEec5HQYddYzsYdjLRneIZfbSNy0nQY2dErsF8Ht_m7riiB6KqwocnRlouwmB5rYz7HCm5khp9jCJhsLO4glafDHYYoAVYd-UO537OC6njhqrN9uKN3GOTRou5u9GQkeTrcuWCEOG-cYo5_qsF' },
];

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <MenuFlowNav />
      <Box component="main" sx={{ pt: '72px' }}>

        {/* Hero */}
        <Box component="header" sx={{ position: 'relative', pt: 20, pb: 10, px: 4, overflow: 'hidden', background: `radial-gradient(circle at top right, ${MF.primaryFixed}, transparent 50%), radial-gradient(circle at bottom left, ${MF.surfaceLow}, transparent 50%)` }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Our Mission</Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: 32, md: 48 }, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, mb: 3, maxWidth: 640, mx: 'auto' }}>
              We're on a mission to modernize hospitality.
            </Typography>
            <Typography sx={{ fontSize: 18, color: MF.textSub, maxWidth: 600, mx: 'auto', lineHeight: 1.65 }}>
              Beyond just digital menus, we are building the infrastructure for the next generation of dining experiences.
            </Typography>
          </Box>
        </Box>

        {/* Narrative */}
        <Box component="section" sx={{ py: 10, bgcolor: MF.surfaceLowest, px: 4 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 8, alignItems: 'center' }}>
            <M initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }}>
              <Box sx={{ display: 'inline-block', p: 1, borderRadius: '12px', bgcolor: MF.primaryFixed, mb: 2 }}>
                <span className="material-symbols-outlined" style={{ color: MF.primary }}>restaurant</span>
              </Box>
              <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 3 }}>Why We Built This</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  'In 2020, we watched as the hospitality industry faced its most significant challenge in decades. Restaurants weren\'t just struggling with logistics; they were struggling with the disconnect between traditional service and a rapidly digital world.',
                  'MenuFlow was born from a simple observation: most "solutions" were friction-heavy, clunky, and sterile. We believed that technology should be invisible—a silent partner that enables waiters to be hosts and chefs to be artists.',
                  'Today, we\'re serving thousands of locations globally, but our core philosophy remains: simplify the operational complexity so the magic of dining can take center stage.',
                ].map((p, i) => (
                  <Typography key={i} sx={{ fontSize: 16, color: MF.textSub, lineHeight: 1.75 }}>{p}</Typography>
                ))}
              </Box>
            </M>
            <M initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }}>
              <Box sx={{ borderRadius: '24px', overflow: 'hidden', border: `1px solid ${MF.outlineVar}33`, aspectRatio: '1/1' }}>
                <Box component="img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdhchNkaRx6slnrPDDU3IJ8lbIdVMzPGxJ8Omwv5b083kl7VsYvBozaoespOb06_22m0xrtDt_kp5KRSgCk8_9jGjgivSMvvUnJTb2B8dFVXntzhTDPa_3vf8Qy9ODM2MBCJAlY72CbTmB_fNzMkyqVGR1832oSuGgWXfiEWeMM_b5aTEGkyAhmwIIg9qCP8wSA6sKSqed3pvHbBSn4BSTPqfd7vyzIlEs6q_2TsxwKq1f4lcRy8c_DNel5WO1ArkT3OheFPWkd6WA"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%)', transition: 'filter 0.7s', '&:hover': { filter: 'grayscale(0%)' } }} />
              </Box>
            </M>
          </Box>
        </Box>

        {/* Timeline */}
        <Box component="section" sx={{ py: 10, px: 4, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 0.5 }}>Company Journey</Typography>
              <Typography sx={{ color: MF.textSub }}>Four years of redefining the digital dining landscape.</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
              {/* Center line (desktop) */}
              <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, transparent, ${MF.primary}, transparent)`, transform: 'translateX(-50%)' }} />
              {TIMELINE.map(({ year, title, desc }, i) => (
                <M key={year} initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 5 }}>
                    {i % 2 === 0 ? (
                      <>
                        <Box sx={{ flex: 1, textAlign: { md: 'right' } }}>
                          <Typography sx={{ fontSize: 24, fontWeight: 600, color: MF.primary, mb: 0.5 }}>{year}</Typography>
                          <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 1 }}>{title}</Typography>
                          <Typography sx={{ fontSize: 15, color: MF.textSub, lineHeight: 1.7, maxWidth: 440, ml: { md: 'auto' } }}>{desc}</Typography>
                        </Box>
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, width: 16, height: 16, borderRadius: '50%', bgcolor: MF.primary, border: '4px solid white', outline: `8px solid ${MF.primaryFixed}`, flexShrink: 0, zIndex: 1 }} />
                        <Box sx={{ flex: 1 }} />
                      </>
                    ) : (
                      <>
                        <Box sx={{ flex: 1 }} />
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, width: 16, height: 16, borderRadius: '50%', bgcolor: MF.primary, border: '4px solid white', outline: `8px solid ${MF.primaryFixed}`, flexShrink: 0, zIndex: 1 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: 24, fontWeight: 600, color: MF.primary, mb: 0.5 }}>{year}</Typography>
                          <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 1 }}>{title}</Typography>
                          <Typography sx={{ fontSize: 15, color: MF.textSub, lineHeight: 1.7, maxWidth: 440 }}>{desc}</Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </M>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Values */}
        <Box component="section" sx={{ py: 10, px: 4, bgcolor: MF.surfaceLow }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary, mb: 1.5 }}>Guiding Principles</Typography>
              <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>What Drives Us</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3 }}>
              {VALUES.map(({ icon, title, desc, bg, iconColor }) => (
                <M key={title} initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }}>
                  <Box sx={{ ...glass, p: 5, borderRadius: '24px', transition: 'border-color 0.5s', '&:hover': { borderColor: `${MF.primary}80` } }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '16px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                      <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: 32 }}>{icon}</span>
                    </Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 1.5 }}>{title}</Typography>
                    <Typography sx={{ fontSize: 15, color: MF.textSub, lineHeight: 1.7 }}>{desc}</Typography>
                  </Box>
                </M>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Team */}
        <Box component="section" sx={{ py: 10, px: 4 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 8, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ maxWidth: 480 }}>
                <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 0.5 }}>The Leadership</Typography>
                <Typography sx={{ color: MF.textSub }}>A diverse team of hospitality veterans and engineering pioneers.</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: MF.primary, fontWeight: 700, cursor: 'pointer' }}>
                <Typography sx={{ fontWeight: 700, color: MF.primary }}>See Open Roles</Typography>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 3 }}>
              {TEAM.map(({ name, role, src }) => (
                <M key={name} initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }}>
                  <Box>
                    <Box sx={{ aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', mb: 2, '&:hover img': { filter: 'grayscale(0)', transform: 'scale(1.05)' } }}>
                      <Box component="img" src={src} sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)', transition: 'all 0.7s' }} />
                    </Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 0.25 }}>{name}</Typography>
                    <Typography sx={{ fontSize: 11, color: MF.textSub, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{role}</Typography>
                  </Box>
                </M>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
      <MenuFlowFooter />
    </Box>
  );
}
