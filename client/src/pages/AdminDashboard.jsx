import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { fadeUp, scaleUp, staggerContainer, scrollViewport, slideLeft, slideRight } from '../hooks/useScrollAnimation';
import MenuManagementView from './MenuManagementView';
import LiveOrdersView from './LiveOrdersView';

const M = motion.create(Box);
const MTypo = motion.create(Typography);

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', path: '' },
  { label: 'Menu Management', icon: 'restaurant_menu', path: 'menu' },
  { label: 'Live Orders', icon: 'reorder', path: 'orders' },
  { label: 'QR Generator', icon: 'qr_code', path: 'qr' },
  { label: 'Analytics', icon: 'insights', path: 'analytics' },
];

const ORDERS = [
  { initials: 'AS', name: 'Ananya Sharma', detail: 'Table 04 • 3 Items', amount: '₹1,240.00', status: 'Preparing', statusBg: '#6cf8bb', statusColor: '#00714d' },
  { initials: 'RK', name: 'Rohan Kapoor', detail: 'Takeaway • 1 Item', amount: '₹450.00', status: 'Pending', statusBg: '#ffdcc3', statusColor: '#2f1500' },
  { initials: 'MD', name: 'Meera Das', detail: 'Table 12 • 5 Items', amount: '₹2,890.00', status: 'Preparing', statusBg: '#6cf8bb', statusColor: '#00714d' },
  { initials: 'PV', name: 'Priya Verma', detail: 'Table 08 • 2 Items', amount: '₹860.00', status: 'Pending', statusBg: '#ffdcc3', statusColor: '#2f1500' },
];

