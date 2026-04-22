import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  fadeUp, fadeIn, slideLeft, slideRight, scaleUp,
  staggerContainer, float, scrollViewport,
} from '../hooks/useScrollAnimation';

/* Convenience wrappers */
const M = motion.create(Box);
const MTypo = motion.create(Typography);

export default function LandingPage() {
  const T = useTokens();
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', color: T.text, fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ─── TopNavBar ─── */}
      <M
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        component="nav"
        sx={{
          position: 'fixed', top: 0, width: '100%', zIndex: 50,
          bgcolor: T.navBg, backdropFilter: 'blur(20px)',
          boxShadow: '0px 20px 40px rgba(18,28,42,0.06)',
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: 3, height: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em', color: T.text }}>
              The Curated Canvas
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
              {['Features', 'Pricing', 'Admin', 'Help'].map((item) => (
                <Typography key={item} component="a" href={`#${item.toLowerCase()}`} sx={{
                  fontWeight: 600, letterSpacing: '-0.025em', color: T.textSub,
                  textDecoration: 'none', transition: 'color 0.3s', '&:hover': { color: T.text },
                }}>
                  {item}
                </Typography>
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box component="button" onClick={() => navigate('/login')} sx={{
              display: { xs: 'none', sm: 'block' }, color: T.textSub, fontWeight: 600,
              letterSpacing: '-0.025em', px: 2, py: 1, border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
            }}>Login</Box>
            <Box component="button" onClick={() => navigate('/register')} sx={{
              bgcolor: '#6c5ce7', color: '#faf6ff', px: 3, py: 1.5, borderRadius: '9999px',
              fontWeight: 600, letterSpacing: '-0.025em', border: 'none', cursor: 'pointer',
              transition: 'all 0.3s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
              '&:active': { transform: 'scale(0.95)' },
            }}>Get Started</Box>
          </Box>
        </Box>
      </M>

      <Box component="main" sx={{ pt: '80px' }}>

        {/* ═══════════════════════════════════════════════
            HERO SECTION — staggered entrance
            ═══════════════════════════════════════════════ */}
        <Box component="section" sx={{ position: 'relative', overflow: 'hidden', pt: 10, pb: 16 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', px: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 8, alignItems: 'center' }}>

            {/* Left: Copy — stagger children */}
            <M
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              sx={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', zIndex: 10 }}
            >
              <M variants={fadeUp} custom={0} sx={{
                alignSelf: 'flex-start', px: 2, py: 0.75, borderRadius: '9999px',
                bgcolor: T.surfaceHigh, color: T.accent,
                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
              }}>
                FOR MODERN RESTAURATEURS
              </M>

              <MTypo variants={fadeUp} custom={1} variant="h1" sx={{
                fontSize: { xs: '3.75rem', lg: '4.5rem' }, fontWeight: 900,
                letterSpacing: '-0.05em', color: T.text, lineHeight: 1.1,
              }}>
                Create QR Menus &amp; Accept Orders —{' '}
                <Box component="span" sx={{ color: T.accent, fontStyle: 'italic' }}>No App Needed</Box>.
              </MTypo>

              <MTypo variants={fadeUp} custom={2} sx={{
                fontSize: '1.25rem', color: T.textSub, maxWidth: '32rem', lineHeight: 1.625,
              }}>
                Transform your dining experience with digital layers. From contactless browsing
                to instant settlements, all through a beautiful QR scan.
              </MTypo>

              {/* CTA */}
              <M variants={fadeUp} custom={3} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, pt: 2 }}>
                <Box component="button" onClick={() => navigate('/register')} sx={{
                  background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)', color: '#fff',
                  px: 5, py: 2.5, borderRadius: '9999px', fontWeight: 700, fontSize: '1.125rem',
                  border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                  cursor: 'pointer', transition: 'transform 0.3s', fontFamily: 'Inter, sans-serif',
                  '&:hover': { transform: 'scale(1.05)' },
                }}>
                  Start Free Trial
                </Box>
                <Box component="button" sx={{
                  bgcolor: T.surfaceHighest, color: T.text,
                  border: `2px solid ${T.border}`, px: 5, py: 2.5, borderRadius: '9999px',
                  fontWeight: 700, fontSize: '1.125rem', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 1, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}>
                  <span className="material-symbols-outlined">play_circle</span> Watch Demo
                </Box>
              </M>

              {/* Social Proof */}
              <M variants={fadeUp} custom={4} sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 3 }}>
                <Box sx={{ display: 'flex', ml: 1.5 }}>
                  {[
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuB10D0P8QIqZRQotvMEkSAFWyLz93t8b-unRu2akXGYz1rTIekmzJLhaUvPL-BjZR8q8z3yOrLRVKc6zEjCrDFx4_6yEAvZOv8zK9U9BBGq8yRvKcYRMjg-Uz--paFD99H4K-4yhQMeojcBYaliSzeBYQoq7_C9EHxSnmjt1av43EEP_bPcGfyONfW3ZUcOFlHivMgupApXcLhTpMjM_d57qtVfpJcfcf10AHDGcyFbqPEW772A1l74NO2Pft-PfJdc17LCxkOIZKg',
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBKc0nizbg3yNfhm9J7KaE1z3aaJnPdPVB4KTgYHNaj40p4Qr4E568NxaMQyY1Xs8osOInx1WRhV21DOeF--MFk7MS5H2E07Qa2aP9U05RdDvyb0hMLl_LzMiFkr_qcRKfr6ANcLAdgYAjv8c3uOA8zjssm-bSe6LpN8IzFeL7dGFx5s052qB7vWigGMTlBRwwDGUprE5RLY9rIc3V4mUp9UGnUDlZExUZ_BK9Z_lH27esUE4CPggNuvfLodArrn6izg1p9uHiz13A',
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDCzIdsdQAPJ3q7MkRxZeGpsdc_REahHYb2MYE_QVY9e4OnJIDAEEEi7o8PJJ8pjGPFXMaqwPzBEON6ip5BMiuiC-gP637A9tiSFtarDOr3t2HBw5FqnaAKx8zcI-9FgZBhqTvZJxZvHd7MxA0FLwu0gGN0Yk_QMfafz3pPOywo4gMr-IQAt4Re6ILFE6JXXqbQrMiaDNZamsLh3ope7rWK8rF3LMVml1s6-NhDbY9oFERgdxi1SEmO3dFVYMyz7yKGaWKqoX8G9fg',
                  ].map((src, i) => (
                    <Box component="img" key={i} src={src} alt="" sx={{
                      width: 40, height: 40, borderRadius: '50%', border: '2px solid #fff',
                      objectFit: 'cover', ml: i === 0 ? 0 : -1.5,
                    }} />
                  ))}
                </Box>
                <Typography sx={{ color: T.textSub, fontWeight: 500 }}>Trusted by 500+ Indian Outlets</Typography>
              </M>
            </M>

            {/* Right: Hero Image — slide from right + float */}
            <M
              initial={{ opacity: 0, x: 100, rotate: 6 }}
              animate={{ opacity: 1, x: 0, rotate: 3 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              sx={{ position: 'relative' }}
            >
              <Box sx={{
                position: 'absolute', top: '-5rem', right: '-5rem',
                width: '24rem', height: '24rem', bgcolor: 'rgba(83,65,205,0.1)',
                borderRadius: '50%', filter: 'blur(120px)',
              }} />
              <Box sx={{
                position: 'relative', bgcolor: T.surfaceAlt, borderRadius: '3rem', p: 2,
                boxShadow: T.shadowHov, transform: 'scale(1.05)',
              }}>
                <Box component="img"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUdCF2iwobeYHFcwjhD9VvTMWevamBK0X7ncEo-gTwdmecbVsXTTRd7trpEnu1QE3FH3IJ7UBYu93QLeQCAxr4AjNoV1W4-mCxxsqTVE73QGVNn2IBRtWzoh-fMvOJPPvGu0f_UgriixkcwP6zJnZReMyFUVzL8irOqxPmmook-eEyYcsDWpUgnaFlSCf6kvhEzkgd-xLrRdAwSptnWcMyWOr7L9pfLBuahz5Loivk6fm1yP2io0QgNUAD-flVqO0Z3oNN82Lfs6k"
                  alt="Menu Preview"
                  sx={{ borderRadius: '2rem', width: '100%' }}
                />
                {/* Floating card — continuous float animation */}
                <M
                  animate={float.animate}
                  sx={{
                    position: 'absolute', bottom: '-2rem', left: '-2rem',
                    bgcolor: '#fff', p: 3, borderRadius: '1.5rem',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', transform: 'rotate(-3deg)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 40, height: 40, bgcolor: '#6cf8bb', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00714d',
                    }}>
                      <span className="material-symbols-outlined">payments</span>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Order</Typography>
                      <Typography sx={{ fontSize: '1.125rem', fontWeight: 900, color: T.text }}>₹2,450.00</Typography>
                    </Box>
                  </Box>
                </M>
              </Box>
            </M>
          </Box>
        </Box>

        {/* ═══════════════════════════════════════════════
            FEATURES — scroll-triggered bento grid
            ═══════════════════════════════════════════════ */}
        <Box component="section" id="features" sx={{ py: 16, bgcolor: T.surfaceAlt }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', px: 3 }}>

            {/* Section Header */}
            <M
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={scrollViewport}
              sx={{ textAlign: 'center', mb: 10 }}
            >
              <MTypo variants={fadeUp} custom={0} variant="h2" sx={{ fontSize: { xs: '2.25rem', lg: '3rem' }, fontWeight: 900, letterSpacing: '-0.025em', color: T.text, mb: 2 }}>
                Precision Tools for Fine Dining.
              </MTypo>
              <MTypo variants={fadeUp} custom={1} sx={{ fontSize: '1.25rem', color: T.textSub, maxWidth: '42rem', mx: 'auto', lineHeight: 1.625 }}>
                We provide a seamless digital layer for your physical space, focusing on speed and aesthetics.
              </MTypo>
            </M>

            {/* Bento Grid — each card enters independently */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 4 }}>

              {/* QR Menu — 8 cols */}
              <M
                variants={scaleUp} custom={0}
                initial="hidden" whileInView="visible" viewport={scrollViewport}
                sx={{
                  gridColumn: { md: 'span 8' }, bgcolor: T.surface, borderRadius: '0.75rem', p: 5,
                  boxShadow: T.shadowHov, position: 'relative', overflow: 'hidden',
                  '&:hover img': { transform: 'rotate(0deg)' },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '24rem' }}>
                    <Box sx={{ width: 48, height: 48, bgcolor: T.accentDim, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                      <span className="material-symbols-outlined">qr_code_2</span>
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '1.875rem', fontWeight: 900, color: T.text }}>Dynamic QR Menu</Typography>
                    <Typography sx={{ color: T.textSub, lineHeight: 1.625 }}>Update prices, hide out-of-stock items, and change layouts in real-time. No re-printing required.</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    {['Instant Sync', 'Image Rich'].map(tag => (
                      <Box key={tag} sx={{ px: 2, py: 1, bgcolor: T.bg, borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.text }}>
                        {tag}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="img"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiOZJ47YbgH4nGQdsvSxF72JXb8sEvZ7_TNE295QQMy2ak6EmPhBjfTlH-KTbaR2fuQ9gfj9fMaqU1SlESF6uy_XXblT8M4YyjMQzXK9Sww0OcAFSt7v01zebAhDLfBeo6Ol4-MoNzFdLzGOzPp3W3jWWy5i3JIOJx7tvXFUUytFYo1DnUVlz3oN8INL2krw9kOKeCXsoqVuN78MxNPpFQZ0NZGvAKRIX1BmLvjVcjUoeIMo8eJlKVeeJOm_PXwLtRW8EI0XMqTxk"
                  alt="QR Menu"
                  sx={{ position: 'absolute', right: '-5rem', bottom: '-5rem', width: '66%', transform: 'rotate(-15deg)', transition: 'transform 0.7s', borderRadius: '1.5rem' }}
                />
              </M>

              {/* Order Mgmt — 4 cols */}
              <M
                variants={scaleUp} custom={1}
                initial="hidden" whileInView="visible" viewport={scrollViewport}
                sx={{
                  gridColumn: { md: 'span 4' }, bgcolor: T.accent, color: '#fff',
                  borderRadius: '0.75rem', p: 5, boxShadow: T.shadowHov,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined">restaurant</span>
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '1.875rem', fontWeight: 900 }}>Live Order Management</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.625 }}>KOT management, table-wise tracking, and status updates for your kitchen crew.</Typography>
                  </Box>
                  <Typography component="button" sx={{
                    mt: 4, color: '#fff', display: 'flex', alignItems: 'center', gap: 1,
                    fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', p: 0,
                    fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                  }}>
                    Learn More <span className="material-symbols-outlined">arrow_forward</span>
                  </Typography>
                </Box>
              </M>

              {/* Analytics — 5 cols */}
              <M
                variants={fadeUp} custom={0}
                initial="hidden" whileInView="visible" viewport={scrollViewport}
                sx={{ gridColumn: { md: 'span 5' }, bgcolor: T.surface, borderRadius: '0.75rem', p: 5, boxShadow: T.shadowHov }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ width: 48, height: 48, bgcolor: '#6c5ce7', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#faf6ff' }}>
                    <span className="material-symbols-outlined">insights</span>
                  </Box>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 900, color: T.text }}>Deep Analytics</Typography>
                  <Typography sx={{ color: T.textSub, lineHeight: 1.625 }}>Understand your bestsellers, peak hours, and customer spending habits with visual heatmaps.</Typography>
                </Box>
              </M>

              {/* OTP — 7 cols */}
              <M
                variants={fadeUp} custom={1}
                initial="hidden" whileInView="visible" viewport={scrollViewport}
                sx={{
                  gridColumn: { md: 'span 7' }, bgcolor: T.surface, borderRadius: '0.75rem', p: 5,
                  boxShadow: T.shadowHov, border: `1px solid ${T.border}`,
                }}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 4, alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, bgcolor: '#6cf8bb', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00714d' }}>
                      <span className="material-symbols-outlined">lock_person</span>
                    </Box>
                    <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 900, color: T.text }}>Secure OTP Login</Typography>
                    <Typography sx={{ color: T.textSub, lineHeight: 1.625 }}>Zero friction for guests. No passwords. Authenticate instantly via phone number for orders and loyalty.</Typography>
                  </Box>
                  <Box sx={{ bgcolor: T.surfaceContainer, p: 3, borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ height: 8, width: '50%', bgcolor: 'rgba(200,196,215,0.3)', borderRadius: '9999px' }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {['5','8','3','9'].map(n => (
                        <Box key={n} sx={{
                          height: 40, width: 40, bgcolor: '#fff',
                          border: '1px solid rgba(200,196,215,0.2)', borderRadius: '0.25rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: T.text,
                        }}>{n}</Box>
                      ))}
                    </Box>
                    <Box sx={{ height: 32, width: '100%', bgcolor: T.accent, borderRadius: '9999px' }} />
                  </Box>
                </Box>
              </M>
            </Box>
          </Box>
        </Box>

        {/* ═══════════════════════════════════════════════
            PRICING — staggered card entrance
            ═══════════════════════════════════════════════ */}
        <Box component="section" id="pricing" sx={{ py: 16, bgcolor: T.bg }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', px: 3 }}>

            {/* Header */}
            <M
              variants={staggerContainer} initial="hidden" whileInView="visible" viewport={scrollViewport}
              sx={{ textAlign: 'center', mb: 10 }}
            >
              <MTypo variants={fadeUp} custom={0} variant="h2" sx={{ fontSize: { xs: '2.25rem', lg: '3rem' }, fontWeight: 900, letterSpacing: '-0.025em', color: T.text, mb: 2 }}>
                Simple Pricing. Infinite Growth.
              </MTypo>
              <MTypo variants={fadeUp} custom={1} sx={{ fontSize: '1.25rem', color: T.textSub, maxWidth: '42rem', mx: 'auto', lineHeight: 1.625 }}>
                Choose the canvas that fits your scale.
              </MTypo>
            </M>

            {/* Pricing Cards */}
            <M
              variants={staggerContainer}
              initial="hidden" whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(3, 1fr)' }, gap: 4 }}
            >
              {/* Starter */}
              <M variants={fadeUp} custom={0} sx={{
                bgcolor: T.surfaceAlt, p: 5, borderRadius: '0.75rem',
                display: 'flex', flexDirection: 'column', gap: 4,
                border: '2px solid transparent', transition: 'all 0.3s',
                '&:hover': { borderColor: 'rgba(200,196,215,0.3)' },
              }}>
                <Box>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 1, color: T.text }}>Starter</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: T.text }}>₹0</Typography>
                    <Typography sx={{ color: T.textSub }}>/mo</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['Digital QR Menu', 'Up to 25 items', 'Basic Analytics'].map(f => (
                    <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: T.textSub }}>
                      <span className="material-symbols-outlined" style={{ color: '#006c49', fontSize: '0.875rem' }}>check_circle</span> {f}
                    </Box>
                  ))}
                </Box>
                <Box component="button" sx={{
                  mt: 'auto', width: '100%', py: 2, borderRadius: '9999px',
                  border: `2px solid ${T.accent}`, color: T.accent, fontWeight: 700,
                  bgcolor: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  '&:hover': { bgcolor: T.accentDim },
                }}>Select Plan</Box>
              </M>

              {/* Growth — Featured */}
              <M variants={fadeUp} custom={1} sx={{
                bgcolor: '#fff', p: 5, borderRadius: '0.75rem',
                display: 'flex', flexDirection: 'column', gap: 4,
                boxShadow: T.shadowHov, border: '2px solid #6c5ce7',
                position: 'relative', transform: { md: 'scale(1.05)' }, zIndex: 10,
              }}>
                <Box sx={{
                  position: 'absolute', top: 0, right: 40, transform: 'translateY(-50%)',
                  bgcolor: T.accent, color: '#fff', px: 2, py: 0.5, borderRadius: '9999px',
                  fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>Popular</Box>
                <Box>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 1, color: T.text }}>Growth</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: T.text }}>₹999</Typography>
                    <Typography sx={{ color: T.textSub }}>/mo</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['Everything in Starter', 'Unlimited Items', 'Direct WhatsApp Ordering', 'Advanced Dashboard'].map(f => (
                    <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: T.text }}>
                      <span className="material-symbols-outlined" style={{ color: '#006c49', fontSize: '0.875rem' }}>check_circle</span> {f}
                    </Box>
                  ))}
                </Box>
                <Box component="button" sx={{
                  mt: 'auto', width: '100%', py: 2, borderRadius: '9999px',
                  bgcolor: '#6c5ce7', color: '#faf6ff', fontWeight: 700,
                  border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  transition: 'filter 0.3s', '&:hover': { filter: 'brightness(1.1)' },
                }}>Select Plan</Box>
              </M>

              {/* Pro */}
              <M variants={fadeUp} custom={2} sx={{
                bgcolor: T.surfaceAlt, p: 5, borderRadius: '0.75rem',
                display: 'flex', flexDirection: 'column', gap: 4,
                border: '2px solid transparent', transition: 'all 0.3s',
                '&:hover': { borderColor: 'rgba(200,196,215,0.3)' },
              }}>
                <Box>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 1, color: T.text }}>Pro</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: T.text }}>₹2499</Typography>
                    <Typography sx={{ color: T.textSub }}>/mo</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['Everything in Growth', 'Multi-outlet Support', 'POS Integration', 'Dedicated Manager'].map(f => (
                    <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: T.textSub }}>
                      <span className="material-symbols-outlined" style={{ color: '#006c49', fontSize: '0.875rem' }}>check_circle</span> {f}
                    </Box>
                  ))}
                </Box>
                <Box component="button" sx={{
                  mt: 'auto', width: '100%', py: 2, borderRadius: '9999px',
                  border: `2px solid ${T.text}`, color: T.text, fontWeight: 700,
                  bgcolor: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  '&:hover': { bgcolor: 'rgba(18,28,42,0.05)' },
                }}>Select Plan</Box>
              </M>
            </M>
          </Box>
        </Box>

        {/* ═══════════════════════════════════════════════
            CTA BANNER — scale in from centre
            ═══════════════════════════════════════════════ */}
        <Box component="section" sx={{ py: 12 }}>
          <M
            variants={scaleUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            sx={{
              maxWidth: 1024, mx: 'auto', px: 3, textAlign: 'center',
              background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)',
              borderRadius: '3rem', p: 10, color: '#fff',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent)' }} />
            <M variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} sx={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <MTypo variants={fadeUp} custom={0} variant="h2" sx={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.025em' }}>
                Ready to curate your experience?
              </MTypo>
              <MTypo variants={fadeUp} custom={1} sx={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', maxWidth: '36rem', mx: 'auto' }}>
                Join hundreds of restaurants growing with The Curated Canvas. Start your 14-day free trial today.
              </MTypo>
              <M variants={fadeUp} custom={2} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                <Box component="button" onClick={() => navigate('/register')} sx={{
                  bgcolor: '#fff', color: T.accent, px: 6, py: 2.5, borderRadius: '9999px',
                  fontWeight: 900, fontSize: '1.25rem', border: 'none', fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', cursor: 'pointer',
                  transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' },
                }}>Start Free Trial</Box>
                <Box component="button" sx={{
                  color: '#fff', fontWeight: 700, textDecoration: 'underline',
                  textUnderlineOffset: '8px', px: 6, py: 2.5, border: 'none',
                  background: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}>Speak with Sales</Box>
              </M>
            </M>
          </M>
        </Box>
      </Box>

      {/* ─── Footer — fade in ─── */}
      <M
        variants={fadeIn} initial="hidden" whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        component="footer"
        sx={{ width: '100%', py: 6, bgcolor: '#EFF4FF', mt: 10 }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4 }}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 900, color: '#121C2A' }}>The Curated Canvas</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
            {['Privacy Policy', 'Terms of Service', 'Contact Us', 'Documentation'].map(link => (
              <Typography key={link} component="a" href="#" sx={{
                fontSize: '0.875rem', color: '#474554', textDecoration: 'underline',
                transition: 'color 0.3s', '&:hover': { color: '#121C2A' },
              }}>{link}</Typography>
            ))}
          </Box>
          <Typography sx={{ fontSize: '0.875rem', color: '#474554' }}>
            © 2024 The Curated Canvas. Physical layers for digital experiences.
          </Typography>
        </Box>
      </M>
    </Box>
  );
}
