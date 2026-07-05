import { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import CategoryForm from '../../components/CategoryForm';
import * as categoryService from '../../services/categoryService';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Open create modal
  const handleCreateClick = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (selectedCategory) {
        // Update existing
        await categoryService.updateCategory(selectedCategory._id, formData);
        setSuccessMessage('Category updated successfully');
      } else {
        // Create new
        await categoryService.createCategory(formData);
        setSuccessMessage('Category created successfully');
      }

      // Refresh list
      await fetchCategories();
      setIsModalOpen(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await categoryService.deleteCategory(id);
      setSuccessMessage('Category deleted successfully');
      await fetchCategories();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
            Categories
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Create, edit, and manage product categories
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Create Category
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <p className="text-gray-400">Loading categories...</p>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category._id} className="border-2 border-gray-200 p-6">
              {/* Image */}
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-32 object-cover mb-4 border border-gray-200"
                />
              )}

              {/* Content */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {category.description}
                  </p>
                )}
                {category.productCount && (
                  <p className="text-xs text-gray-500">
                    <span className="font-bold">{category.productCount}</span> products
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(category)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-200 bg-blue-50 text-blue-700 font-bold text-xs uppercase hover:bg-blue-100 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-200 bg-red-50 text-red-700 font-bold text-xs uppercase hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <div className="p-12 border-2 border-dashed border-gray-200 text-center">
          <p className="text-gray-500 mb-4">No categories found</p>
          <button
            onClick={handleCreateClick}
            className="px-6 py-3 bg-gray-900 text-white font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors"
          >
            Create First Category
          </button>
        </div>
      )}

      {/* Modal */}
      <CategoryForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedCategory}
        isLoading={isSubmitting}
      />
    </div>
  );
}
