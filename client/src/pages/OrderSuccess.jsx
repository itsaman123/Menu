import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, Container, Typography, Paper, Divider, Button, 
  CircularProgress, Alert, List, ListItem, ListItemText, Step, Stepper, StepLabel,
  Card, CardContent
} from '@mui/material';
import { CheckCircle, Timer } from '@mui/icons-material';
import api from '../api';
import { DEMO_ORDER } from '../demoData';

const OrderSuccess = () => {
  const { id } = useParams();
  const isDemo = id === 'demo_order_id';
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => (await api.get(`/api/orders/${id}`)).data,
    refetchInterval: 5000, // Poll every 5 seconds
    retry: 2,
    enabled: !isDemo
  });

  const order = isDemo ? DEMO_ORDER : data;
  const finalLoading = isDemo ? false : isLoading;

  useEffect(() => {
    if (order && order.createdAt) {
      const orderDate = new Date(order.createdAt).getTime();
      const prepTime = 15 * 60 * 1000; // 15 minutes in ms
      const endTime = orderDate + prepTime;

      const interval = setInterval(() => {
        const now = new Date().getTime();
        const difference = endTime - now;

        if (difference <= 0) {
          setTimeLeft(0);
          clearInterval(interval);
        } else {
          setTimeLeft(difference);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [order]);

  const formatTime = (ms) => {
    if (ms === null) return 'Calculating...';
    if (ms === 0) return 'Ready!';
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const statusSteps = ['pending', 'confirmed', 'preparing', 'completed'];
  const currentStep = order ? statusSteps.indexOf(order.status) : 0;

  if (finalLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isDemo && (error || !order)) {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="error">Order not found. Please contact the restaurant.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircle sx={{ fontSize: 70, color: 'success.main', mb: 1 }} />
        <Typography variant="h4" fontWeight="900" gutterBottom>Success! {isDemo && "(Demo)"}</Typography>
        <Typography variant="body1" color="text.secondary">
          Order <strong>#{isDemo ? 'DEMO6789' : id.slice(-6).toUpperCase()}</strong> has been placed.
        </Typography>
      </Box>

      {/* Real-time Order Tracking */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', position: 'relative' }}>
        {isDemo && (
          <Box sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.05)', px: 1, borderRadius: 1 }}>
            <Typography variant="caption">DEMO MODE</Typography>
          </Box>
        )}
        <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>Order Tracking</Typography>
        <Stepper activeStep={currentStep} alternativeLabel sx={{ mt: 3, mb: 4 }}>
          {statusSteps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ textTransform: 'capitalize' }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ 
          bgcolor: 'rgba(255, 87, 34, 0.05)', 
          p: 3, 
          borderRadius: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2,
          border: '1px dashed #FF5722'
        }}>
          <Timer color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
              Estimated Ready In
            </Typography>
            <Typography variant="h5" fontWeight="900" color="primary">
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Bill Summary */}
      <Card sx={{ mb: 4, borderRadius: 4, border: '1px solid #efefef' }} elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Order Summary</Typography>
          <List disablePadding>
            {order.items.map((item, idx) => (
              <ListItem key={idx} sx={{ py: 1, px: 0 }}>
                <ListItemText 
                  primary={<Typography fontWeight="600">{item.name} x {item.quantity}</Typography>} 
                  secondary={`₹${(item.price * item.quantity).toFixed(2)}`} 
                />
              </ListItem>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Order Total (inc. GST)</Typography>
              <Typography variant="h6" fontWeight="900" color="primary">₹{order.totalAmount.toFixed(2)}</Typography>
            </Box>
          </List>
        </CardContent>
      </Card>

      <Button 
        variant="contained" 
        size="large" 
        fullWidth 
        sx={{ py: 2, borderRadius: 3, boxShadow: '0 4px 14px 0 rgba(255,87,34,0.39)' }}
        onClick={() => navigate(`/menu/${order.restaurantId.slug || 'my-restaurant'}`)}
      >
        Order More Items
      </Button>
    </Container>
  );
};

export default OrderSuccess;
