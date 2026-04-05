import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ThemeContextProvider, useAppTheme } from './ThemeContext';
import './index.css';

const queryClient = new QueryClient();

// ─── Shared typography / shape ───
const baseTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: { fontFamily: '"Manrope", "Inter", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Manrope", "Inter", sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Manrope", "Inter", sans-serif', fontWeight: 800 },
    h4: { fontFamily: '"Manrope", "Inter", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Manrope", "Inter", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Manrope", "Inter", sans-serif', fontWeight: 700 },
    body1: { fontSize: '0.95rem', lineHeight: 1.7 },
    body2: { fontSize: '0.85rem', lineHeight: 1.6 },
    button: { fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600, padding: '10px 24px', fontSize: '0.9rem' },
      },
    },
    MuiAppBar: { styleOverrides: { root: { boxShadow: 'none' } } },
    MuiTab: { styleOverrides: { root: { fontFamily: '"Manrope", sans-serif', fontWeight: 600, textTransform: 'none' } } },
  },
};

const darkMuiTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: { main: '#7c6ef0', light: '#a78bfa', dark: '#5341cd', contrastText: '#fff' },
    secondary: { main: '#8b8fa8' },
    error: { main: '#ef4444' },
    background: { default: '#0f1117', paper: '#16191f' },
    text: { primary: '#e8eaf0', secondary: '#8b8fa8' },
    divider: 'rgba(255,255,255,0.07)',
  },
});

const lightMuiTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: { main: '#6c5ce7', light: '#a78bfa', dark: '#4029ba', contrastText: '#fff' },
    secondary: { main: '#586062' },
    error: { main: '#ba1a1a' },
    background: { default: '#f4f5f7', paper: '#ffffff' },
    text: { primary: '#1a1c23', secondary: '#474554' },
    divider: 'rgba(0,0,0,0.08)',
  },
});

// Inner wrapper that reads theme context
const ThemedApp = () => {
  const { isDark } = useAppTheme();
  return (
    <ThemeProvider theme={isDark ? darkMuiTheme : lightMuiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <ThemedApp />
      </ThemeContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
