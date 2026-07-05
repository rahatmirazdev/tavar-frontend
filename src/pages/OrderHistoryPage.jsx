import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserOrders } from '../services/orderService';
import { ShoppingBagIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const formatPrice = (price) => {
  if (typeof price === 'string') return price.startsWith('৳') ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString('en-IN')}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const STATUS_STYLES = {
  pending:    'border-yellow-300 bg-yellow-50 text-yellow-700',
  processing: 'border-blue-300 bg-blue-50 text-blue-700',
  shipped:    'border-purple-300 bg-purple-50 text-purple-700',
  delivered:  'border-green-300 bg-green-50 text-green-700',
};

export default function OrderHistoryPage() {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getUserOrders()
      .then(setOrders)
      .catch(() => setError('Could not load your orders.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="h-8 bg-gray-100 rounded w-40 mb-10 animate-pulse" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-100 p-5 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-gray-100 rounded w-32" />
                  <div className="h-4 bg-gray-100 rounded w-20" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-24 mb-4" />
                <div className="flex gap-3">
                  <div className="w-14 h-[72px] bg-gray-100 rounded" />
                  <div className="w-14 h-[72px] bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-32 flex flex-col items-center gap-6 px-4">
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{error}</p>
        <Link
          to="/"
          className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24 flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBagIcon className="h-16 w-16 text-gray-200" />
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
          No Orders Yet
        </h1>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          You haven't placed any orders yet. Start shopping to see your orders here.
        </p>
        <Link
          to="/products"
          className="mt-2 inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-black uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  // ── Order list ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-white pt-34 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
              My Orders
              <span className="ml-3 text-base font-bold text-gray-400 normal-case tracking-normal">
                ({orders.length})
              </span>
            </h1>
          </div>
          {user?.name && (
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 hidden sm:block">
              {user.name}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const id = (order._id || order.id || '').toString();
            const displayId = id.toUpperCase().slice(-10);
            const status = order.orderStatus || order.status || 'pending'; // Use orderStatus first (from backend)
            const items = order.items || order.orderItems || [];
            const thumbnails = items.slice(0, 3);

            return (
              <Link
                key={id}
                to={`/orders/${id}`}
                className="block border border-gray-100 hover:border-gray-300 transition-colors p-5 group"
              >
                {/* Top row: order ID + status badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                      Order ID
                    </p>
                    <p className="text-sm font-black text-gray-900 font-mono">#{displayId}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border ${
                        STATUS_STYLES[status] || STATUS_STYLES.pending
                      }`}
                    >
                      {status}
                    </span>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors flex-shrink-0" />
                  </div>
                </div>

                {/* Bottom row: thumbnails + date/total */}
                <div className="flex items-end justify-between gap-4">
                  <div className="flex gap-2">
                    {thumbnails.map((item, i) => (
                      <div
                        key={i}
                        className="w-14 h-[72px] bg-gray-100 overflow-hidden rounded flex-shrink-0"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="w-14 h-[72px] bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-gray-500">+{items.length - 3}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400 mb-0.5">{formatDate(order.createdAt)}</p>
                    <p className="text-base font-black text-gray-900">{formatPrice(order.totalAmount || order.total || 0)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
