import axiosInstance from './axiosInstance';

const API_BASE = '/categories';

/**
 * Get all categories (public).
 * Response shape: { categories: [{ _id, name, description, subcategories, image, productCount }] }
 */
export const getAllCategories = async () => {
  const response = await axiosInstance.get(API_BASE);
  return response.data.categories || [];
};

/**
 * Get a single category by ID (public).
 */
export const getCategoryById = async (id) => {
  const response = await axiosInstance.get(`${API_BASE}/${id}`);
  return response.data.category;
};

/**
 * Create a new category (admin only).
 * Body: { name, description, subcategories, image }
 */
export const createCategory = async (data) => {
  const response = await axiosInstance.post(API_BASE, data);
  return response.data;
};

/**
 * Update a category by ID (admin only).
 * Body: { name, description, subcategories, image }
 */
export const updateCategory = async (id, data) => {
  const response = await axiosInstance.put(`${API_BASE}/${id}`, data);
  return response.data;
};

/**
 * Delete a category by ID (admin only).
 * Fails with 400 if products are still linked to the category.
 */
export const deleteCategory = async (id) => {
  const response = await axiosInstance.delete(`${API_BASE}/${id}`);
  return response.data;
};
