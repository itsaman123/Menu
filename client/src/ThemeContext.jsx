import React, { createContext, useContext } from 'react';

const ThemeCtx = createContext();

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

export const ThemeContextProvider = ({ children }) => (
  <ThemeCtx.Provider value={{}}>
    {children}
  </ThemeCtx.Provider>
);

export const useAppTheme = () => useContext(ThemeCtx);

/** Returns the colour-token object. Always light mode. */
export const useTokens = () => LIGHT;
