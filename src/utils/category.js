/**
 * Safely extract category name from category object or string
 * Handles both populated objects {_id, name} and raw ObjectId strings
 * @param {string | object} category - Category as string or object with {_id, name}
 * @returns {string} Category name or empty string
 */
export const getCategoryName = (category) => {
  if (!category) {
    return '';
  }

  if (typeof category === 'object' && category.name) {
    return category.name;
  }

  if (typeof category === 'string') {
    return category;
  }

  if (typeof category === 'object' && category._id) {
    return '';
  }

  return category?.name || '';
};

/**
 * Safely extract category ID from category object
 * @param {string | object} category - Category as string or object with {_id, name}
 * @returns {string} Category ID or the category itself if string
 */
export const getCategoryId = (category) => {
  if (!category) return '';
  if (typeof category === 'string') return category;
  return category?._id || category;
};
