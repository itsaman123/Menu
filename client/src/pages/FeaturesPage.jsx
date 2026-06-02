import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF, glass } from './menuflow/mfTheme';

const M = motion.create(Box);
const reveal = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };

const BENTO = [
  { icon: 'qr_code_2',       title: 'QR Menus',        desc: 'High-resolution digital menus with instant item updates and dynamic pricing.',                        span: 4, bg: null,          iconBg: `${MF.primary}1A`,  iconColor: MF.primary   },
  { icon: 'restaurant_menu', title: 'Ordering',         desc: 'Seamless table-side and remote ordering that syncs directly with your kitchen display system.',      span: 4, bg: `${MF.primary}0D`, iconBg: MF.primary,        iconColor: '#fff'       },
  { icon: 'monitoring',      title: 'Tracking',         desc: 'Real-time order lifecycle monitoring from preparation to final table delivery.',                     span: 4, bg: null,          iconBg: `${MF.primary}1A`,  iconColor: MF.primary   },
  { icon: 'verified_user',   title: 'OTP Verification', desc: 'Secure customer authentication for loyalty programs and contactless payments.',                      span: 3, bg: null,          iconBg: `${MF.primary}1A`,  iconColor: MF.primary   },
  { icon: 'query_stats',     title: 'Analytics',        desc: 'Deep-dive insights into menu performance, server efficiency, and customer behavior patterns.',       span: 5, bg: `${MF.secondary}0A`, iconBg: `${MF.secondary}1A`, iconColor: MF.secondary },
  { icon: 'hub',             title: 'Multi-location',   desc: 'Unified management for franchises and groups. Centralize control with localized flexibility.',       span: 4, bg: null,          iconBg: `${MF.primary}1A`,  iconColor: MF.primary   },
];

const WORKFLOW = [
  { icon: 'qr_code_scanner',       step: '1. Instant Scan',   desc: 'Guest scans the table QR. No app required. Menu loads in <200ms.' },
  { icon: 'shopping_cart_checkout', step: '2. Smart Order',    desc: 'AI-driven recommendations boost average order value by 18%.' },
  { icon: 'receipt_long',           step: '3. Kitchen Sync',   desc: 'Orders route instantly to specific stations (Grill, Bar, Pastry).' },
  { icon: 'check_circle',           step: '4. Fulfillment',    desc: 'Kitchen marks ready. Server notified. Payment settled via OTP/Card.' },
];

