import { useEffect, useState } from 'react';
import { getAllCoupons, deleteCoupon } from '../../services/couponService';
import CouponForm from '../../components/CouponForm';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      setCoupons(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setShowForm(true);
  };

  const handleDelete = async (couponId, couponCode) => {
    if (!confirm(`Are you sure you want to delete "${couponCode}"?`)) {
      return;
    }

    setDeleting(couponId);
    try {
      await deleteCoupon(couponId);
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete coupon');
    } finally {
      setDeleting(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedCoupon(null);
    loadCoupons();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            Coupon Management
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Total coupons: {coupons.length}
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCoupon(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-none hover:bg-blue-700 transition"
        >
          + Create Coupon
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading coupons...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No coupons found. Create one to get started!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Code
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Discount
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Description
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Expires
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Uses
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Status
                </th>
                <th className="text-center px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-bold text-gray-900">{coupon.code}</td>
                  <td className="px-4 py-3 text-xs font-bold text-gray-900">{coupon.discountPercentage}%</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">
                    {coupon.description || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{formatDate(coupon.expiryDate)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {coupon.maxUses ? `${coupon.usedCount}/${coupon.maxUses}` : `${coupon.usedCount}/∞`}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded inline-block ${
                        !coupon.isActive
                          ? 'bg-gray-50 text-gray-700'
                          : isExpired(coupon.expiryDate)
                            ? 'bg-red-50 text-red-700'
                            : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {!coupon.isActive ? 'Inactive' : isExpired(coupon.expiryDate) ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-none transition"
                        title="Edit coupon"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id, coupon.code)}
                        disabled={deleting === coupon._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-none transition disabled:opacity-50"
                        title="Delete coupon"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Coupon Form Modal */}
      {showForm && (
        <CouponForm coupon={selectedCoupon} onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />
      )}
    </div>
  );
}
