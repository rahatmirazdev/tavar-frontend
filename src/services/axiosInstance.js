import axios from 'axios';
import store from '../redux/store';
import { updateAccessToken, logout } from '../redux/authSlice';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies automatically (refreshToken)
});

// Interceptor for adding JWT accessToken from Redux
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth?.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Validate JWT format (3 dot-separated base64url parts)
 * Browser-compatible validation without Node.js Buffer API
 */
const isValidJWTFormat = (token) => {
  if (typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Validate each part is valid base64url
  // Base64url uses: A-Z a-z 0-9 - _ (no + / =)
  const base64urlRegex = /^[A-Za-z0-9_-]*$/;
  
  try {
    return parts.every(part => {
      if (!part) return false;
      // Check if part contains only valid base64url characters
      if (!base64urlRegex.test(part)) return false;
      // Try to decode using atob (browser-compatible)
      atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      return true;
    });
  } catch (e) {
    // If atob fails or any error occurs, invalid JWT
    return false;
  }
};

// Interceptor for handling errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint (cookies sent automatically with withCredentials)
        const response = await axiosInstance.post('/auth/refresh');
        const newAccessToken = response.data.accessToken;

        // ⚠️ CRITICAL: Validate new access token format before using it
        if (!isValidJWTFormat(newAccessToken)) {
          throw new Error('Invalid token format from server');
        }

        // Update Redux store with new access token
        store.dispatch(updateAccessToken(newAccessToken));

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
