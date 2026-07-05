import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function CategoryForm({ isOpen, onClose, onSubmit, initialData, isLoading }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        image: initialData.image || '',
      });
    } else {
      setForm({
        name: '',
        description: '',
        image: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!form.name?.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (form.name?.length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }

    if (form.name?.length > 50) {
      newErrors.name = 'Category name must be 50 characters or less';
    }

    if (form.description && form.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    if (form.image && form.image.length > 500) {
      newErrors.image = 'Image URL must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const submitData = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
    };

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md border-2 border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-black uppercase tracking-widest text-gray-900">
            {initialData ? 'Edit Category' : 'Create Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Electronics"
              className={`w-full px-4 py-3 border-2 text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none transition-colors ${
                errors.name
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-200 focus:border-gray-900'
              }`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter category description"
              rows="3"
              className={`w-full px-4 py-3 border-2 text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none transition-colors ${
                errors.description
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-200 focus:border-gray-900'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {form.description.length}/500 characters
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={`w-full px-4 py-3 border-2 text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none transition-colors ${
                errors.image
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-200 focus:border-gray-900'
              }`}
            />
            {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image}</p>}
          </div>

          {/* Preview */}
          {form.image && (
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                Preview
              </p>
              <img
                src={form.image}
                alt="preview"
                className="w-full h-24 object-cover border border-gray-200"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-sm font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-900 text-sm font-bold uppercase tracking-widest text-white hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
