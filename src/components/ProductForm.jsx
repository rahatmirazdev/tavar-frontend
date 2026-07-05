import { useEffect, useState } from 'react';
import { createProduct, updateProduct } from '../services/productService';
import { XMarkIcon } from '@heroicons/react/24/outline';

const BADGES = ['New', 'Trending', 'Sale', 'Low Stock', 'Sold Out', ''];
const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductForm({ product = null, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    images: [],
    sizes: [...DEFAULT_SIZES],
    colors: [],
    stock: '',
    badge: '',
  });

  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [colorInput, setColorInput] = useState({ name: '', hex: '#000000' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        images: product.images || [],
        sizes: product.sizes || [...DEFAULT_SIZES],
        colors: product.colors || [],
        stock: product.stock || '',
        badge: product.badge || '',
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddColor = () => {
    if (colorInput.name.trim()) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, colorInput],
      }));
      setColorInput({ name: '', hex: '#000000' });
    }
  };

  const handleRemoveColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleSizeChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      sizes: checked
        ? [...prev.sizes, value]
        : prev.sizes.filter(s => s !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    if (!formData.category || !formData.category.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
      };

      if (product?._id) {
        await updateProduct(product._id, submitData);
        setSuccess('Product updated successfully!');
      } else {
        await createProduct(submitData);
        setSuccess('Product created successfully!');
      }

      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-none max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            {product ? 'Edit Product' : 'Create Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-bold">
              {success}
            </div>
          )}

          {/* Name & Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                className="w-full px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">
                Price (৳) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">
                Category (e.g., "Men's Clothing") *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Enter category name"
                className="w-full px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                placeholder="e.g., Men's Shirts"
                className="w-full px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Stock & Badge */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">
                Badge Status
              </label>
              <select
                name="badge"
                value={formData.badge}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              >
                {BADGES.map(badge => (
                  <option key={badge || 'none'} value={badge}>
                    {badge || 'None'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-3">
              Available Sizes
            </label>
            <div className="flex flex-wrap gap-3">
              {DEFAULT_SIZES.map(size => (
                <label key={size} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={size}
                    checked={formData.sizes.includes(size)}
                    onChange={handleSizeChange}
                    className="w-4 h-4 text-gray-900 rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm font-bold text-gray-900">{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">
              Colors
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={colorInput.name}
                onChange={(e) => setColorInput(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Color name (e.g., Black)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-none">
                <input
                  type="color"
                  value={colorInput.hex}
                  onChange={(e) => setColorInput(prev => ({ ...prev, hex: e.target.value }))}
                  className="w-10 h-10 cursor-pointer"
                />
              </div>
              <button
                type="button"
                onClick={handleAddColor}
                className="px-4 py-2 bg-gray-900 text-white font-bold rounded-none hover:bg-gray-800 transition text-sm"
              >
                Add Color
              </button>
            </div>
            {formData.colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-none"
                  >
                    <div
                      className="w-5 h-5 rounded border border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm font-bold text-gray-900">{color.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(index)}
                      className="ml-1 text-red-600 hover:text-red-800 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">
              Images (URLs)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-gray-900 text-white font-bold rounded-none hover:bg-gray-800 transition text-sm"
              >
                Add Image
              </button>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-none border border-gray-200"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=Invalid';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-none p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-900 text-white font-bold rounded-none hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 font-bold rounded-none hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
