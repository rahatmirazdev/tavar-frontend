import axiosInstance from './axiosInstance';

const API_BASE = '/orders';
const COUPON_BASE = '/coupons';
const PAYMENT_BASE = '/payment';

/**
 * Create a new order (authenticated user)
 */
export const createOrder = async (orderData) => {
  const response = await axiosInstance.post(API_BASE, orderData);
  return response.data;
};

/**
 * Create a guest order (no authentication needed)
 */
export const createGuestOrder = async (orderData) => {
  const response = await axiosInstance.post(`${API_BASE}/guest/create`, orderData);
  return response.data;
};

/**
 * Get a single order by ID (authenticated user)
 * Returns order data + server-calculated cancellation window
 */
export const getOrderById = async (orderId) => {
  const response = await axiosInstance.get(`${API_BASE}/${orderId}`);
  return response.data; // Returns { order, cancellationWindowMs, serverTime }
};

/**
 * Get guest order details using tracking token (public, no auth needed)
 * SECURITY: Uses token-based verification instead of email
 */
export const getGuestOrderById = async (orderId, trackingToken) => {
  const response = await axiosInstance.get(`${API_BASE}/guest/${orderId}/${trackingToken}`);
  return response.data.order || response.data;
};

/**
 * Get all orders for the logged-in user
 */
export const getUserOrders = async () => {
  const response = await axiosInstance.get(`${API_BASE}/my-orders`);
  return response.data.orders || response.data;
};

/**
 * Get all orders (admin only)
 * Note: Use adminService.getAllOrders instead, as it's the correct API route.
 */

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosInstance.patch(`${API_BASE}/${orderId}/status`, {
    status,
  });
  return response.data;
};

/**
 * Cancel an order (user can cancel their own pending/processing orders)
 */
export const cancelOrder = async (orderId) => {
  const response = await axiosInstance.patch(`${API_BASE}/${orderId}/cancel`);
  return response.data;
};

/**
 * Apply a coupon to get discount
 */
export const applyCoupon = async (code, subtotal) => {
  const response = await axiosInstance.post(`${COUPON_BASE}/apply`, {
    code,
    subtotal,
  });
  return response.data;
};

/**
 * Validate a coupon code
 */
export const validateCoupon = async (code) => {
  const response = await axiosInstance.post(`${COUPON_BASE}/validate`, {
    code,
  });
  return response.data;
};

/**
 * Initiate SSLCommerz payment for an order
 */
export const initiateSSLCommerz = async (orderId) => {
  const response = await axiosInstance.post(
    `${PAYMENT_BASE}/sslcommerz/init`,
    { orderId }
  );
  return response.data;
};
