import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import api from '../api';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/superadmin/login', { email, password });
      localStorage.setItem('saToken', res.data.token);
      localStorage.setItem('saUser', JSON.stringify(res.data));
      navigate('/superadmin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--cc-surface-container-low)', p: 3 }}>
      <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="800" sx={{ mb: 1, color: 'var(--cc-primary)' }}>Super Admin</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>System Administrator Access Only</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <form onSubmit={handleLogin}>
          <TextField fullWidth label="Email" variant="outlined" margin="normal" value={email} onChange={e => setEmail(e.target.value)} required />
          <TextField fullWidth label="Password" type="password" variant="outlined" margin="normal" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ mt: 3, mb: 2, p: 1.5, borderRadius: 'var(--radius-lg)' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default SuperAdminLogin;
