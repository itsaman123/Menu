import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MF } from './mfTheme';
import { SplitHeading, MagneticButton, useTilt3D } from './ScrollFX';

const M = motion.create(Box);
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };

const PLANS_DATA = {
  IN: {
    plans: [
      { name: 'Bronze', desc: 'Essential tools for small cafés and dhabas.', features: ['Digital QR Menu', 'Upto 200 orders/month', 'Basic Analytics', 'Email Support'], popular: false },
      { name: 'Silver', desc: 'Complete ordering and payment system.', features: ['Full Order Management', 'Unlimited Orders', 'UPI & Card Payments', 'Priority Support', 'Advanced Analytics'], popular: true },
      { name: 'Gold', desc: 'Custom solutions for multi-location brands.', features: ['Multi-location', 'Custom API Access', 'White-label', 'Dedicated Manager', 'SLA Guarantee'], popular: false }
    ]
  },
  US: {
    plans: [
      { name: 'Bronze', desc: 'Essential tools for small cafes.', features: ['Digital QR Menus', 'Basic Analytics', 'Up to 50 items', 'Standard Support'], popular: false },
      { name: 'Silver', desc: 'Complete digital ordering system.', features: ['Direct Table Ordering', 'POS Integration', 'Real-time Dashboard', 'Stripe/Square Payments', 'Custom Branding'], popular: true },
      { name: 'Gold', desc: 'Enterprise power for multi-locations.', features: ['Multi-location Manager', 'AI Inventory Forecast', 'Dedicated Account Manager', 'API Access', 'White-label'], popular: false }
    ]
  }
};

const PLAN_COLORS = {
  Bronze: { gradient: 'linear-gradient(135deg, #CD7F32, #A0522D)', text: '#CD7F32' },
  Silver: { gradient: 'linear-gradient(135deg, #C0C0C0, #808080)', text: '#808080' },
  Gold: { gradient: 'linear-gradient(135deg, #FFD700, #DAA520)', text: '#DAA520' },
};

/* Card wrapper — owns its own 3D tilt hook so each card gets independent mouse tracking */
function PricingCard({ name, desc, features, popular, index, navigate }) {
  const colors = PLAN_COLORS[name] || {};
  const tilt = useTilt3D(popular ? 9 : 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: -40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      style={{ transformPerspective: 1300 }}
    >
      <Box
        ref={tilt.ref}
        {...tilt.handlers}
        component={motion.div}
        style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformStyle: 'preserve-3d', cursor: 'pointer' }}
      >
        <Box sx={{
          background: '#fff', borderRadius: '24px', p: { xs: 4, md: 5 }, position: 'relative',
          border: popular ? `2px solid ${MF.primary}55` : '1px solid rgba(232,213,196,0.6)',
          boxShadow: popular ? `0 16px 50px ${MF.primary}16` : '0 6px 20px rgba(0,0,0,0.05)',
          ...(popular && { transform: 'scale(1.04)', zIndex: 1 }),
          display: 'flex', flexDirection: 'column', height: '100%'
        }}>
          {popular && (
            <Box sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: MF.gradient, color: '#fff', px: 3, py: 0.625, borderRadius: '100px', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Most Popular
            </Box>
          )}

          <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: colors.gradient || MF.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5, boxShadow: `0 4px 14px ${colors.text || MF.primary}30`, transform: 'translateZ(30px)' }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 24, fontVariationSettings: "'FILL' 1" }}>
              {name === 'Bronze' ? 'workspace_premium' : name === 'Silver' ? 'diamond' : 'stars'}
            </span>
          </Box>

          <Typography sx={{ fontSize: 24, fontWeight: 900, mb: 0.5, background: colors.gradient || MF.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{name}</Typography>
          <Typography sx={{ fontSize: 13, color: MF.textSub, mb: 4 }}>{desc}</Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, mb: 5, flex: 1 }}>
            {features.map(f => (
              <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: `${MF.primary}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ color: MF.primary, fontSize: 12 }}>check</span>
                </Box>
                <Typography sx={{ fontSize: 13.5, color: MF.textSub }}>{f}</Typography>
              </Box>
            ))}
          </Box>

          <MagneticButton
            onClick={() => navigate('/contact')}
            variant={popular ? 'primary' : 'secondary'}
            style={{ width: '100%', padding: '14px', fontSize: 14, ...(popular ? {} : { background: 'transparent', border: `1.5px solid ${MF.outlineVar}`, boxShadow: 'none' }) }}
          >
            {popular ? 'Start Free Trial' : 'Contact Sales'}
          </MagneticButton>
        </Box>
      </Box>
    </motion.div>
  );
}

export default function PricingSection({ locale = 'IN', showHeader = true }) {
  const navigate = useNavigate();
  const data = PLANS_DATA[locale] || PLANS_DATA.IN;

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 6 }, bgcolor: MF.bg }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
        {showHeader && (
          <M initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Box sx={{ textAlign: 'center', mb: 7 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MF.primary, mb: 1.5 }}>
                Simple pricing
              </Typography>
              <SplitHeading text="Pick your plan" sx={{ fontSize: { xs: 30, md: 46 }, fontWeight: 900, letterSpacing: '-0.03em', fontFamily: 'Manrope, Inter, sans-serif' }} />
              <Typography sx={{ fontSize: 16, color: MF.textSub, mt: 2, maxWidth: 440, mx: 'auto' }}>
                No hidden charges. Cancel anytime. First 30 days free.
              </Typography>
            </Box>
          </M>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3.5, alignItems: 'center' }}>
          {data.plans.map((plan, i) => (
            <PricingCard key={plan.name} {...plan} index={i} navigate={navigate} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}