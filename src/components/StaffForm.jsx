import { useState, useEffect } from 'react';
import { createStaff, updateUserRole } from '../services/adminService';
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function StaffForm({ staff = null, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'staff',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Pre-fill form if editing
  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        password: '', // Don't show existing password
        phone: staff.phone || '',
        role: staff.role || 'staff',
      });
    }
  }, [staff]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!staff && !formData.password) {
      newErrors.password = 'Password is required';
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role || !['admin', 'staff'].includes(formData.role)) {
      newErrors.role = 'Role must be either admin or staff';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      if (staff) {
        // Update existing staff - only allow role change
        await updateUserRole(staff._id, formData.role);
        setMessage({ type: 'success', text: 'Staff member updated successfully!' });
      } else {
        // Create new staff
        await createStaff({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          role: formData.role,
        });
        setMessage({ type: 'success', text: 'Staff member created successfully!' });
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to save staff member';
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
            {staff ? 'Edit Staff Member' : 'Create Staff Member'}
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

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., John Doe"
              className={`w-full px-4 py-2 border rounded-none focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g., john@example.com"
              disabled={staff ? true : false}
              className={`w-full px-4 py-2 border rounded-none focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } ${staff ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            {staff && <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Password {staff ? '(leave empty to keep current)' : '*'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={staff ? 'Leave empty to keep current password' : 'Minimum 6 characters'}
              className={`w-full px-4 py-2 border rounded-none focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Phone (Optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g., +880123456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-none focus:outline-none focus:ring-2 ${
                errors.role
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
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
              {loading ? 'Saving...' : staff ? 'Update Staff Member' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
