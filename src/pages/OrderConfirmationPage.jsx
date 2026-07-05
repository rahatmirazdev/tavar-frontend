import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getOrderById, getGuestOrderById } from '../services/orderService';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { MapPinIcon, PhoneIcon, TruckIcon } from '@heroicons/react/24/outline';

const formatPrice = (price) => {
  if (typeof price === 'string') return price.startsWith('৳') ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString('en-IN')}`;
};

export default function OrderConfirmationPage() {
  const { orderId, email } = useParams();  // email param is now tracking token
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const isGuest = location.state?.isGuest || email;
  // For guest orders, email param is actually the tracking token (or trackingToken from state)
  const guestTrackingToken = email || location.state?.trackingToken;

  // Use order from navigation state if available (COD flow),
  // otherwise fetch from API (SSLCommerz redirect flow)
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!location.state?.order && orderId) {
      setLoading(true);
      if (isGuest && guestTrackingToken) {
        // Guest order - use tracking token for security
        getGuestOrderById(orderId, guestTrackingToken)
          .then(setOrder)
          .catch(() => setFetchError('Could not load order details. Please verify your order ID and tracking token.'))
          .finally(() => setLoading(false));
      } else {
        // Authenticated user order
        getOrderById(orderId)
          .then(setOrder)
          .catch(() => setFetchError('Could not load order details.'))
          .finally(() => setLoading(false));
      }
    }
  }, [orderId, guestTrackingToken, isGuest]); // eslint-disable-line

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-pulse text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-none mx-auto" />
          <div className="h-4 bg-gray-100 rounded w-48 mx-auto" />
          <div className="h-3 bg-gray-100 rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (fetchError && !order) {
    return (
      <div className="min-h-screen bg-white pt-32 flex flex-col items-center gap-6 px-4">
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{fetchError}</p>
        <Link
          to="/"
          className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  // ── Derive values ──────────────────────────────────────────────────────────

  const orderedItems = order?.items || order?.orderItems || [];
  const address = order?.shippingAddress || {};
  const displayId = (order?._id || order?.id || orderId || '')
    .toString()
    .toUpperCase()
    .slice(-10);

  const isCOD = order?.paymentMethod === 'cod' || !order?.paymentMethod;

  return (
    <div className="bg-white pt-24 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* ── Success Header ── */}
        <div className="text-center mb-10">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-sm text-gray-500">
            Thank you{user?.name ? `, ${user.name.split(' ')[0]}` : ''} — your order has been
            placed successfully.
          </p>

          {displayId && (
            <div className="mt-5 inline-block px-5 py-3 bg-gray-50 border border-gray-200">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                Order ID
              </p>
              <p className="text-base font-black text-gray-900 font-mono tracking-wider">
                #{displayId}
              </p>
            </div>
          )}
        </div>

        {/* ── COD notice ── */}
        {isCOD && (
          <div className="flex items-start gap-3 mb-6 bg-yellow-50 border border-yellow-200 px-5 py-4">
            <TruckIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-yellow-700">
                Cash on Delivery
              </p>
              <p className="text-xs text-yellow-600 mt-0.5">
                Please keep the exact amount ready when your order arrives.
              </p>
            </div>
          </div>
        )}

        {/* ── Items ── */}
        {orderedItems.length > 0 && (
          <div className="border border-gray-100 mb-6">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
                Items Ordered ({orderedItems.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {orderedItems.map((item, i) => (
                <div key={item._id || i} className="flex gap-4 p-4 items-center">
                  {item.image && (
                    <div className="w-14 h-[72px] bg-gray-100 overflow-hidden rounded flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-tight line-clamp-2">
                      {item.name}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.size && item.size !== 'default' && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-gray-200 text-gray-500">
                          {item.size}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <p className="text-sm font-black text-gray-900 flex-shrink-0">
                    {formatPrice((item.price || 0) * (item.quantity || 1))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Delivery Address ── */}
        {(address.name || address.address || address.phone) && (
          <div className="border border-gray-100 mb-6 p-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-3 flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gray-500" />
              Delivery Address
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              {address.name && (
                <p className="font-bold text-gray-900">{address.name}</p>
              )}
              {address.phone && (
                <p className="flex items-center gap-1.5">
                  <PhoneIcon className="h-3.5 w-3.5 text-gray-400" />
                  {address.phone}
                </p>
              )}
              {address.address && <p>{address.address}</p>}
              {address.city && <p className="capitalize">{address.city}</p>}
              {address.zoneLabel && (
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">
                  {address.zoneLabel}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Price Breakdown ── */}
        <div className="border-2 border-gray-900 p-5 mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4">
            Price Breakdown
          </h2>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">{formatPrice(order?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery ({address.zoneLabel || '—'})</span>
              <span className="font-bold text-gray-900">
                {formatPrice(order?.deliveryCharge || 0)}
              </span>
            </div>
            {order?.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span>
                <span className="font-bold">−{formatPrice(order.discountAmount)}</span>
              </div>
            )}
          </div>

          <div className="border-t-2 border-gray-900 pt-4 flex justify-between items-center">
            <span className="text-sm font-black uppercase tracking-widest text-gray-900">
              Total
            </span>
            <span className="text-2xl font-black text-gray-900">
              {formatPrice(order?.total || 0)}
            </span>
          </div>

          <div className="mt-4">
            <span
              className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 border ${
                isCOD
                  ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                  : 'border-green-300 bg-green-50 text-green-700'
              }`}
            >
              {isCOD ? 'Payment: Cash on Delivery' : 'Payment: Paid Online'}
            </span>
          </div>
        </div>

        {/* ── CTAs ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/products"
            className="flex-1 text-center py-4 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="flex-1 text-center py-4 border-2 border-gray-900 text-gray-900 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
