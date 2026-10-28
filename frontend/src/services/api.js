import axios from 'axios';

// In production (Vercel), VITE_API_URL must be set in Vercel dashboard to your Render URL.
// Fallback order: env var → production Render URL → local dev
const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? 'https://hotelpro-api.onrender.com/api'
      : 'http://localhost:5000/api'),
});

// Automatically inject JWT token into authorization header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong with the server';
    return Promise.reject(new Error(message));
  }
);

export default API;
