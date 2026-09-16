import axios from 'axios';
import { getAccessToken } from './supabase';

const baseURL =
  ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
    'http://localhost:5000') + '/api/v1';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor attaching Supabase bearer token when session exists
api.interceptors.request.use(async (config) => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_err) {
    // Continue unauthenticated if session retrieval fails
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default api;
