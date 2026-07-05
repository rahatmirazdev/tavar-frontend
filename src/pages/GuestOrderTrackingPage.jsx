import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getGuestOrderById } from '../services/orderService';
import { sanitizeHtml } from '../utils/sanitize';
import { CheckCircleIcon, TruckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const formatPrice = (price) => {
  if (typeof price === 'string') return price.startsWith('৳') ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString('en-IN')}`;
};

export default function GuestOrderTrackingPage() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [trackingToken, setTrackingToken] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setSearchAttempted(true);

    if (!orderId.trim() || !trackingToken.trim()) {
      setError('Please enter both order ID and tracking token');
      return;
    }

    setLoading(true);
    try {
      const result = await getGuestOrderById(orderId.trim(), trackingToken.trim());
      setOrder(result);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Order not found. Please verify your order ID and tracking token.'
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      processing: 'text-blue-600 bg-blue-50',
      shipped: 'text-purple-600 bg-purple-50',
      delivered: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status) => {
    if (status === 'delivered') return <CheckCircleIcon className="h-5 w-5" />;
    if (status === 'shipped') return <TruckIcon className="h-5 w-5" />;
    return null;
  };

  return (
    <div className="bg-white pt-24 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-3">
            Track Your Order
          </h1>
          <p className="text-sm text-gray-500">
            Enter your order ID and email address to view your order status
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-gray-50 border border-gray-200 p-8 rounded-none mb-12">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                Order ID *
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., 65F1B2A3D4E5F6G7H8I9J"
                className="w-full px-4 py-3 border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              />
              <p className="mt-1 text-xs text-gray-500">
                You can find this in your confirmation email
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                Tracking Token *
              </label>
              <input
                type="text"
                value={trackingToken}
                onChange={(e) => setTrackingToken(e.target.value)}
                placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                className="w-full px-4 py-3 border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              />
              <p className="mt-1 text-xs text-gray-500">
                The tracking token provided in your order confirmation email
              </p>
            </div>

            {error && searchAttempted && (
              <div className="bg-red-50 border border-red-200 p-4 flex gap-3 rounded">
                <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 p-6 flex gap-4 rounded-none">
              <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-900">Order Found</p>
                <p className="text-sm text-green-700">
                  Order ID: {(order._id || '').toString().toUpperCase().slice(-10)}
                </p>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-white border border-gray-200 p-6 rounded-none">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-4">
                Order Status
              </h2>
              <div className="flex items-center gap-3">
                {getStatusIcon(order.orderStatus)}
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus || 'pending'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Payment Status: <span className="font-bold">{order.paymentStatus || 'Pending'}</span>
              </p>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-gray-200 p-6 rounded-none">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-4">
                Order Items
              </h2>
              <div className="space-y-3">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{sanitizeHtml(item.name)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Qty: {item.quantity}{item.size ? ` | Size: ${sanitizeHtml(item.size)}` : ''}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-gray-200 p-6 rounded-none">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-4">
                Delivery Address
              </h2>
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-semibold">{sanitizeHtml(order.shippingAddress?.name || 'N/A')}</p>
                <p>{sanitizeHtml(order.shippingAddress?.street || 'N/A')}</p>
                <p>{sanitizeHtml(order.shippingAddress?.city || 'N/A')}, {sanitizeHtml(order.shippingAddress?.district || '')}</p>
                <p>{sanitizeHtml(order.shippingAddress?.zipcode || 'N/A')}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Phone: {sanitizeHtml(order.shippingAddress?.phone || 'N/A')}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white border border-gray-200 p-6 rounded-none">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-semibold">{formatPrice(order.shippingCharge)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-semibold">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment & Order Info */}
            <div className="bg-white border border-gray-200 p-6 rounded-none">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-4">
                Order Information
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Payment Method</p>
                  <p className="font-semibold capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Delivery Zone</p>
                  <p className="font-semibold">{order.shippingAddress?.zoneLabel || order.zone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Order Date</p>
                  <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Order ID</p>
                  <p className="font-semibold text-xs">{(order._id || '').toString().toUpperCase().slice(-10)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Search Yet */}
        {!order && !loading && !error && !searchAttempted && (
          <div className="text-center py-12">
            <TruckIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">
              Enter your order details above to track your order
            </p>
          </div>
        )}

        {/* Back to Shopping */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
