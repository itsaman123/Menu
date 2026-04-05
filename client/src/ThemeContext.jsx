import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeCtx = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('cc-theme');
    return saved ? saved === 'dark' : true; // default dark
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
    document.body.style.backgroundColor = isDark ? '#0f1117' : '#f4f5f7';
    document.body.style.color = isDark ? '#e8eaf0' : '#1a1c23';
  }, [isDark]);

  return (
    <ThemeCtx.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeCtx);
