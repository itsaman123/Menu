import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeCtx = createContext();

/* ─── Light tokens — MenuFlow warm-orange ─── */
const LIGHT = {
  bg:               '#fffaf6',
  surface:          '#ffffff',
  surfaceAlt:       '#fff7ed',
  surfaceContainer: '#ffedd5',
  surfaceHigh:      '#fed7aa',
  surfaceHighest:   '#fdba74',
  border:           'rgba(232,213,196,0.35)',
  accent:           '#f97316',
  accentContainer:  '#ea580c',
  accentHov:        '#c2410c',
  accentDim:        'rgba(249,115,22,0.08)',
  accentSoft:       '#ffedd5',
  green:            '#006c49',
  greenDim:         'rgba(0,108,73,0.08)',
  greenContainer:   '#6cf8bb',
  orange:           '#7c2d12',
  orangeDim:        'rgba(124,45,18,0.08)',
  blue:             '#2563eb',
  blueDim:          'rgba(37,99,235,0.08)',
  red:              '#ba1a1a',
  redDim:           'rgba(186,26,26,0.08)',
  text:             '#1a1c1d',
  textSub:          '#5c4a3a',
  textMuted:        '#8c7a6a',
  navBg:            'rgba(255,250,246,0.88)',
  pillActive:       'linear-gradient(135deg,#f97316,#ea580c)', pillActiveTxt: '#fff',
  pillInactive:     '#fff7ed',                                 pillInactiveTxt: '#5c4a3a',
  cartBg:           'linear-gradient(135deg,#f97316,#ea580c)',
  cartGlow:         '0 8px 28px rgba(249,115,22,0.22)',
  shadow:           '0 4px 20px rgba(26,28,29,0.05)',
  shadowHov:        '0 20px 40px rgba(26,28,29,0.09)',
  inputBg:          '#fff7ed',
  gradientHero:     'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249,115,22,0.1) 0%, transparent 70%)',
};

/* ─── Dark tokens — neutral dark with orange accent ─── */
const DARK = {
  bg:               '#0f1117',
  surface:          '#141720',
  surfaceAlt:       '#1a1e28',
  surfaceContainer: '#1a1e28',
  surfaceHigh:      '#222632',
  surfaceHighest:   '#2a2e3b',
  border:           'rgba(232,213,196,0.08)',
  accent:           '#fb923c',
  accentContainer:  '#c2410c',
  accentHov:        '#fdba74',
  accentDim:        'rgba(251,146,60,0.12)',
  accentSoft:       'rgba(251,146,60,0.15)',
  green:            '#4edea3',
  greenDim:         'rgba(78,222,163,0.1)',
  greenContainer:   '#005236',
  orange:           '#ffb77d',
  orangeDim:        'rgba(255,183,125,0.1)',
  blue:             '#93b4f4',
  blueDim:          'rgba(147,180,244,0.1)',
  red:              '#ffb4ab',
  redDim:           'rgba(255,180,171,0.1)',
  text:             '#e2e4ea',
  textSub:          '#c8c4d7',
  textMuted:        '#928f9f',
  navBg:            'rgba(20,23,32,0.85)',
  pillActive:       'linear-gradient(135deg,#f97316,#ea580c)', pillActiveTxt: '#fff',
  pillInactive:     'rgba(232,213,196,0.06)',                  pillInactiveTxt: '#c8c4d7',
  cartBg:           'linear-gradient(135deg,#f97316,#ea580c)',
  cartGlow:         '0 8px 28px rgba(249,115,22,0.25)',
  shadow:           '0 4px 20px rgba(0,0,0,0.25)',
  shadowHov:        '0 20px 40px rgba(0,0,0,0.4)',
  inputBg:          'rgba(232,213,196,0.05)',
  gradientHero:     'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249,115,22,0.15) 0%, transparent 70%)',
};

export const ThemeContextProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('cc-theme');
    return saved ? saved === 'dark' : false;
  });

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('cc-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.body.style.backgroundColor = isDark ? '#0f1117' : '#fffaf6';
    document.body.style.color = isDark ? '#e2e4ea' : '#1a1c1d';
  }, [isDark]);

  return (
    <ThemeCtx.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeCtx);

/** Returns the full colour-token object for the current mode. */
export const useTokens = () => {
  const { isDark } = useAppTheme();
  return isDark ? DARK : LIGHT;
};
