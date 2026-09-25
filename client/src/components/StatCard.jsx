import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const M = motion.create(Box);

export function StatCard({ label, value, icon, subtext, color = '#ea580c', trend, T, onClick, active }) {
  return (
    <M 
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      sx={{
        bgcolor: T.surface, 
        p: { xs: 1.5, md: 2 }, 
        borderRadius: '0.75rem',
        border: `2px solid ${active ? color : (onClick ? 'transparent' : (T.border || 'rgba(0,0,0,0.06)'))}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:hover': { 
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
          borderColor: onClick && !active ? color : undefined
        }
      }}
    >
      {/* Decorative Icon Background (hidden on mobile) */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        p: 1.5, 
        opacity: 0.04,
        display: { xs: 'none', sm: 'block' }
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 44, color }}>
          {icon}
        </span>
      </Box>

      {/* Small Icon Badge */}
      <Box sx={{ 
        width: { xs: 28, md: 34 }, 
        height: { xs: 28, md: 34 }, 
        borderRadius: '50%', 
        bgcolor: `${color}15`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        mb: { xs: 1, md: 1.25 } 
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: { xs: 15, md: 17 }, color }}>
          {icon}
        </span>
      </Box>

      {/* Label */}
      <Typography sx={{ 
        fontSize: { xs: '0.6rem', md: '0.65rem' }, 
        fontWeight: 800, 
        color: T.textSub, 
        textTransform: 'uppercase', 
        letterSpacing: '0.08em', 
        mb: 0.5,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {label}
      </Typography>

      {/* Value */}
      <Typography sx={{ 
        fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.6rem' }, 
        fontWeight: 900, 
        color: active ? color : T.text, 
        letterSpacing: '-0.05em', 
        lineHeight: 1.1, 
        mb: (subtext || trend) ? 1 : 0
      }}>
        {value}
      </Typography>

      {/* Subtext or Trend indicator */}
      {trend ? (
        <Typography sx={{ 
          fontSize: { xs: '0.65rem', md: '0.7rem' }, 
          fontWeight: 700, 
          color, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5 
        }}>
          <span>{trend.direction === 'up' ? '↗' : '↘'}</span> {trend.text}
        </Typography>
      ) : subtext ? (
        <Typography sx={{ 
          fontSize: { xs: '0.65rem', md: '0.7rem' }, 
          fontWeight: 500, 
          color: T.textMuted,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}>
          {subtext}
        </Typography>
      ) : null}
    </M>
  );
}
