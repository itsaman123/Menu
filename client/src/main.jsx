import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ThemeContextProvider } from './ThemeContext';
import './index.css';

const queryClient = new QueryClient();

// ─── Shared typography / shape — Inter editorial system ───
const baseTheme = {
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 },
    h2: { fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 },
    h3: { fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 },
    h4: { fontFamily: '"Inter", sans-serif', fontWeight: 700, lineHeight: 1.25 },
    h5: { fontFamily: '"Inter", sans-serif', fontWeight: 600, lineHeight: 1.3 },
    h6: { fontFamily: '"Inter", sans-serif', fontWeight: 600, lineHeight: 1.3 },
    body1: { fontSize: '0.95rem', lineHeight: 1.7 },
    body2: { fontSize: '0.85rem', lineHeight: 1.6 },
    button: { fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          fontSize: '0.9rem',
        },
      },
    },
    MuiAppBar: { styleOverrides: { root: { boxShadow: 'none' } } },
    MuiTab: { styleOverrides: { root: { fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'none' } } },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
};

const lightMuiTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: { main: '#f97316', light: '#ea580c', dark: '#c2410c', contrastText: '#fff' },
    secondary: { main: '#006c49' },
    error: { main: '#ba1a1a' },
    background: { default: '#fffaf6', paper: '#ffffff' },
    text: { primary: '#1a1c1d', secondary: '#5c4a3a' },
    divider: 'rgba(200,196,215,0.15)',
  },
});

const ThemedApp = () => (
  <ThemeProvider theme={lightMuiTheme}>
    <CssBaseline />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <ThemedApp />
      </ThemeContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
