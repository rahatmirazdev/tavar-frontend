import axiosInstance from './axiosInstance';

const API_BASE = '/products';

/**
 * Search products using MongoDB text index
 * @param {String} query - Search query (minimum 2 characters)
 * @param {Object} params - Additional parameters (page, limit, sort)
 */
export const searchProducts = async (query, params = {}) => {
  const response = await axiosInstance.get(`${API_BASE}/search`, {
    params: { q: query, ...params },
  });
  return response.data;
};

/**
 * Get all products with optional filters and pagination
 * @param {Object} params - Query parameters (page, limit, category, search, sort)
 */
export const getAllProducts = async (params = {}) => {
  const response = await axiosInstance.get(API_BASE, { params });
  return response.data;
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id) => {
  const response = await axiosInstance.get(`${API_BASE}/${id}`);
  return response.data.product || response.data;
};

/**
 * Get trending products (rating >= 4.5 or badge === 'Trending')
 */
export const getTrendingProducts = async () => {
  const response = await axiosInstance.get(`${API_BASE}/trending`);
  return response.data.products || response.data;
};

/**
 * Create a new product (admin only)
 */
export const createProduct = async (productData) => {
  const response = await axiosInstance.post(API_BASE, productData);
  return response.data;
};

/**
 * Update a product (admin only)
 */
export const updateProduct = async (id, productData) => {
  const response = await axiosInstance.put(`${API_BASE}/${id}`, productData);
  return response.data;
};

/**
 * Delete a product (admin only)
 */
export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`${API_BASE}/${id}`);
  return response.data;
};
