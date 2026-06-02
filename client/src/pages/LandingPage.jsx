import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MenuFlowNav from './menuflow/MenuFlowNav';
import MenuFlowFooter from './menuflow/MenuFlowFooter';
import { MF, glass } from './menuflow/mfTheme';

const M = motion.create(Box);

const floatAnim = {
  animate: { y: [0, -20, 0], transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' } },
};
const reveal = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };


const STEPS = [
  { n: '01', title: 'Create Restaurant Profile', desc: 'Enter your basic info, upload your brand logo, and set your theme colors.' },
  { n: '02', title: 'Upload Your Menu', desc: 'Use our bulk importer or manual editor to add items, descriptions, and photography.' },
  { n: '03', title: 'Generate & Print QRs', desc: 'Select from high-quality templates and print your custom QR codes for tables.' },
  { n: '04', title: 'Receive Orders Instantly', desc: 'Orders flow directly to your kitchen tablet or POS. No more manual entry.' },
  { n: '05', title: 'Track Performance', desc: 'Analyze sales trends, peak hours, and popular dishes with our analytics dashboard.' },
];

const PRICING = [
  { name: 'Starter', price: '$49', features: ['Digital QR Menu', '100 orders/month', 'Basic Analytics'], featured: false },
  { name: 'Growth',  price: '$129', features: ['Full Order Management', 'Unlimited Orders', 'POS Integration', 'Priority Support'], featured: true },
  { name: 'Pro',     price: '$299', features: ['Multi-location Support', 'Advanced API Access', 'Custom Branding'], featured: false },
];

