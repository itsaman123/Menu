import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Interceptor: Attach both Auth Token AND Restaurant ID on every request
// This is critical for multi-tenant SaaS — every admin API call must be scoped to a restaurant
api.interceptors.request.use((config) => {
  const saToken = localStorage.getItem('saToken');
  const token = localStorage.getItem('token');
  
  if (config.url && config.url.includes('/superadmin') && saToken) {
    config.headers.Authorization = `Bearer ${saToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Send restaurantId header for server-side validation
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed.restaurantId) {
        config.headers['X-Restaurant-Id'] = parsed.restaurantId;
      }
    } catch (e) {
      // invalid JSON in localStorage, ignore
    }
  }

  return config;
});

export default api;
