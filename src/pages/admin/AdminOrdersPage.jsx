import { useEffect, useState } from 'react';
import { getAllOrders } from '../../services/adminService';
import { updateOrderStatus } from '../../services/orderService';
import { deleteCancelledOrders } from '../../services/adminService';
import { CheckIcon, ClockIcon, TruckIcon, TrashIcon } from '@heroicons/react/24/outline';

const formatPrice = (price) => {
  if (typeof price === 'string') return price.startsWith('৳') ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString('en-IN')}`;
};

const STATUS_OPTIONS = ['pending', 'shipped', 'delivered'];

const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: ClockIcon },
    shipped: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: TruckIcon },
    delivered: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckIcon },
  };
  const { bg, text, border, icon: Icon } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase tracking-widest ${bg} ${text} border ${border} rounded`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [updateStatuses, setUpdateStatuses] = useState({});
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cancelledCount, setCancelledCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getAllOrders();
        const allOrders = Array.isArray(data) ? data : [];
        setOrders(allOrders.filter((o) => o.orderStatus !== 'cancelled'));
        setCancelledCount(allOrders.filter((o) => o.orderStatus === 'cancelled').length);
        setError(null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleStatusChange = (orderId, newStatus) => {
    setUpdateStatuses((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const newStatus = updateStatuses[orderId];
    if (!newStatus || newStatus === currentStatus) {
      return;
    }

    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update the orders list
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      // Clear the update status
      setUpdateStatuses((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Failed to update order status';
      setError(errorMsg);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteCancelledOrders = async () => {
    setDeleting(true);
    try {
      const result = await deleteCancelledOrders();
      setCancelledCount(0);
      setShowDeleteConfirm(false);
      setError(null);
      // Show success message (could use toast here)
      alert(`${result.deletedCount} cancelled order(s) permanently deleted`);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Failed to delete cancelled orders';
      setError(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
          Order Management
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Active orders: {orders.length}
          {cancelledCount > 0 && ` | Cancelled: ${cancelledCount}`}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Order ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Items
                </th>
                <th className="text-center px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Status
                </th>
                <th className="text-center px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-bold text-gray-900">{order._id.slice(-8)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {order.user?.name || order.user?.email || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-xs font-bold text-gray-900">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={order.orderStatus} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <select
                        value={updateStatuses[order._id] || order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updating === order._id}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            order._id,
                            order.orderStatus
                          )
                        }
                        disabled={
                          updating === order._id ||
                          !updateStatuses[order._id] ||
                          updateStatuses[order._id] === order.orderStatus
                        }
                        className="text-xs px-3 py-1 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === order._id ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cancelledCount > 0 && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-red-700 uppercase tracking-widest">
                Cancelled Orders
              </h3>
              <p className="text-xs text-red-600 mt-1">
                {cancelledCount} cancelled order{cancelledCount !== 1 ? 's' : ''} in database.
                Delete them to save storage space.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-red-700 transition disabled:opacity-50"
              disabled={deleting}
            >
              <TrashIcon className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete All'}
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 max-w-md w-full rounded">
            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-4">
              Delete Cancelled Orders?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              You are about to permanently delete {cancelledCount} cancelled order{cancelledCount !== 1 ? 's' : ''}
              from the database. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCancelledOrders}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