const METRICS = [
  { val: '1000+', label: 'Restaurants' },
  { val: '50k+',  label: 'Orders Handled' },
  { val: '99.9%', label: 'Uptime Guarantee' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: MF.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: MF.text, overflowX: 'hidden' }}>
      <MenuFlowNav />

      <Box component="main" sx={{ pt: '72px' }}>

        {/* ── Hero ── */}
        <Box component="section" sx={{ pt: 10, pb: 10, px: 6, maxWidth: 1280, mx: 'auto', overflow: 'hidden' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center' }}>
            {/* Left copy */}
            <M initial="hidden" animate="visible" variants={reveal}>
              <Typography variant="h1" sx={{ fontSize: { xs: 40, md: 48 }, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, mb: 2 }}>
                Transform Restaurant Ordering With Smart QR Menus
              </Typography>
              <Typography sx={{ fontSize: 18, color: MF.textSub, mb: 5, maxWidth: 480, lineHeight: 1.6 }}>
                Create beautiful digital menus, accept customer orders instantly, manage everything from one dashboard.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box component="button" onClick={() => navigate('/register')} sx={{
                  background: MF.gradient, color: '#fff', px: 5, py: 1.75,
                  borderRadius: '12px', fontWeight: 700, fontSize: 15, border: 'none',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 8px 24px rgba(70,72,212,0.25)', transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.02)' },
                }}>Start Free Trial</Box>
                <Box component="button" onClick={() => navigate('/how-it-works')} sx={{
                  bgcolor: MF.surfaceLowest, color: MF.text, border: `1px solid ${MF.outlineVar}`,
                  px: 5, py: 1.75, borderRadius: '12px', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                  '&:hover': { bgcolor: MF.surfaceLow },
                }}>Book Demo</Box>
              </Box>
            </M>

            {/* Right mockup */}
            <Box sx={{ position: 'relative', height: 560, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Tablet (back) */}
              <Box sx={{ position: 'absolute', top: -32, right: -24, width: '90%', ...glass, borderRadius: '16px', p: 1.5, transform: 'rotate(3deg)', boxShadow: '0 30px 60px rgba(0,0,0,0.15)' }}>
                <Box component="img"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ_WYnbpOzs7xe7afJl-0Uy3bVZ-vAOlJyoUt1R_greVUzSVxEaw67WQIez36reH4ERUGF0s1SH-SuJv5fCfkbkN7WivLUK7uR5CVKzoMAIHbjGZcoSu24BPYzCKawOwtIGl1g9qXqkWmoi4rE3vIDGguk7K9E_xhnb55obMsIkW9UPxMZCyZSIk693NAbGeTq7lKoQu4idMntRgkz9cIJdY8G6qc0gpCAVE5KoDw8ciioVMZEFPmJYr5qcpU8k453MmTNG5BJzQtb"
                  sx={{ width: '100%', borderRadius: '10px' }}
                />
              </Box>
              {/* Phone (front, floating) */}
              <M {...floatAnim} sx={{ position: 'relative', zIndex: 20, width: 200, mx: 'auto', bgcolor: '#111', borderRadius: '36px', p: '10px', border: '3px solid #333', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
                <Box sx={{ bgcolor: '#fff', borderRadius: '28px', overflow: 'hidden', aspectRatio: '9/19.5' }}>
                  <Box component="img"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk2Sw6iIz2GjGEoQSx1NI271wanBTfqFa4yld80ldfVulMYdU_1JptfWwSxvpGz39QHl1V3Se_oLrxwLNhA21iMQXEEl4bcJk-hDLP789iaUF4ViB6DRTBl5JorfigecpT6zVqxpwcghYaz6RB3-cmPVkqIRPMpYKfEN-b661bRFPsC5cMc4CEDK1ATL4HM8MKm47AvQS6NSXTDNv7SuOA2MThVBQAP1U_tHcw6pYcYFxDyOefHscRoLug_m6aDrvu33UWeO69_hl5"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              </M>
              {/* Floating widget 1 */}
              <M animate={{ y: [0, -14, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 } }}
                sx={{ position: 'absolute', bottom: 20, left: -24, zIndex: 30, ...glass, p: 2, borderRadius: '12px', minWidth: 160 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 20, fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                  <Typography sx={{ fontSize: 12, fontWeight: 700 }}>New Order</Typography>
                </Box>
                <Typography sx={{ fontSize: 20, fontWeight: 900, color: MF.primary }}>$42.50</Typography>
                <Typography sx={{ fontSize: 11, color: MF.outlineVar }}>Table 4 • Just now</Typography>
              </M>
              {/* Floating widget 2 */}
              <M animate={{ y: [0, -14, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 4 } }}
                sx={{ position: 'absolute', top: 60, left: -40, zIndex: 10, ...glass, p: 2, borderRadius: '12px', minWidth: 148 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <span className="material-symbols-outlined" style={{ color: MF.tertiaryContainer, fontSize: 20, fontVariationSettings: "'FILL' 1" }}>insights</span>
                  <Typography sx={{ fontSize: 12, fontWeight: 700 }}>Daily Sales</Typography>
                </Box>
                <Typography sx={{ fontSize: 20, fontWeight: 900, color: MF.tertiaryContainer }}>+24%</Typography>
                <Typography sx={{ fontSize: 11, color: MF.outlineVar }}>vs yesterday</Typography>
              </M>
            </Box>
          </Box>
        </Box>

        {/* ── Feature 1 ── */}
        <Box component="section" sx={{ py: 10, maxWidth: 1280, mx: 'auto', px: 6 }}>
          <M initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true, amount: 0.2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center' }}>
              <Box sx={{ position: 'relative', order: { xs: 2, md: 1 } }}>
                <Box sx={{ ...glass, borderRadius: '32px', overflow: 'hidden', p: 2, boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}>
                  <Box component="img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAm3GYr61MSasmMEKMfNCsWh2EPaGuEcK889npWz6U4X4qsuvdqqSsCnPiOLEkrS-hN8UffJnnBDjNRL6iX6qRF2cviNanf7OCRNsJMI4utFKe3nlS_GmOVWTpV6ibdx_BM351Jj4LM8FY-DT3vahZw5sMaC_x_U8Mm0vD6HMDn8xs4QQgmS5PZDNlvIfNHPRCJtPTQD1ZzxJ--_GoE5QCg1XvTqaqs2H50t3HYdGDpJp60ANVozLmMboUXYRZYfAKcfMR0b42tf3l"
                    sx={{ width: '100%', borderRadius: '20px' }}
                  />
                </Box>
                <Box sx={{ position: 'absolute', bottom: -24, right: -24, ...glass, p: 2.5, borderRadius: '16px', width: 220, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ bgcolor: MF.primaryFixed, color: MF.primaryContainer, width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                    <span className="material-symbols-outlined">qr_code_2</span>
                  </Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>Instant Generation</Typography>
                  <Typography sx={{ fontSize: 13, color: MF.textSub }}>One click to create custom branded QR codes.</Typography>
                </Box>
              </Box>
              <Box sx={{ order: { xs: 1, md: 2 } }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary, mb: 2 }}>Experience</Typography>
                <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 32 }, fontWeight: 600, letterSpacing: '-0.02em', mb: 2 }}>Digital QR Menus That Sell</Typography>
                <Typography sx={{ fontSize: 17, color: MF.textSub, mb: 5, lineHeight: 1.65 }}>
                  Ditch the paper and embrace the future. Our menus are lightning-fast, mobile-optimized, and proven to increase average order value by 15%.
                </Typography>
                {['Dynamic updates in real-time', 'Multi-language support for tourists', 'Nutritional and allergen filtering'].map(f => (
                  <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <span className="material-symbols-outlined" style={{ color: MF.primary }}>check_circle</span>
                    <Typography sx={{ fontSize: 15 }}>{f}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </M>
        </Box>

        {/* ── Feature 2 ── */}
        <Box component="section" sx={{ py: 10, maxWidth: 1280, mx: 'auto', px: 6 }}>
          <M initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true, amount: 0.2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.secondary, mb: 2 }}>Convenience</Typography>
                <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 32 }, fontWeight: 600, letterSpacing: '-0.02em', mb: 2 }}>Seamless Customer Ordering</Typography>
                <Typography sx={{ fontSize: 17, color: MF.textSub, mb: 4, lineHeight: 1.65 }}>
                  Give your customers the power to order and pay without waiting for a server. Reduce friction and increase table turnover.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: MF.primary, fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/features')}>
                  <Typography sx={{ fontWeight: 700, color: MF.primary }}>Learn about Ordering</Typography>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Box>
              </Box>
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ ...glass, borderRadius: '32px', p: 2 }}>
                  <Box component="img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlsdgdsLp4j95saVeerwQhuuLOFTGwpHNjeTSvXML8IZAkDyYmQ_Pq2VWHneLfJ0VIt3wE-hgZs2dsf2iubR2vzrIzOji7ClNrivzVlkBy0-LVdOIS-ulCSt2xUqYtl3ojfSx2nHDJyTnIasYwtNKonTzERdPXJvhnphetMry2QvIiHuKPXZIzn8GQVRjRZHQUxPssyB5LkHSLvosbNxaKjWaz6OR1_oeY2O3tzEnBG3sujXRetg_bh-4pvJbxRNq_hlSj4ZgXOmZn"
                    sx={{ width: '100%', borderRadius: '20px' }} />
                </Box>
                <Box sx={{ position: 'absolute', top: -28, right: -8, ...glass, p: 1.5, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ bgcolor: '#d1fae5', color: '#065f46', p: 1, borderRadius: '50%', display: 'flex' }}>
                    <span className="material-symbols-outlined">payments</span>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Payment Success</Typography>
                    <Typography sx={{ fontSize: 11, color: MF.outlineVar }}>Apple Pay • $84.00</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </M>
        </Box>

        {/* ── How It Works (dark) ── */}
        <Box component="section" sx={{ bgcolor: MF.inverseSurface, color: MF.inverseOnSurface, py: 10 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', px: 6 }}>
            <Box sx={{ mb: 8, textAlign: 'center' }}>
              <Typography variant="h1" sx={{ fontSize: { xs: 36, md: 48 }, fontWeight: 700, letterSpacing: '-0.03em', mb: 1.5 }}>How It Works</Typography>
              <Typography sx={{ color: MF.outlineVar, maxWidth: 520, mx: 'auto', fontSize: 17 }}>Five simple steps to take your restaurant digital.</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STEPS.map(({ n, title, desc }) => (
                <M key={n} initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true, amount: 0.3 }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
                    <Typography sx={{ fontSize: 80, fontWeight: 900, color: `${MF.primary}4D`, lineHeight: 1, minWidth: 120, textAlign: 'center' }}>{n}</Typography>
                    <Box>
                      <Typography variant="h3" sx={{ fontSize: 24, fontWeight: 600, mb: 1 }}>{title}</Typography>
                      <Typography sx={{ fontSize: 16, color: MF.outlineVar, lineHeight: 1.65 }}>{desc}</Typography>
                    </Box>
                  </Box>
                </M>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── Metrics ── */}
        <Box component="section" sx={{ py: 10, maxWidth: 1280, mx: 'auto', px: 6 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 5, textAlign: 'center' }}>
            {METRICS.map(({ val, label }) => (
              <M key={val} initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }}>
                <Typography sx={{ fontSize: { xs: 56, md: 64 }, fontWeight: 900, color: MF.primary, lineHeight: 1.1, letterSpacing: '-0.04em' }}>{val}</Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: MF.textSub, textTransform: 'uppercase', letterSpacing: '0.08em', mt: 1 }}>{label}</Typography>
              </M>
            ))}
          </Box>
        </Box>

        {/* ── Pricing preview ── */}
        <Box component="section" sx={{ py: 10, bgcolor: MF.surfaceLow, px: 6 }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 32 }, fontWeight: 600, letterSpacing: '-0.02em', mb: 1.5 }}>Pricing for Every Growth Stage</Typography>
              <Typography sx={{ color: MF.textSub, fontSize: 16 }}>Choose the plan that fits your restaurant's volume.</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3, alignItems: 'center' }}>
              {PRICING.map(({ name, price, features, featured }) => (
                <M key={name} initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true }}>
                  <Box sx={{
                    ...glass, borderRadius: '24px', p: 5,
                    ...(featured ? { border: `2px solid ${MF.primary}4D`, outline: `2px solid ${MF.primary}1A`, transform: 'scale(1.05)', zIndex: 1 } : {}),
                    position: 'relative',
                  }}>
                    {featured && (
                      <Box sx={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', bgcolor: MF.primary, color: '#fff', px: 2, py: 0.5, borderRadius: '9999px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Most Popular
                      </Box>
                    )}
                    <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 1 }}>{name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 4 }}>
                      <Typography sx={{ fontSize: 32, fontWeight: 900, color: MF.primary }}>{price}</Typography>
                      <Typography sx={{ color: MF.outlineVar }}>/mo</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5 }}>
                      {features.map(f => (
                        <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 20 }}>check</span>
                          <Typography sx={{ fontSize: 15 }}>{f}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box component="button" onClick={() => navigate('/pricing')} sx={{
                      width: '100%', py: 1.5, borderRadius: '12px',
                      ...(featured ? { background: MF.gradient, color: '#fff', border: 'none', boxShadow: `0 8px 24px ${MF.primary}4D` } : { bgcolor: 'transparent', border: `1px solid ${MF.outlineVar}`, color: MF.text }),
                      fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.2s', '&:hover': { transform: featured ? 'scale(1.02)' : undefined, bgcolor: featured ? undefined : MF.surface },
                    }}>
                      {featured ? 'Start Free Trial' : name === 'Pro' ? 'Contact Sales' : 'Choose Starter'}
                    </Box>
                  </Box>
                </M>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── Final CTA ── */}
        <Box component="section" sx={{ py: 10, px: 6 }}>
          <M initial="hidden" whileInView="visible" variants={reveal} viewport={{ once: true, amount: 0.3 }}>
            <Box sx={{ maxWidth: 1024, mx: 'auto', background: MF.gradient, borderRadius: '40px', p: { xs: 6, md: 10 }, textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px rgba(70,72,212,0.3)' }}>
              <Box sx={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)', transform: 'translate(50%,-50%)' }} />
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h1" sx={{ fontSize: { xs: 32, md: 48 }, fontWeight: 700, letterSpacing: '-0.03em', mb: 2 }}>Ready to Modernize Your Restaurant?</Typography>
                <Typography sx={{ fontSize: 17, opacity: 0.8, mb: 5, maxWidth: 520, mx: 'auto', lineHeight: 1.65 }}>
                  Join thousands of operators who have simplified their workflow and boosted revenue with MenuFlow.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                  <Box component="button" onClick={() => navigate('/register')} sx={{
                    bgcolor: MF.surfaceLowest, color: MF.primary, px: 6, py: 1.75,
                    borderRadius: '12px', fontWeight: 700, fontSize: 15, border: 'none',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.15)', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)' },
                  }}>Get Started Now</Box>
                  <Box component="button" sx={{
                    bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
                    px: 6, py: 1.75, borderRadius: '12px', fontWeight: 700, fontSize: 15,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  }}>Talk to an Expert</Box>
                </Box>
              </Box>
            </Box>
          </M>
        </Box>
      </Box>

      <MenuFlowFooter />
    </Box>
  );
}