export default function AdminDashboard() {
  const T = useTokens();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('Dashboard');

  return (
    <Box sx={{ display: 'flex', bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text }}>

      {/* ─── Sidebar ─── */}
      <M
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        component="aside"
        sx={{
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
          py: 4, px: 2, gap: 1, height: '100vh', width: 256,
          position: 'fixed', left: 0, top: 0, bgcolor: T.bg, zIndex: 40,
        }}
      >
        <Box sx={{ px: 2, mb: 4 }}>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: T.text }}>The Curated Canvas</Typography>
          <Typography sx={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, fontWeight: 700, mt: 0.5 }}>
            Premium Dining Admin
          </Typography>
        </Box>

        <Box component="nav" sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {NAV_ITEMS.map(item => (
            <Box component="a" href="#" key={item.label} onClick={(e) => { e.preventDefault(); setActiveNav(item.label); }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, px: 2,
                borderRadius: '9999px', textDecoration: 'none', transition: 'all 0.2s', mx: 1,
                bgcolor: activeNav === item.label ? T.surface : 'transparent',
                color: activeNav === item.label ? T.accent : T.textSub,
                boxShadow: activeNav === item.label ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                '&:hover': { bgcolor: activeNav === item.label ? T.surface : 'rgba(255,255,255,0.5)' },
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Storage */}
        <Box sx={{ px: 2, py: 3, bgcolor: '#EFF4FF', borderRadius: '0.5rem', mx: 1, mb: 3 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: T.textSub, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Storage Used
          </Typography>
          <Box sx={{ height: 8, width: '100%', bgcolor: '#dee9fc', borderRadius: '9999px', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', bgcolor: '#5341cd', width: '75%' }} />
          </Box>
          <Box component="button" sx={{
            mt: 2, width: '100%', py: 1, bgcolor: '#6c5ce7', color: '#faf6ff',
            fontSize: '0.75rem', fontWeight: 700, borderRadius: '9999px', border: 'none',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            '&:active': { transform: 'scale(0.95)' },
          }}>Upgrade Plan</Box>
        </Box>

        {/* Bottom Nav */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {[{ label: 'Settings', icon: 'settings' }, { label: 'Support', icon: 'contact_support' }].map(item => (
            <Box component="a" href="#" key={item.label} sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 2,
              borderRadius: '9999px', textDecoration: 'none', color: T.textSub, mx: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' },
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </M>

      {/* ─── Main Content ─── */}
      <Box component="main" sx={{ ml: { md: '256px' }, minHeight: '100vh', pb: { xs: 12, md: 6 }, px: { xs: 3, xl: 6 }, pt: 4, width: '100%', maxWidth: 1280 }}>
        {activeNav === 'Dashboard' && (
          <Box>

        {/* Header */}
        <M
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          component="header"
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}
        >
          <Box>
            <Typography variant="h2" sx={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.05em', color: T.text }}>Dashboard</Typography>
            <Typography sx={{ color: T.textSub, fontWeight: 500, mt: 0.5 }}>Welcome back, Indigo Bistro Admin</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box component="button" sx={{
              p: 1.5, bgcolor: T.surfaceAlt, borderRadius: '50%', color: T.textSub,
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              '&:hover': { bgcolor: T.surfaceHigh },
            }}>
              <span className="material-symbols-outlined">notifications</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: T.surfaceAlt, pl: 1, pr: 2, py: 1, borderRadius: '9999px' }}>
              <Box component="img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuARMnDDGIci2Z-DpOdicFT0DeNYUdJh5iS-ptQee2T1Y57f8CoQSPM6b8xkAi0PEMxZ4OAmqMgaOgOcJ6gyDc7LA3PVunuieyI27y9dICvEFrQr8doBJLLjLks65w6-1QnQS1IIMy7eTSoBGKAU_78by1Hox3-o5QnhvJuoqAaU-6D7wuUZpoWcL7fNJp3aKm03HrIeNh8O1cT2tjpAig286m1R1wuP2-BS35llvXVdAOXiNtif2X-7CjJlVeWjub8UmaRvEOtmaUA"
                alt="Admin" sx={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
              />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: T.text, lineHeight: 1 }}>Rajesh K.</Typography>
                <Typography sx={{ fontSize: '10px', color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner</Typography>
              </Box>
            </Box>
          </Box>
        </M>

        {/* ─── Stats Bento Grid ─── */}
        <M
          variants={staggerContainer}
          initial="hidden" whileInView="visible" viewport={scrollViewport}
          component="section"
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 6 }}
        >
          {/* Total Orders */}
          <M variants={scaleUp} custom={0} sx={{ bgcolor: T.surface, p: 4, borderRadius: '0.5rem', boxShadow: T.shadowHov, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'relative', zIndex: 10 }}>
              <span className="material-symbols-outlined" style={{ color: '#5341cd', fontSize: 32, display: 'block', marginBottom: 16 }}>shopping_bag</span>
              <Typography sx={{ color: T.textSub, fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>Total Orders Today</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: T.text, letterSpacing: '-0.05em' }}>142</Typography>
                <Typography sx={{ color: '#006c49', fontSize: '0.875rem', fontWeight: 700 }}>+12%</Typography>
              </Box>
            </Box>
            <Box sx={{ position: 'absolute', right: -16, bottom: -16, opacity: 0.05 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 120 }}>trending_up</span>
            </Box>
          </M>

          {/* Revenue */}
          <M variants={scaleUp} custom={1} sx={{
            background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)', color: '#fff',
            p: 4, borderRadius: '0.5rem', boxShadow: '0px 20px 40px rgba(18,28,42,0.12)',
            position: 'relative', overflow: 'hidden',
          }}>
            <Box sx={{ position: 'relative', zIndex: 10 }}>
              <span className="material-symbols-outlined" style={{ color: '#e4dfff', fontSize: 32, display: 'block', marginBottom: 16 }}>payments</span>
              <Typography sx={{ color: 'rgba(228,223,255,0.8)', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>Revenue</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.05em' }}>₹42,850</Typography>
                <Typography sx={{ color: '#6ffbbe', fontSize: '0.875rem', fontWeight: 700 }}>+8.4%</Typography>
              </Box>
            </Box>
            <Box sx={{ position: 'absolute', right: 0, top: 0, width: 128, height: 128, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%', mr: '-4rem', mt: '-4rem', filter: 'blur(24px)' }} />
          </M>

          {/* Active Menu Items */}
          <M variants={scaleUp} custom={2} sx={{ bgcolor: T.surface, p: 4, borderRadius: '0.5rem', boxShadow: T.shadowHov }}>
            <span className="material-symbols-outlined" style={{ color: '#884800', fontSize: 32, display: 'block', marginBottom: 16 }}>restaurant</span>
            <Typography sx={{ color: T.textSub, fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>Active Menu Items</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: T.text, letterSpacing: '-0.05em' }}>84</Typography>
              <Typography sx={{ color: T.textMuted, fontSize: '0.875rem', fontWeight: 500 }}>/ 120 Total</Typography>
            </Box>
          </M>
        </M>

        {/* ─── Orders + Sidebar ─── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>

          {/* Recent Orders */}
          <Box component="section">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: T.text }}>Recent Orders</Typography>
              <Box component="button" sx={{ color: '#5341cd', fontSize: '0.875rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', '&:hover': { textDecoration: 'underline' } }}>View All</Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ORDERS.map(order => (
                <Box key={order.name} sx={{
                  bgcolor: T.surface, p: 3, borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'background-color 0.3s', '&:hover': { bgcolor: T.surfaceContainer },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: '50%', bgcolor: T.surfaceAlt,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: '#5341cd', fontSize: '0.875rem',
                    }}>{order.initials}</Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: T.text }}>{order.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: T.textSub }}>{order.detail}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontWeight: 700, color: T.text }}>{order.amount}</Typography>
                    <Box component="span" sx={{
                      display: 'inline-block', px: 1.5, py: 0.5, bgcolor: order.statusBg,
                      color: order.statusColor, fontSize: '10px', fontWeight: 900,
                      textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '9999px', mt: 0.5,
                    }}>{order.status}</Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Bento */}
          <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Top Sellers */}
            <Box sx={{ bgcolor: '#eff4ff', p: 4, borderRadius: '0.5rem' }}>
              <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em', color: T.text, mb: 3 }}>Top Sellers</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  { category: 'Burger', name: 'Crispy Paneer Burger', orders: '42 orders today', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyWmlKBGBHb7FX96JdfJuVqfXLE_eBuiKamYDfcP5K0AcNZ8ds9SbkYDlPsu4hUPHUoDH2FiDcYMrmWdYu38fepEmocYH0bArNSGWCYmkOObCuG9KymNf85qx2mu1SUCeKixsYWT1tvsJ7ZTmJe0lq2zd17MWJ3m2Msasnm9n7Sgvlo3U3bzAKeWQRRb42gSdcDjrCh26Y8ntz1f71L60ba9Tzfal9D6U36GVPoRaG92pHXTeUqEZeWdsxKlcf9nMZ5smE6OWdpww' },
                  { category: 'Brunch', name: 'Zesty Avocado Toast', orders: '38 orders today', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARcYZ8_sNXq6_g0dbhAVs5t-jhT3wC5TJs-y7rhnXravMSXNJoms9acca2doGH0yi_VtT5gPj2z50evmO9Y97pWkUkflVXUHxYymF2RtTdAMzJIDUF_6lI1bo8vWmhTuDB1VX3VkuOqpv1v2_4QJj6iKnvMYUZL0cFNRDaSmGk6Vf9NM1Vk57oFxdX6uTIaPGDE9RvVp1YndRbeuAB2ykSK5F5Y3i-9f3gG8Hwl-dSwLv0CNhJonoQCihKihBe9x3LKaXYYH2Qx2g' },
                ].map(item => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '0.5rem', bgcolor: T.surface, overflow: 'hidden', flexShrink: 0 }}>
                      <Box component="img" src={item.img} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#5341cd', mb: 0.5 }}>{item.category}</Typography>
                      <Typography sx={{ fontWeight: 700, color: T.text, fontSize: '0.875rem', lineHeight: 1.25 }}>{item.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: T.textSub, mt: 0.5 }}>{item.orders}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Promotions */}
            <Box sx={{ bgcolor: '#EFF4FF', p: 4, borderRadius: '0.5rem', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'relative', zIndex: 10 }}>
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em', color: T.text, mb: 1 }}>Grow your reach</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: T.textSub, mb: 3 }}>Create a new weekend special menu and boost sales by up to 20%.</Typography>
                <Box component="button" sx={{
                  px: 3, py: 1.5, bgcolor: '#5341cd', color: '#fff',
                  fontSize: '0.875rem', fontWeight: 700, borderRadius: '9999px', border: 'none',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  transition: 'box-shadow 0.3s', '&:hover': { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
                }}>Create Promo</Box>
              </Box>
              <Box sx={{ position: 'absolute', right: -48, bottom: -48, width: 160, height: 160, bgcolor: 'rgba(83,65,205,0.1)', borderRadius: '50%', filter: 'blur(24px)' }} />
            </Box>
          </Box>
          </Box>
          </Box>
        )}
        {activeNav === 'Menu Management' && <MenuManagementView />}
        {activeNav === 'Live Orders' && <LiveOrdersView />}
        {activeNav === 'QR Generator' && <Box sx={{ p: 4 }}><Typography variant="h4" sx={{color: T.text}}>QR Generator Coming Soon</Typography></Box>}
        {activeNav === 'Analytics' && <Box sx={{ p: 4 }}><Typography variant="h4" sx={{color: T.text}}>Analytics Coming Soon</Typography></Box>}
      </Box>

      {/* ─── Mobile Bottom Nav ─── */}
      <Box component="nav" sx={{
        display: { md: 'none' }, position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 50,
        justifyContent: 'space-around', alignItems: 'flex-end', px: 3, pb: 3, pt: 1,
        bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(24px)',
        borderRadius: '32px 32px 0 0', boxShadow: '0 -10px 30px rgba(18,28,42,0.08)',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
          {[
            { icon: 'home', label: 'Home', active: true },
            { icon: 'menu_book', label: 'Menu', active: false },
            { icon: 'receipt_long', label: 'Orders', active: false },
            { icon: 'person', label: 'Profile', active: false },
          ].map(item => (
            <Box key={item.label} component="a" href="#" sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none',
              ...(item.active
                ? { background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)', color: '#fff', borderRadius: '9999px', p: 1.5, mb: 1, transform: 'scale(1.1)' }
                : { color: T.textSub, p: 1 }
              ),
            }}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mt: 0.5 }}>{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
