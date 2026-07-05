import axiosInstance from './axiosInstance';

const API_BASE = '/admin';

/**
 * Create a new staff or admin user (admin only)
 */
export const createStaff = async (staffData) => {
  const response = await axiosInstance.post(`${API_BASE}/staff`, staffData);
  return response.data;
};

/**
 * Update a user's role (admin only)
 */
export const updateUserRole = async (userId, role) => {
  const response = await axiosInstance.patch(`${API_BASE}/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Delete a user (admin only)
 */
export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`${API_BASE}/users/${userId}`);
  return response.data;
};

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (params = {}) => {
  const response = await axiosInstance.get(`${API_BASE}/orders`, { params });
  return response.data.orders || response.data;
};

/**
 * Get order statistics (admin only)
 */
export const getOrderStats = async () => {
  const response = await axiosInstance.get(`${API_BASE}/orders/stats`);
  return response.data;
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (params = {}) => {
  const response = await axiosInstance.get(`${API_BASE}/users`, { params });
  return response.data.users || response.data;
};

/**
 * Get user details with orders (admin only)
 */
export const getUserDetails = async (userId) => {
  const response = await axiosInstance.get(`${API_BASE}/users/${userId}`);
  return response.data.user || response.data;
};

/**
 * Delete all cancelled orders from database (admin only)
 */
export const deleteCancelledOrders = async () => {
  const response = await axiosInstance.delete(`${API_BASE}/orders/cancelled`);
  return response.data;
};
