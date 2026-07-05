import axiosInstance from './axiosInstance';

const API_BASE = '/coupons';

/**
 * Validate a coupon code (public)
 */
export const validateCoupon = async (code) => {
  const response = await axiosInstance.post(`${API_BASE}/validate`, { code });
  return response.data;
};

/**
 * Apply a coupon and get discount (public)
 */
export const applyCoupon = async (code, subtotal) => {
  const response = await axiosInstance.post(`${API_BASE}/apply`, {
    code,
    subtotal,
  });
  return response.data;
};

/**
 * Create a new coupon (admin only)
 */
export const createCoupon = async (couponData) => {
  const response = await axiosInstance.post(API_BASE, couponData);
  return response.data;
};

/**
 * Get all coupons (admin only)
 */
export const getAllCoupons = async (params = {}) => {
  const response = await axiosInstance.get(API_BASE, { params });
  return response.data.coupons || response.data;
};

/**
 * Update a coupon (admin only)
 */
export const updateCoupon = async (id, couponData) => {
  const response = await axiosInstance.put(`${API_BASE}/${id}`, couponData);
  return response.data;
};

/**
 * Delete a coupon (admin only)
 */
export const deleteCoupon = async (id) => {
  const response = await axiosInstance.delete(`${API_BASE}/${id}`);
  return response.data;
};