export default function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <MenuFlowNav />
      <Box component="main" sx={{ pt: '72px' }}>

        {/* Hero */}
        <Box component="section" sx={{ position: 'relative', px: 6, pt: 10, pb: 8, overflow: 'hidden', background: `radial-gradient(circle at 50% 50%, ${MF.primary}0D 0%, transparent 70%)` }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'inline-block', px: 2, py: 0.5, borderRadius: '9999px', bgcolor: MF.primaryFixed, color: '#07006c', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 2 }}>
              Enterprise Grade
            </Box>
            <Typography variant="h1" sx={{ fontSize: { xs: 40, md: 64 }, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.1, mb: 3 }}>
              Features built for <Box component="span" sx={{ color: MF.primary }}>high-performance</Box> restaurants.
            </Typography>
            <Typography sx={{ fontSize: 18, color: MF.textSub, maxWidth: 600, mx: 'auto', mb: 5, lineHeight: 1.65 }}>
              From rapid-response ordering to multi-location synchronization, every module is engineered for surgical precision in hospitality management.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box component="button" onClick={() => navigate('/register')} sx={{
                bgcolor: MF.primary, color: '#fff', px: 5, py: 1.75, borderRadius: '12px',
                fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', boxShadow: `0 8px 24px ${MF.primary}4D`,
                transition: 'all 0.2s', '&:hover': { transform: 'scale(1.02)' },
              }}>Explore the Modules</Box>
              <Box component="button" sx={{
                bgcolor: 'transparent', color: MF.text, border: `1px solid ${MF.outline}`,
                px: 5, py: 1.75, borderRadius: '12px', fontWeight: 700, fontSize: 15,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                '&:hover': { bgcolor: MF.surface },
              }}>Watch Demo Video</Box>
            </Box>
          </Box>
          <Box sx={{ position: 'absolute', top: -120, right: -120, width: 380, height: 380, bgcolor: `${MF.primary}0D`, borderRadius: '50%', filter: 'blur(60px)' }} />
          <Box sx={{ position: 'absolute', bottom: -120, left: -120, width: 380, height: 380, bgcolor: `${MF.secondary}0D`, borderRadius: '50%', filter: 'blur(60px)' }} />
        </Box>

        {/* Bento grid */}
        <Box component="section" sx={{ px: 6, py: 10, bgcolor: MF.surfaceLow }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Box sx={{ mb: 5 }}>
              <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 0.5 }}>Operational Ecosystem</Typography>
              <Typography sx={{ color: MF.textSub }}>A modular suite of tools designed to scale with your ambition.</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(6,1fr)', lg: 'repeat(12,1fr)' }, gap: 3 }}>
              {BENTO.map(({ icon, title, desc, span, bg, iconBg, iconColor }) => (
                <M key={title}
                  initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }}
                  sx={{
                    gridColumn: { md: `span 3`, lg: `span ${span}` },
                    ...glass, p: 3, borderRadius: '24px',
                    ...(bg ? { bgcolor: bg } : {}),
                    transition: 'border-color 0.2s', '&:hover': { borderColor: `${MF.primary}66` },
                  }}>
                  <Box sx={{ width: 48, height: 48, bgcolor: iconBg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <span className="material-symbols-outlined" style={{ color: iconColor }}>{icon}</span>
                  </Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 0.75 }}>{title}</Typography>
                  <Typography sx={{ fontSize: 13, color: MF.textSub, lineHeight: 1.6 }}>{desc}</Typography>
                </M>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Analytics deep-dive */}
        <Box component="section" sx={{ px: 6, py: 10 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 10, alignItems: 'center' }}>
            <M initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary, mb: 1.5 }}>Advanced Insights</Typography>
              <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 2 }}>Analytics that drive profitability</Typography>
              <Typography sx={{ fontSize: 17, color: MF.textSub, mb: 4, lineHeight: 1.65 }}>
                Our analytics engine reveals the 'why' behind customer choices. Track margin-by-item, peak-time velocity, and retention metrics in real-time.
              </Typography>
              {/* Comparison table */}
              <Box sx={{ borderRadius: '16px', border: `1px solid ${MF.outlineVar}`, overflow: 'hidden', bgcolor: MF.surfaceLowest }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', bgcolor: MF.surfaceLow, borderBottom: `1px solid ${MF.outlineVar}` }}>
                  <Typography sx={{ p: 2, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.textSub }}>Traditional</Typography>
                  <Typography sx={{ p: 2, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary }}>With MenuFlow</Typography>
                </Box>
                {[
                  ['Manual daily reconciliation', 'Real-time live dashboard'],
                  ['Weekly physical inventory', 'Automated SKU tracking'],
                  ['Guesses on popularity', 'Heatmaps of customer clicks'],
                ].map(([old, neo]) => (
                  <Box key={old} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${MF.outlineVar}33`, '&:last-child': { borderBottom: 'none' } }}>
                    <Typography sx={{ p: 2, fontSize: 13, color: MF.textSub }}>{old}</Typography>
                    <Typography sx={{ p: 2, fontSize: 13, fontWeight: 700 }}>{neo}</Typography>
                  </Box>
                ))}
              </Box>
            </M>
            <M initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }}>
              <Box sx={{ position: 'relative', group: true }}>
                <Box sx={{ position: 'absolute', inset: -16, background: `linear-gradient(to top right, ${MF.primary}33, ${MF.secondary}33)`, filter: 'blur(40px)', opacity: 0.5, borderRadius: '32px' }} />
                <Box sx={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <Box component="img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK1rysRFeoD2gVetMA9IxrI3YeJAzjug_T5rhGWv3klIg5xQuAm4XgNsg8V6R1dzOC5KrRHiHTA1XHxpkebti7M76XVHtIFm-FdQtzK3enVe3jNK-rVPZUww-2rnf2EFjwGrcNcFT_6i9YrvatkqKoJ34QmpE40A2DSPPfYvL2vxbEtLk07Rj40QFpfoedcAvedjPkYoHFzo6XS7CRC4fKugkSO3pXYHmfJ5sImEE4gpsxKiZfyJs7Y4FJm61wuvptHC2DGRwYWiUQ"
                    sx={{ width: '100%', display: 'block' }} />
                </Box>
                <Box sx={{ position: 'absolute', bottom: -24, left: -24, ...glass, p: 2, borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', minWidth: 180 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 600 }}>+24% Revenue</Typography>
                  </Box>
                  <Box sx={{ height: 8, width: '100%', bgcolor: MF.surface, borderRadius: '9999px', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', bgcolor: '#10b981', width: '70%' }} />
                  </Box>
                </Box>
              </Box>
            </M>
          </Box>
        </Box>

        {/* Workflow / dark section */}
        <Box component="section" sx={{ bgcolor: MF.inverseSurface, color: MF.inverseOnSurface, px: 6, py: 10 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 1.5 }}>Seamless Orchestration</Typography>
              <Typography sx={{ color: MF.outlineVar, maxWidth: 480, mx: 'auto' }}>Watch how MenuFlow connects every touchpoint into a single automated workflow.</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 5 }}>
              {WORKFLOW.map(({ icon, step, desc }) => (
                <Box key={step} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={{ width: 80, height: 80, bgcolor: MF.primaryContainer, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, boxShadow: `0 10px 30px ${MF.primary}33` }}>
                    <span className="material-symbols-outlined" style={{ color: '#fffbff', fontSize: 36 }}>{icon}</span>
                  </Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 1 }}>{step}</Typography>
                  <Typography sx={{ fontSize: 13, color: MF.outlineVar, maxWidth: 200, lineHeight: 1.6 }}>{desc}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Multi-location */}
        <Box component="section" sx={{ px: 6, py: 10, overflow: 'hidden' }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 10, alignItems: 'center' }}>
            <M initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }} sx={{ order: { xs: 2, lg: 1 }, position: 'relative' }}>
              <Box sx={{ position: 'absolute', inset: -16, background: `linear-gradient(to bottom right, ${MF.secondary}33, ${MF.primary}33)`, filter: 'blur(40px)', opacity: 0.5, borderRadius: '32px' }} />
              <Box sx={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', border: `1px solid ${MF.outlineVar}` }}>
                <Box component="img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcon7q_VnXUqZZFg-zls2DNRLXe5v1ekDyOVOoKdTyFj7tws1VoQaklBMl5_yWBP_5lk4CfArpH-CszXh4dXu8kvpG812vcOlqEadMDbEsefn5COC4LbJ6DVeYpTkCnFFsHqSvq25Q8IrNiRR5SmAHfLHhlsVsUg9gJqwlPo3bK6TvHf_mCm4ueeH-CdVgjJijG8IjihshWjN6nVFS3JYjkZx6XYW8pVnjFXjRopJCtZoq6Xd-s8k_6mSqPz9k7x5ubj0eEdxjit8t"
                  sx={{ width: '100%', display: 'block' }} />
              </Box>
            </M>
            <M initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }} sx={{ order: { xs: 1, lg: 2 } }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.secondary, mb: 1.5 }}>Global Control</Typography>
              <Typography variant="h2" sx={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', mb: 2 }}>Multi-location Mastery</Typography>
              <Typography sx={{ fontSize: 17, color: MF.textSub, mb: 5, lineHeight: 1.65 }}>
                Manage 10 or 1,000 locations from a single pane of glass. Push menu updates globally or target specific regions in seconds.
              </Typography>
              {[
                { title: 'Unified Reporting',  desc: 'Aggregate sales data across all branches for macro-level analysis.' },
                { title: 'Role-Based Access',  desc: 'Define permissions for regional managers vs. local floor staff.' },
                { title: 'Inheritance Logic',  desc: 'Update a master menu and watch changes ripple across all child locations.' },
              ].map(({ title, desc }) => (
                <Box key={title} sx={{ display: 'flex', gap: 2, mb: 2.5, alignItems: 'flex-start' }}>
                  <Box sx={{ mt: 0.25, width: 24, height: 24, bgcolor: `${MF.secondary}1A`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ color: MF.secondary, fontSize: 14 }}>done</span>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 0.25 }}>{title}</Typography>
                    <Typography sx={{ fontSize: 13, color: MF.textSub, lineHeight: 1.6 }}>{desc}</Typography>
                  </Box>
                </Box>
              ))}
            </M>
          </Box>
        </Box>

        {/* CTA */}
        <Box component="section" sx={{ bgcolor: MF.primary, color: '#fff', px: 6, py: 10 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', textAlign: 'center' }}>
            <Typography variant="h1" sx={{ fontSize: { xs: 36, md: 48 }, fontWeight: 700, letterSpacing: '-0.03em', mb: 2 }}>Ready to transform your service?</Typography>
            <Typography sx={{ fontSize: 17, opacity: 0.9, maxWidth: 520, mx: 'auto', mb: 5, lineHeight: 1.65 }}>
              Join over 2,500 premium restaurants worldwide that rely on MenuFlow for their daily operations.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box component="button" onClick={() => navigate('/register')} sx={{ bgcolor: '#fff', color: MF.primary, px: 5, py: 1.75, borderRadius: '12px', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 15px 30px rgba(0,0,0,0.2)', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)' } }}>Start 14-Day Free Trial</Box>
              <Box component="button" sx={{ border: '1px solid rgba(255,255,255,0.3)', bgcolor: 'transparent', color: '#fff', px: 5, py: 1.75, borderRadius: '12px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>Schedule a Personal Demo</Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <MenuFlowFooter />
    </Box>
  );
}
