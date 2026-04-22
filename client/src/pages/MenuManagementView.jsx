import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTokens } from '../ThemeContext';

const M = motion.create(Box);

export default function MenuManagementView() {
  const T = useTokens();

  return (
    <M
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-end' }, justifyContent: 'space-between', gap: 3, mb: 6 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#5341cd', mb: 1 }}>Administration</Typography>
          <Typography variant="h1" sx={{ fontSize: '3rem', fontWeight: 900, color: T.text, letterSpacing: '-0.05em', lineHeight: 1 }}>Menu Management</Typography>
          <Typography sx={{ color: T.textSub, mt: 2, fontSize: '1.125rem' }}>Curate your digital culinary experience. Manage items, update pricing, and control real-time availability.</Typography>
        </Box>
        <Box component="button" sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, background: 'linear-gradient(to bottom right, #5341CD, #6C5CE7)',
          color: '#fff', px: 4, py: 2, borderRadius: '9999px', fontWeight: 700, border: 'none', cursor: 'pointer',
          boxShadow: '0 20px 40px rgba(18,28,42,0.06)', transition: 'transform 0.3s', '&:active': { transform: 'scale(0.95)' }
        }}>
          <span className="material-symbols-outlined">add_circle</span>
          Add New Item
        </Box>
      </Box>

      <Box sx={{ bgcolor: T.surfaceAlt, borderRadius: '0.5rem', p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 5 }}>
        <Box sx={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }}>search</span>
          <Box component="input" placeholder="Search dish name or ingredient..." sx={{
            width: '100%', bgcolor: T.surface, border: 'none', height: 48, pl: 6, pr: 3, borderRadius: '9999px',
            outline: 'none', color: T.text, fontFamily: 'Inter', '&:focus': { boxShadow: '0 0 0 2px rgba(83,65,205,0.2)' }
          }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, p: 0.5, bgcolor: T.surfaceHigh, borderRadius: '9999px', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          <Box component="button" sx={{ px: 3, py: 1, bgcolor: '#fff', color: '#5341cd', fontWeight: 700, fontSize: '0.875rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>All Items</Box>
          {['Starters', 'Main Course', 'Drinks', 'Desserts'].map(cat => (
            <Box component="button" key={cat} sx={{ px: 3, py: 1, bgcolor: 'transparent', color: T.textSub, fontWeight: 600, fontSize: '0.875rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', '&:hover': { color: T.text } }}>{cat}</Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 4 }}>
        
        {/* Item Card 1 */}
        <Box sx={{ bgcolor: T.surface, borderRadius: '0.5rem', overflow: 'hidden', transition: 'all 0.3s', '&:hover': { transform: 'scale(1.02)', boxShadow: T.shadowHov } }}>
          <Box sx={{ height: 256, position: 'relative', overflow: 'hidden' }}>
            <Box component="img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDncNAYrRkIp6HGz6uljMUSJFRW8JLJL-otXWfk-sS45Avzd6uZApjL645oKkWnE14zVqpThbDavSZfQPQ1uKCkcLha-aaOjF6UFJuaRxc_RSztpAqgTUXvDca9Cz2d07Xd9pF1hakJ6RGZz5KgoIifxQaA7BAiq8APTQ0QtOHHL4dmL42XV_wOduaskWdxD8W4pU7I6FOEFYn3lNQos0_8Q7pUczxSOwybrbYzGx4QFeFrGbtWXnKYyR13cnrZxi_LSc6xxxtRe70" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 1 }}>
              <Box component="span" sx={{ bgcolor: '#6cf8bb', color: '#00714d', px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Veg</Box>
              <Box component="span" sx={{ bgcolor: 'rgba(83,65,205,0.9)', color: '#fff', px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bestseller</Box>
            </Box>
          </Box>
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: T.text, lineHeight: 1.25 }}>Zesty Avocado Bowl</Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#5341cd' }}>₹450</Typography>
            </Box>
            <Typography sx={{ color: T.textSub, fontSize: '0.875rem', mb: 3, lineHeight: 1.625 }}>Smashed organic avocado, quinoa, pickled radish, and lemon-tahini drizzle.</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 3, borderTop: `1px solid ${T.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>Available</Typography>
                <Box sx={{ width: 48, height: 24, bgcolor: '#6cf8bb', borderRadius: '9999px', p: 0.5, cursor: 'pointer', position: 'relative' }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#fff', borderRadius: '50%', position: 'absolute', right: 4 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box component="button" sx={{ p: 1, color: T.textSub, background: 'none', border: 'none', cursor: 'pointer', '&:hover': { color: '#5341cd' } }}><span className="material-symbols-outlined">edit</span></Box>
                <Box component="button" sx={{ p: 1, color: T.textSub, background: 'none', border: 'none', cursor: 'pointer', '&:hover': { color: '#ba1a1a' } }}><span className="material-symbols-outlined">delete</span></Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Item Card 2 */}
        <Box sx={{ bgcolor: T.surface, borderRadius: '0.5rem', overflow: 'hidden', transition: 'all 0.3s', '&:hover': { transform: 'scale(1.02)', boxShadow: T.shadowHov } }}>
          <Box sx={{ height: 256, position: 'relative', overflow: 'hidden' }}>
            <Box component="img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm6q1bVa_-WeNmFXzWdKilHk4GExDE5a1EXaJBS-iaMvHnq7dz8lbWdAX0vD2lWWVfTGXEPUBOFUFhGfhQhLgKg28SYjNy_bD_8XokPHeV5wJP0qsemmvRg-4-sFqcTe-0mWur0vjIVeXCLzVX_Futq5uCYP-bPaJmj3zU-w3M3tj5PG9lzRzMBd5tt_MyTzcTujy191ingC1g1fMq_M4VOphP1xgO9rV5E72UkxNIjFhhcVZZpUJOhsUiZYpoJ9YS2Wp9ERVmR9s" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 1 }}>
              <Box component="span" sx={{ bgcolor: 'rgba(186,26,26,0.1)', color: '#ba1a1a', px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Non-Veg</Box>
            </Box>
          </Box>
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: T.text, lineHeight: 1.25 }}>Fire-Roasted Pepperoni</Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#5341cd' }}>₹680</Typography>
            </Box>
            <Typography sx={{ color: T.textSub, fontSize: '0.875rem', mb: 3, lineHeight: 1.625 }}>48-hour fermented sourdough, premium pepperoni, and buffalo mozzarella.</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 3, borderTop: `1px solid ${T.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textSub }}>Available</Typography>
                <Box sx={{ width: 48, height: 24, bgcolor: '#6cf8bb', borderRadius: '9999px', p: 0.5, cursor: 'pointer', position: 'relative' }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#fff', borderRadius: '50%', position: 'absolute', right: 4 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box component="button" sx={{ p: 1, color: T.textSub, background: 'none', border: 'none', cursor: 'pointer', '&:hover': { color: '#5341cd' } }}><span className="material-symbols-outlined">edit</span></Box>
                <Box component="button" sx={{ p: 1, color: T.textSub, background: 'none', border: 'none', cursor: 'pointer', '&:hover': { color: '#ba1a1a' } }}><span className="material-symbols-outlined">delete</span></Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Add New Placeholder */}
        <Box sx={{ border: `4px dashed ${T.border}`, borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 5, cursor: 'pointer', transition: 'all 0.3s', '&:hover': { borderColor: 'rgba(83,65,205,0.4)', bgcolor: 'rgba(83,65,205,0.05)' } }}>
          <Box sx={{ width: 80, height: 80, bgcolor: T.surfaceAlt, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: T.textMuted }}>add_circle</span>
          </Box>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: T.text }}>Add New Selection</Typography>
          <Typography sx={{ color: T.textSub, fontSize: '0.875rem', mt: 1 }}>Expand your menu with a new signature dish.</Typography>
        </Box>

      </Box>
    </M>
  );
}
