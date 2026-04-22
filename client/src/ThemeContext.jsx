import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeCtx = createContext();

/* ─── Light token set (The Curated Canvas — Editorial Light) ─── */
const LIGHT = {
  bg: '#f8f9ff',
  surface: '#ffffff',
  surfaceAlt: '#eff4ff',
  surfaceContainer: '#e6eeff',
  surfaceHigh: '#dee9fc',
  surfaceHighest: '#d9e3f6',
  border: 'rgba(200,196,215,0.15)',
  accent: '#5341cd',
  accentContainer: '#6c5ce7',
  accentHov: '#4029ba',
  accentDim: 'rgba(83,65,205,0.08)',
  accentSoft: '#e4dfff',
  green: '#006c49',
  greenDim: 'rgba(0,108,73,0.08)',
  greenContainer: '#6cf8bb',
  orange: '#884800',
  orangeDim: 'rgba(136,72,0,0.08)',
  blue: '#2563eb',
  blueDim: 'rgba(37,99,235,0.08)',
  red: '#ba1a1a',
  redDim: 'rgba(186,26,26,0.08)',
  text: '#121c2a',
  textSub: '#474554',
  textMuted: '#787586',
  navBg: 'rgba(255,255,255,0.8)',
  pillActive: 'linear-gradient(135deg,#5341cd,#6c5ce7)', pillActiveTxt: '#fff',
  pillInactive: '#eff4ff', pillInactiveTxt: '#474554',
  cartBg: 'linear-gradient(135deg,#5341cd,#6c5ce7)',
  cartGlow: '0 8px 28px rgba(83,65,205,0.2)',
  shadow: '0 4px 20px rgba(18,28,42,0.04)',
  shadowHov: '0 20px 40px rgba(18,28,42,0.06)',
  inputBg: '#eff4ff',
  gradientHero: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(228,223,255,0.5) 0%, transparent 70%)',
};

/* ─── Dark token set (The Curated Canvas — Editorial Dark) ─── */
const DARK = {
  bg: '#0f1117',
  surface: '#141720',
  surfaceAlt: '#1a1e28',
  surfaceContainer: '#1a1e28',
  surfaceHigh: '#222632',
  surfaceHighest: '#2a2e3b',
  border: 'rgba(200,196,215,0.08)',
  accent: '#c6bfff',
  accentContainer: '#4029ba',
  accentHov: '#e4dfff',
  accentDim: 'rgba(198,191,255,0.1)',
  accentSoft: 'rgba(198,191,255,0.12)',
  green: '#4edea3',
  greenDim: 'rgba(78,222,163,0.1)',
  greenContainer: '#005236',
  orange: '#ffb77d',
  orangeDim: 'rgba(255,183,125,0.1)',
  blue: '#93b4f4',
  blueDim: 'rgba(147,180,244,0.1)',
  red: '#ffb4ab',
  redDim: 'rgba(255,180,171,0.1)',
  text: '#e2e4ea',
  textSub: '#c8c4d7',
  textMuted: '#928f9f',
  navBg: 'rgba(20,23,32,0.85)',
  pillActive: 'linear-gradient(135deg,#6c5ce7,#8b80f0)', pillActiveTxt: '#fff',
  pillInactive: 'rgba(200,196,215,0.06)', pillInactiveTxt: '#c8c4d7',
  cartBg: 'linear-gradient(135deg,#6c5ce7,#8b80f0)',
  cartGlow: '0 8px 28px rgba(198,191,255,0.2)',
  shadow: '0 4px 20px rgba(0,0,0,0.25)',
  shadowHov: '0 20px 40px rgba(0,0,0,0.4)',
  inputBg: 'rgba(200,196,215,0.05)',
  gradientHero: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(108,92,231,0.15) 0%, transparent 70%)',
};

export const ThemeContextProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('cc-theme');
    return saved ? saved === 'dark' : false; // Light mode default for Curated Canvas
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
    document.body.style.backgroundColor = isDark ? '#0f1117' : '#f8f9ff';
    document.body.style.color = isDark ? '#e2e4ea' : '#121c2a';
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
