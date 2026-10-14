import axios from 'axios';

// Auto-detect API URL:
// In production or when hosted together/reverse-proxied, use relative '/api'
// In development, prioritize VITE_API_URL or default to '/api'
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return '/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Optional token interceptor if token stored in localStorage for backup
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pe_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message extraction
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
