import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useTokens } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SA_NAV = [
  { label: 'Dashboard', icon: 'dashboard', active: true },
  { label: 'Restaurants', icon: 'restaurant' },
  { label: 'Subscriptions', icon: 'payments' },
  { label: 'Analytics', icon: 'analytics' },
  { label: 'Users', icon: 'group' },
  { label: 'Tickets', icon: 'support_agent' },
];

const STATS = [
  { label: 'Total Restaurants', value: '1,240', icon: 'storefront', trend: '+12% this month' },
  { label: 'Total Orders', value: '45.2k', icon: 'shopping_bag', trend: '+8.4k new' },
  { label: 'Platform Revenue', value: '₹12.5L', icon: 'payments', trend: '+18% vs last month' },
  { label: 'Active Subs', value: '890', icon: 'verified_user', trend: '94% retention rate' },
];

const RESTAURANTS = [
  { name: 'The Spice Route', owner: 'Rajesh Kumar', plan: 'Pro Plan', planIsPro: true, status: 'Active', statusIsActive: true, date: 'Oct 24, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4xwN6eW0yPeq-h_wzoisDTYpoYFBHhEastk5GEYRCDxMTYUaX4F4ukezXnj9vtmHcUecKqXFQYOGF4dTDAXwOPC0RYBxv8YTmC7U2t6EsyNkdX412h6g3OBY_u0dcg0WHUqSXTlwyuH7Y0oSJIxAakUlUqp89f9yJ1iL6TtGoMIZkPbMYKBF-Eioj1-SAinGpJOiglJp1_KJNccN1GkOE9te-dh2jPmNDNp6InPtaBi0jlw_2dvE8NJ6W02KA12CO0dFKkD3cqRo' },
  { name: 'Urban Brew Cafe', owner: 'Anita Sharma', plan: 'Starter', planIsPro: false, status: 'Active', statusIsActive: true, date: 'Oct 23, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBxtF4cJllGZuavU36fDhgsnvOF6Mzn1svv3P4g0lVndLi2BqbGiMI0jz1kQ0WbRy_rMHreDm_Jax4m1TB65S2uZpw5kQvyyWR_bcRUcExNtMo40vaPnSB7fuo2FD2JW0gfUco0w2D9-Wv2QzsAaTHkUPUxHQ8FHxTI0kIuisVwpq-d9wn76NH54iM7lTezxsqRZy3uZCA5YQX1oPJJU0LMCy5dSj-dIkPvOAy1XfEDJ1hOpFvjQ5gJDTODp-uro3_884dkOQOlB8' },
  { name: 'Sushi Sensation', owner: 'David Miller', plan: 'Pro Plan', planIsPro: true, status: 'Pending', statusIsActive: false, date: 'Oct 22, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1HmfSSVTIclrGAQCeNYEbplBSd883JUx-Gjq41bd_5PlbNmO_jVeN3k7P5FGbj7D76zq76l7mJe8SRwgYENglpguarrO8w6xxTq8C-PsJ0CgqpQXp2J3wCHp5oUosP5kIC2ZandwEZUgXmgf92O-GjlgJggF46_7da2HQFWpAvH38HrIlWUJ1MMA_Gfb2WfiEU8Z18qE_u-oSUIuCMs7ptmL1JpD2NQAleMWW-U6HF9YW7rvbLY7Gncv2qY2oMIsf22WyPCZg4xE' },
  { name: 'Gourmet Garden', owner: 'Sanjay Patil', plan: 'Starter', planIsPro: false, status: 'Active', statusIsActive: true, date: 'Oct 21, 2023', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyj_88X_nrKFMG4iHFyobr6-MKU91SvHgeRI6k-TBsI9-WVPftPu6mtA1QBnVYkqdWPeh4DY2fX6g2lxvAY7PIU7HXOxWRZPKuRSsFwH9Lt3SmM08dddl5eMYChGW_tR_igbD4Iv2z75M-Mwl8iCMHi65cFRibMDUGe_9DKIxZDKku8ctfynwydj6xF1LRP1CmvBhupWBiw_k1GDKJS9ebKN7hZ-i3tuGx1Q90Eua2_AkOWKCy_FM74N5fyC5hqwmak3LrUcjQd6I' },
];

const CHART_BARS = [
  { label: 'JAN', h: 96 }, { label: 'FEB', h: 128 }, { label: 'MAR', h: 160 },
  { label: 'APR', h: 192, primary: true }, { label: 'MAY', h: 208 }, { label: 'JUN', h: 240 },
];

export default function SuperAdminDashboard() {
  const T = useTokens();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    navigate('/superadmin-login');
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: T.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: T.text }}>

      {/* ─── Top Nav ─── */}
      <Box component="nav" sx={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, height: 64,
        bgcolor: T.navBg, backdropFilter: 'blur(24px)', boxShadow: T.shadowHov,
      }}>
        <Typography sx={{
          fontSize: '1.25rem', fontWeight: 900,
          background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)',
          WebkitBackgroundClip: 'text', color: 'transparent',
        }}>
          The Curated Canvas
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Search */}
          <Box sx={{
            display: { xs: 'none', md: 'flex' }, alignItems: 'center',
            bgcolor: T.surfaceAlt, px: 2, py: 1, borderRadius: '9999px', border: `1px solid ${T.border}`,
          }}>
            <span className="material-symbols-outlined" style={{ color: T.textMuted, fontSize: 14, marginRight: 8 }}>search</span>
            <Box component="input" type="text" placeholder="Search accounts..."
              sx={{
                bgcolor: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem',
                color: T.text, width: 256, fontFamily: 'Inter, sans-serif',
                '&::placeholder': { color: T.textMuted },
              }}
            />
          </Box>
          {/* Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {['notifications', 'settings'].map(icon => (
              <Box component="button" key={icon} sx={{
                p: 1, borderRadius: '50%', color: T.textSub, border: 'none', cursor: 'pointer',
                bgcolor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                '&:hover': { bgcolor: T.surfaceHigh },
              }}>
                <span className="material-symbols-outlined">{icon}</span>
              </Box>
            ))}
            <Box sx={{
              width: 40, height: 40, borderRadius: '50%', bgcolor: '#6c5ce7', overflow: 'hidden',
              border: '2px solid #fff', ml: 1,
            }}>
              <Box component="img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5YsqfEBXRF2660OPdHLkP9NJTIN8ST_YD917kBUZaAfwYItA8UjRTUleS_PoZ_1JukbfimU_sRTbzrwNT4exFRXb4ZUIn3GjkW3J-x1QaZyHp4IWKhT4355jUr198Ha_RXI8CI36gDXlfMbq1LTlpAlVUwpP0PnO_jedD8M8ZJCz9DM2Ts8-Z13w8kA4zJOsU1jszfa1fWJ7xfKjLCTpjS3X53xQLbPf9Wfl9zjoNS4qk6NKV42PVxr582lrwhdX5D9fOPr1dm0w"
                alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ─── Side Nav ─── */}
      <Box component="aside" sx={{
        position: 'fixed', left: 0, top: 0, height: '100vh',
        display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
        p: 2, pt: 10, gap: 1, bgcolor: T.bg, width: 256,
        borderRadius: '0 1.5rem 1.5rem 0', zIndex: 40,
      }}>
        <Box sx={{ mb: 4, px: 2 }}>
          <Typography sx={{ fontWeight: 900, color: '#4338ca', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '-0.025em' }}>SaaS Admin</Typography>
          <Typography sx={{ color: T.textMuted, fontSize: '0.75rem', fontWeight: 500 }}>Management Portal</Typography>
        </Box>

        <Box component="nav" sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {SA_NAV.map(item => (
            <Box component="a" href="#" key={item.label} sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5,
              borderRadius: '9999px', textDecoration: 'none', transition: 'all 0.3s',
              color: item.active ? '#4f46e5' : T.textMuted, fontWeight: item.active ? 700 : 500,
              bgcolor: item.active ? T.surface : 'transparent',
              boxShadow: item.active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              '&:hover': { color: '#6366f1', bgcolor: item.active ? T.surface : '#eef2ff' },
            }}>
              <span className="material-symbols-outlined" style={item.active ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 'inherit' }}>{item.label}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 'auto', px: 2, py: 3, borderTop: `1px solid ${T.border}` }}>
          <Box component="button" sx={{
            width: '100%', background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)',
            color: '#fff', py: 1.5, borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem',
            boxShadow: '0 10px 15px -3px rgba(199,210,254,1)', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', mb: 2, '&:active': { transform: 'scale(0.95)' },
          }}>New Restaurant</Box>
          <Box component="a" href="#" onClick={handleLogout} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, color: T.textMuted,
            textDecoration: 'none', '&:hover': { color: '#ba1a1a' },
          }}>
            <span className="material-symbols-outlined">logout</span>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Logout</Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── Main ─── */}
      <Box component="main" sx={{ ml: { md: '256px' }, pt: 12, pb: 6, px: 4, minHeight: '100vh', width: '100%' }}>

        {/* Header */}
        <Box component="header" sx={{ mb: 5 }}>
          <Typography variant="h1" sx={{ fontSize: '1.875rem', fontWeight: 900, color: T.text, mb: 0.5, letterSpacing: '-0.025em' }}>Platform Overview</Typography>
          <Typography sx={{ color: T.textSub, fontWeight: 500 }}>Monitoring growth across 1,240 partner locations.</Typography>
        </Box>

        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 5 }}>
          {STATS.map(stat => (
            <Box key={stat.label} sx={{
              bgcolor: T.surface, p: 3, borderRadius: '0.5rem', position: 'relative',
              overflow: 'hidden', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.02)' },
            }}>
              <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, opacity: 0.1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 60, color: '#5341cd' }}>{stat.icon}</span>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub, fontWeight: 700, mb: 1 }}>{stat.label}</Typography>
              <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, color: T.text }}>{stat.value}</Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: '#006c49', fontSize: '0.875rem', fontWeight: 700 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4 }}>trending_up</span>
                {stat.trend}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Chart + Promo */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4, mb: 5 }}>
          {/* Chart */}
          <Box sx={{ bgcolor: T.surface, p: 4, borderRadius: '0.5rem' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, color: T.text }}>Monthly Revenue Growth</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: T.textSub }}>Performance across fiscal year 2024</Typography>
              </Box>
              <Box component="select" sx={{
                bgcolor: T.surfaceAlt, border: 'none', borderRadius: '9999px', px: 2, py: 1,
                fontSize: '0.875rem', fontWeight: 500, color: T.text, outline: 'none',
                fontFamily: 'Inter, sans-serif',
              }}>
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </Box>
            </Box>
            <Box sx={{ height: 256, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
              {CHART_BARS.map(bar => (
                <Box key={bar.label} sx={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  '&:hover .bar': { bgcolor: bar.primary ? '#6c5ce7' : 'rgba(83,65,205,0.2)' },
                }}>
                  <Box className="bar" sx={{
                    width: '100%', bgcolor: bar.primary ? '#5341cd' : '#dee9fc',
                    borderRadius: '0.5rem 0.5rem 0 0', height: bar.h, transition: 'background-color 0.3s',
                    boxShadow: bar.primary ? '0 10px 15px -3px rgba(199,210,254,1)' : 'none',
                  }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: bar.primary ? '#5341cd' : T.textSub, mt: 1.5 }}>{bar.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Promo */}
          <Box sx={{
            background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)', p: 4, borderRadius: '0.5rem',
            color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <Box sx={{ position: 'relative', zIndex: 10 }}>
              <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 900, mb: 1 }}>Upgrade Engine</Typography>
              <Typography sx={{ color: 'rgba(250,246,255,0.8)', fontSize: '0.875rem', mb: 3 }}>Automated campaigns for Starter plan users are ready to launch.</Typography>
              <Box component="button" sx={{
                bgcolor: '#fff', color: '#5341cd', fontWeight: 700, px: 3, py: 1.5,
                borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)' },
              }}>Launch Campaign</Box>
            </Box>
            <Box sx={{ position: 'absolute', bottom: -32, right: -32, opacity: 0.2, transform: 'rotate(12deg)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 120 }}>rocket_launch</span>
            </Box>
          </Box>
        </Box>

        {/* Restaurants Table */}
        <Box component="section" sx={{ bgcolor: T.surface, borderRadius: '0.5rem', overflow: 'hidden' }}>
          <Box sx={{ p: 4, borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, color: T.text }}>Recently Joined Restaurants</Typography>
            <Box component="button" sx={{
              color: '#5341cd', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center',
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              '&:hover': { textDecoration: 'underline' },
            }}>
              View All Restaurants
              <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 4 }}>arrow_forward</span>
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: T.surfaceAlt }}>
                  {['Restaurant Name', 'Owner', 'Plan', 'Status', 'Date Joined', 'Actions'].map((h, i) => (
                    <TableCell key={h} align={i === 5 ? 'center' : 'left'} sx={{
                      py: 2, px: 4, color: T.textSub, fontSize: '10px', textTransform: 'uppercase',
                      letterSpacing: '0.1em', fontWeight: 700, borderBottom: 'none',
                    }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {RESTAURANTS.map(row => (
                  <TableRow key={row.name} sx={{ '&:hover': { bgcolor: 'rgba(239,244,255,0.5)' }, transition: 'background-color 0.2s' }}>
                    <TableCell sx={{ px: 4, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: T.surfaceContainer, overflow: 'hidden' }}>
                          <Box component="img" src={row.img} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: T.text }}>{row.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ px: 4, py: 2.5, borderBottom: `1px solid ${T.border}`, color: T.textSub, fontWeight: 500 }}>{row.owner}</TableCell>
                    <TableCell sx={{ px: 4, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                      <Box component="span" sx={{
                        bgcolor: row.planIsPro ? 'rgba(83,65,205,0.1)' : '#dee9fc',
                        color: row.planIsPro ? '#5341cd' : T.textSub,
                        fontSize: '10px', fontWeight: 900, px: 1.5, py: 0.5, borderRadius: '9999px',
                        textTransform: 'uppercase', letterSpacing: '-0.025em',
                      }}>{row.plan}</Box>
                    </TableCell>
                    <TableCell sx={{ px: 4, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.statusIsActive ? '#006c49' : '#884800' }} />
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: row.statusIsActive ? '#006c49' : '#884800' }}>{row.status}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ px: 4, py: 2.5, borderBottom: `1px solid ${T.border}`, color: T.textSub, fontWeight: 500, fontSize: '0.875rem' }}>{row.date}</TableCell>
                    <TableCell align="center" sx={{ px: 4, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
                      <Box component="button" sx={{
                        p: 1, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto',
                        '&:hover': { color: '#5341cd' },
                      }}>
                        <span className="material-symbols-outlined">more_vert</span>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}
