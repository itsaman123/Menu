// Resolves the backend API base URL at runtime.
// Priority: VITE_API_URL build-time env var → localhost dev fallback → same-origin (prod)

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (isLocalhost ? 'http://localhost:5000' : '');
