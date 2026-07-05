import { useState, useEffect } from 'react';
import { createCoupon, updateCoupon } from '../services/couponService';
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function CouponForm({ coupon = null, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    description: '',
    expiryDate: '',
    maxUses: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Pre-fill form if editing
  useEffect(() => {
    if (coupon) {
      const expiryDate = new Date(coupon.expiryDate).toISOString().split('T')[0];
      setFormData({
        code: coupon.code || '',
        discountPercentage: coupon.discountPercentage || '',
        description: coupon.description || '',
        expiryDate,
        maxUses: coupon.maxUses || '',
        isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      });
    }
  }, [coupon]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    }

    if (!formData.discountPercentage) {
      newErrors.discountPercentage = 'Discount percentage is required';
    } else {
      const disc = Number(formData.discountPercentage);
      if (disc < 1 || disc > 100) {
        newErrors.discountPercentage = 'Discount must be between 1-100%';
      }
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const selectedDate = new Date(formData.expiryDate);
      if (selectedDate < new Date()) {
        newErrors.expiryDate = 'Expiry date must be in the future';
      }
    }

    if (formData.maxUses && Number(formData.maxUses) < 1) {
      newErrors.maxUses = 'Max uses must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const submitData = {
        code: formData.code.toUpperCase().trim(),
        discountPercentage: Number(formData.discountPercentage),
        description: formData.description.trim(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        isActive: formData.isActive,
      };

      if (coupon) {
        await updateCoupon(coupon._id, submitData);
        setMessage({ type: 'success', text: 'Coupon updated successfully!' });
      } else {
        await createCoupon(submitData);
        setMessage({ type: 'success', text: 'Coupon created successfully!' });
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to save coupon';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-none shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {coupon ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Message */}
          {message.text && (
            <div
              className={`p-4 rounded-none font-bold text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Code */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Coupon Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., SAVE20"
              disabled={coupon ? true : false}
              className={`w-full px-4 py-2 border rounded-none focus:outline-none focus:ring-2 ${
                errors.code
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } ${coupon ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {errors.code && <p className="text-red-600 text-xs mt-1">{errors.code}</p>}
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Discount Percentage (1-100%) *
            </label>
            <input
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleInputChange}
              placeholder="e.g., 20"
              min="1"
              max="100"
              className={`w-full px-4 py-2 border rounded-none focus:outline-none focus:ring-2 ${
                errors.discountPercentage
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.discountPercentage && (
              <p className="text-red-600 text-xs mt-1">{errors.discountPercentage}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Summer sale discount"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Expiry Date *
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-none focus:outline-none focus:ring-2 ${
                errors.expiryDate
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.expiryDate && (
              <p className="text-red-600 text-xs mt-1">{errors.expiryDate}</p>
            )}
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Max Uses (Optional, leave empty for unlimited)
            </label>
            <input
              type="number"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleInputChange}
              placeholder="e.g., 100"
              min="1"
              className={`w-full px-4 py-2 border rounded-none focus:outline-none focus:ring-2 ${
                errors.maxUses
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.maxUses && <p className="text-red-600 text-xs mt-1">{errors.maxUses}</p>}
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="w-4 h-4 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="isActive" className="text-sm font-bold text-gray-900 cursor-pointer">
              Active (Coupon can be used)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-none hover:bg-gray-50 transition disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-none hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
