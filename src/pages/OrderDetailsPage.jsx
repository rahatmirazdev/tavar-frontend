import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../services/orderService';
import { sanitizeHtml } from '../utils/sanitize';
import {
  ClockIcon,
  CogIcon,
  TruckIcon,
  HomeModernIcon,
  XCircleIcon,
  MapPinIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const formatPrice = (price) => {
  if (typeof price === 'string') return price.startsWith('৳') ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString('en-IN')}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ── Status timeline ──────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed', Icon: ClockIcon },
  { key: 'processing', label: 'Processing',   Icon: CogIcon },
  { key: 'shipped',    label: 'Shipped',      Icon: TruckIcon },
  { key: 'delivered',  label: 'Delivered',    Icon: HomeModernIcon },
];
const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered'];

function StatusTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 mb-6">
        <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-700">Order Cancelled</p>
          <p className="text-xs text-red-500 mt-0.5">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="border border-gray-100 p-5 mb-6">
      <h2 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6">
        Order Status
      </h2>
      <div className="relative flex items-start justify-between">
        {/* Track line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200">
          <div
            className="h-full bg-black transition-all duration-500"
            style={{
              width:
                currentIndex <= 0
                  ? '0%'
                  : `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>

        {STATUS_STEPS.map(({ key, label, Icon }, i) => {
          const isCompleted = i <= currentIndex;
          const isActive = i === currentIndex;
          return (
            <div
              key={key}
              className="relative flex flex-col items-center gap-2 z-10"
              style={{ width: `${100 / STATUS_STEPS.length}%` }}
            >
              <div
                className={`w-8 h-8 rounded-none flex items-center justify-center border-2 transition-colors ${
                  isCompleted ? 'bg-black border-black' : 'bg-white border-gray-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isCompleted ? 'text-white' : 'text-gray-300'}`} />
              </div>
              <p
                className={`text-[10px] font-bold uppercase tracking-wider text-center leading-tight ${
                  isActive ? 'text-black' : isCompleted ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [serverTimeOffset, setServerTimeOffset] = useState(0); // Track time difference

  useEffect(() => {
    getOrderById(orderId)
      .then((data) => {
        setOrder(data.order || data);
        // Calculate offset between server time and client time
        if (data.serverTime) {
          setServerTimeOffset(data.serverTime - Date.now());
          // Use server-calculated time
          if (data.cancellationWindowMs !== undefined) {
            setTimeRemaining(data.cancellationWindowMs);
          }
        }
      })
      .catch(() => setError('Could not load order details.'))
      .finally(() => setLoading(false));
  }, [orderId]); // eslint-disable-line

  // Live countdown timer - updates every second using server offset
  useEffect(() => {
    if (!order?.createdAt || serverTimeOffset === undefined) return;

    const updateTimer = () => {
      const THREE_HOURS = 3 * 60 * 60 * 1000;
      const orderCreatedTime = new Date(order.createdAt).getTime();
      const cancelDeadline = orderCreatedTime + THREE_HOURS;
      // Use server time (client time + offset)
      const serverTime = Date.now() + serverTimeOffset;
      const remaining = cancelDeadline - serverTime;
      setTimeRemaining(Math.max(0, remaining));
    };

    updateTimer(); // Calculate immediately
    const interval = setInterval(updateTimer, 1000); // Update every second

    return () => clearInterval(interval);
  }, [order?.createdAt, serverTimeOffset]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await cancelOrder(orderId);
      // Order is deleted from database, redirect to orders list
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 animate-pulse space-y-4">
          <div className="h-4 bg-gray-100 rounded w-24 mb-8" />
          <div className="h-8 bg-gray-100 rounded w-56 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-40" />
          <div className="h-24 bg-gray-100 rounded mt-6" />
          <div className="h-40 bg-gray-100 rounded" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white pt-32 flex flex-col items-center gap-6 px-4">
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
          {error || 'Order not found.'}
        </p>
        <Link
          to="/orders"
          className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // ── Derive values ──────────────────────────────────────────────────────────

  const id = (order._id || order.id || orderId).toString();
  const displayId = id.toUpperCase().slice(-10);
  const items = order.items || order.orderItems || [];
  const address = order.shippingAddress || {};
  const status = order.orderStatus || order.status || 'pending';
  const isCOD = order.paymentMethod === 'cod' || !order.paymentMethod;

  // Use live timer state
  const canCancelByTime = timeRemaining > 0;
  const canCancel = ['pending', 'processing'].includes(status) && canCancelByTime;
  const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));
  const minutesRemaining = Math.ceil((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

  return (
    <div className="bg-white pt-24 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Back link */}
        <Link
          to="/orders"
          className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-8"
        >
          ← Back to Orders
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                Order Details
              </h1>
              <p className="text-sm font-mono font-bold text-gray-500 mt-1">#{displayId}</p>
            </div>
            {order.createdAt && (
              <p className="text-xs text-gray-400 text-right">
                Placed on<br />
                <span className="font-bold text-gray-600">{formatDate(order.createdAt)}</span>
              </p>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <StatusTimeline status={status} />

        {/* Cancel Order Button / Cancellation Window Info */}
        {['pending', 'processing'].includes(status) && (
          <div className="mb-6">
            {canCancelByTime ? (
              <>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={cancelling}
                  className="w-full sm:w-auto px-6 py-3 bg-red-50 border-2 border-red-200 text-red-700 font-bold text-xs uppercase tracking-widest hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  You can cancel this order within{' '}
                  <span className="font-bold text-red-600">
                    {hoursRemaining > 0 ? `${hoursRemaining}h` : `${minutesRemaining}m`}
                  </span>
                </p>
              </>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium">
                <p>❌ Cancellation window has expired</p>
                <p className="text-[11px] mt-1 text-yellow-600">Orders can only be cancelled within 3 hours of placement.</p>
              </div>
            )}
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">
                  Cancel Order?
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to cancel this order? This action cannot be undone. Stock will be restored immediately.
              </p>
              {error && (
                <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 border border-red-200">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tracking info (shown if backend provides it) */}
        {order.trackingNumber && (
          <div className="border border-gray-100 p-5 mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-2 flex items-center gap-2">
              <TruckIcon className="h-4 w-4 text-gray-500" />
              Tracking
            </h2>
            <p className="text-sm font-mono font-bold text-gray-800">{order.trackingNumber}</p>
            {order.courier && (
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{order.courier}</p>
            )}
          </div>
        )}

        {/* Items */}
        {items.length > 0 && (
          <div className="border border-gray-100 mb-6">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
                Items Ordered ({items.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item, i) => (
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
                      {sanitizeHtml(item.name)}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.size && item.size !== 'default' && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-gray-200 text-gray-500">
                          {sanitizeHtml(item.size)}
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

        {/* Delivery Address */}
        {(address.name || address.address || address.phone) && (
          <div className="border border-gray-100 mb-6 p-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-3 flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gray-500" />
              Delivery Address
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              {address.name && <p className="font-bold text-gray-900">{sanitizeHtml(address.name)}</p>}
              {address.phone && (
                <p className="flex items-center gap-1.5">
                  <PhoneIcon className="h-3.5 w-3.5 text-gray-400" />
                  {sanitizeHtml(address.phone)}
                </p>
              )}
              {address.address && <p>{sanitizeHtml(address.address)}</p>}
              {address.city && <p className="capitalize">{sanitizeHtml(address.city)}</p>}
              {address.zoneLabel && (
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">
                  {sanitizeHtml(address.zoneLabel)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="border-2 border-gray-900 p-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4">
            Price Breakdown
          </h2>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">{formatPrice(order.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery ({address.zoneLabel || '—'})</span>
              <span className="font-bold text-gray-900">{formatPrice(order.deliveryCharge || 0)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span>
                <span className="font-bold">−{formatPrice(order.discountAmount)}</span>
              </div>
            )}
          </div>
          <div className="border-t-2 border-gray-900 pt-4 flex justify-between items-center">
            <span className="text-sm font-black uppercase tracking-widest text-gray-900">Total</span>
            <span className="text-2xl font-black text-gray-900">{formatPrice(order.total || 0)}</span>
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

      </div>
    </div>
  );
}
