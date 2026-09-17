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
  async (error) => {
    const config = error.config;

    // Temporary fallback bridge: one-shot retry if a request returns a non-JSON 404 HTML body
    if (config && !config._retryFallback && error.response?.status === 404) {
      const data = error.response.data;
      const contentType = error.response.headers?.['content-type'] || '';
      const isHtml =
        typeof data === 'string' &&
        (data.includes('<!DOCTYPE') ||
          data.includes('<html') ||
          data.includes('Cannot GET') ||
          data.includes('Cannot POST') ||
          contentType.includes('text/html'));
      const isNonJson = isHtml || !contentType.includes('application/json');

      if (isNonJson) {
        config._retryFallback = true;
        console.warn(
          `[api bridge fallback] Non-JSON 404 received for ${config.url || ''}. Retrying once with /api instead of /api/v1.`
        );

        if (config.baseURL && config.baseURL.includes('/api/v1')) {
          config.baseURL = config.baseURL.replace('/api/v1', '/api');
        } else if (config.url && config.url.includes('/api/v1')) {
          config.url = config.url.replace('/api/v1', '/api');
        }
        return api(config);
      }
    }

    const message = error.response?.data?.error || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default api;
