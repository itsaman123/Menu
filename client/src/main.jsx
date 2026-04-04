import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './index.css';

const queryClient = new QueryClient();

// CulinaryCanvas Design System — MUI Theme
// Aligned with Stitch Project #5643472282066423814
const theme = createTheme({
  palette: {
    primary: {
      main: '#5341cd',
      light: '#6C5CE7',
      dark: '#4029ba',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#586062',
      light: '#dae1e3',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ba1a1a',
    },
    background: {
      default: '#f7f9fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#191c1e',
      secondary: '#474554',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: { fontFamily: '"Manrope", "Inter", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Manrope", "Inter", sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Manrope", "Inter", sans-serif', fontWeight: 800 },
    h4: { fontFamily: '"Manrope", "Inter", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Manrope", "Inter", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Manrope", "Inter", sans-serif', fontWeight: 700 },
    subtitle1: { fontWeight: 500 },
    body1: { fontSize: '0.95rem', lineHeight: 1.7 },
    body2: { fontSize: '0.85rem', lineHeight: 1.6 },
    button: { fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 4px 20px rgba(25, 28, 30, 0.04)',
    '0px 8px 30px rgba(25, 28, 30, 0.06)',
    '0px 12px 40px rgba(25, 28, 30, 0.08)',
    ...Array(21).fill('0px 20px 50px rgba(25, 28, 30, 0.06)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          fontSize: '0.9rem',
        },
        contained: {
          background: 'linear-gradient(135deg, #5341cd, #6C5CE7)',
          boxShadow: '0 8px 24px rgba(108, 92, 231, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4029ba, #5341cd)',
            boxShadow: '0 12px 28px rgba(108, 92, 231, 0.35)',
          },
        },
        outlined: {
          borderColor: 'rgba(200, 196, 215, 0.4)',
          '&:hover': {
            borderColor: '#5341cd',
            backgroundColor: 'rgba(108, 92, 231, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(25, 28, 30, 0.04)',
          border: 'none',
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#f2f4f6',
            '& fieldset': {
              borderColor: 'rgba(200, 196, 215, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(200, 196, 215, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#5341cd',
              boxShadow: '0 0 0 4px rgba(108, 92, 231, 0.1)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 600,
          textTransform: 'none',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #5341cd, #6C5CE7)',
          boxShadow: '0 8px 24px rgba(108, 92, 231, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4029ba, #5341cd)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
