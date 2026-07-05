import axiosInstance from './axiosInstance';

const API_BASE = '/reviews';

/**
 * Get all reviews for a product (public)
 */
export const getProductReviews = async (productId) => {
  const response = await axiosInstance.get(`${API_BASE}/products/${productId}/reviews`);
  return response.data.reviews || response.data;
};

/**
 * Submit a review for a product (requires authentication)
 * Verifies user has a delivered order with this product
 */
export const submitReview = async (productId, { rating, comment }) => {
  const response = await axiosInstance.post(
    `${API_BASE}/products/${productId}/reviews`,
    { rating, comment }
  );
  return response.data;
};

/**
 * Update a review (requires authentication)
 */
export const updateReview = async (reviewId, { rating, comment }) => {
  const response = await axiosInstance.put(`${API_BASE}/${reviewId}`, {
    rating,
    comment,
  });
  return response.data;
};

/**
 * Delete a review (requires authentication)
 */
export const deleteReview = async (reviewId) => {
  const response = await axiosInstance.delete(`${API_BASE}/${reviewId}`);
  return response.data;
};

/**
 * Check if user has purchased this product
 */
export const checkHasPurchased = async (productId) => {
  const response = await axiosInstance.get(`/orders/check-purchased/${productId}`);
  return response.data;
};
