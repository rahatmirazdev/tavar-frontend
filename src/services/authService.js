import axiosInstance from './axiosInstance';

const API_BASE = '/auth';

/**
 * User login
 */
export const login = async (credentials) => {
  const response = await axiosInstance.post(`${API_BASE}/login`, credentials);
  // Return token structure (refreshToken now in httpOnly cookie)
  return {
    accessToken: response.data.accessToken,
    user: response.data.user,
  };
};

/**
 * User registration
 */
export const register = async (userData) => {
  const response = await axiosInstance.post(`${API_BASE}/register`, userData);
  // Return token structure (refreshToken now in httpOnly cookie)
  return {
    accessToken: response.data.accessToken,
    user: response.data.user,
  };
};

/**
 * Get user profile
 */
export const getProfile = async () => {
  const response = await axiosInstance.get(`${API_BASE}/profile`);
  return response.data.user;
};

/**
 * Update user profile
 */
export const updateProfile = async (userData) => {
  const response = await axiosInstance.put(`${API_BASE}/profile`, userData);
  return response.data;
};

/**
 * Refresh access token (refreshToken sent automatically in cookies)
 */
export const refreshAccessToken = async () => {
  const response = await axiosInstance.post(`${API_BASE}/refresh`);
  return response.data.accessToken;
};

/**
 * User logout
 */
export const logout = async () => {
  try {
    await axiosInstance.post(`${API_BASE}/logout`);
  } catch (error) {
    // Even if logout fails on server, we still clear client-side auth
  }
};
