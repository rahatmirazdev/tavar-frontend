import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import * as adminService from '../services/adminService';
import * as productService from '../services/productService';
import {
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  UsersIcon,
  TicketIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const CARDS = [
  {
    label: 'Orders',
    desc: 'View and manage customer orders',
    href: '/admin/orders',
    Icon: ClipboardDocumentListIcon,
    bg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    border: 'border-yellow-100',
  },
  {
    label: 'Products',
    desc: 'View product catalog',
    href: '/admin/products',
    Icon: ArchiveBoxIcon,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    border: 'border-blue-100',
  },
  {
    label: 'Customers',
    desc: 'Browse customer accounts',
    href: '/admin/customers',
    Icon: UsersIcon,
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
    border: 'border-green-100',
  },
  {
    label: 'Coupons',
    desc: 'View discount coupons',
    href: '/admin/coupons',
    Icon: TicketIcon,
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    border: 'border-purple-100',
  },
];

export default function StaffDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all orders
        const ordersRes = await adminService.getAllOrders();
        const orders = ordersRes || [];

        // Fetch all products
        const productsRes = await productService.getAllProducts();
        const products = productsRes.data || [];

        // Calculate stats
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;

        // Get recent orders
        const sortedOrders = [...orders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setStats({
          totalOrders: orders.length,
          totalProducts: products.length,
          totalRevenue: totalRevenue,
          pendingOrders: pendingOrders,
        });
        setRecentOrders(sortedOrders);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
          Staff Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-xl">
          Welcome, <span className="font-bold">{user?.name}</span>. Manage orders, products, and customer information.
        </p>
      </div>

      {/* Role Badge */}
      <div className="inline-block px-4 py-2 bg-amber-50 border-2 border-amber-200 rounded-none">
        <p className="text-xs font-black uppercase tracking-widest text-amber-700">
          Role: <span className="text-amber-900">Staff</span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Orders */}
          <div className="border-2 border-yellow-100 bg-yellow-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-1">
                  Total Orders
                </p>
                <p className="text-3xl font-black text-gray-900">{stats.totalOrders}</p>
              </div>
              <ClipboardDocumentListIcon className="h-10 w-10 text-yellow-600" />
            </div>
            <Link
              to="/admin/orders"
              className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-yellow-600 hover:text-yellow-800"
            >
              View All →
            </Link>
          </div>

          {/* Total Products */}
          <div className="border-2 border-blue-100 bg-blue-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-1">
                  Total Products
                </p>
                <p className="text-3xl font-black text-gray-900">{stats.totalProducts}</p>
              </div>
              <ArchiveBoxIcon className="h-10 w-10 text-blue-600" />
            </div>
            <Link
              to="/admin/products"
              className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800"
            >
              View Catalog →
            </Link>
          </div>

          {/* Total Revenue */}
          <div className="border-2 border-green-100 bg-green-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-black text-gray-900">
                  ৳{stats.totalRevenue.toFixed(0)}
                </p>
              </div>
              <CurrencyDollarIcon className="h-10 w-10 text-green-600" />
            </div>
            <p className="mt-4 text-xs text-gray-500">From {stats.totalOrders} orders</p>
          </div>

          {/* Pending Orders */}
          <div className="border-2 border-orange-100 bg-orange-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-1">
                  Pending Orders
                </p>
                <p className="text-3xl font-black text-gray-900">{stats.pendingOrders}</p>
              </div>
              <ExclamationTriangleIcon className="h-10 w-10 text-orange-600" />
            </div>
            <Link
              to="/admin/orders"
              className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-orange-600 hover:text-orange-800"
            >
              Process Now →
            </Link>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {!loading && recentOrders.length > 0 && (
        <div className="border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between text-sm bg-gray-50 p-4 border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900">Order #{order._id?.slice(-6)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">৳{order.totalAmount?.toFixed(0)}</p>
                  <span
                    className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                      order.orderStatus === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.orderStatus === 'shipped'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Management Sections */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">
          Management Sections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CARDS.map(({ label, desc, href, Icon, bg, iconColor, border }) => (
            <Link
              key={label}
              to={href}
              className={`group flex flex-col gap-4 p-6 border-2 ${border} ${bg} hover:border-gray-900 hover:bg-white transition-all duration-200`}
            >
              <div
                className={`w-12 h-12 rounded-none ${bg} border ${border} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <Icon className={`h-6 w-6 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-gray-900 mb-1">
                  {label}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
              <span className="mt-auto text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                View {label} →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Info section */}
      <div className="p-6 bg-amber-50 border-2 border-amber-200">
        <p className="text-sm text-amber-900">
          <span className="font-bold">Note:</span> As a staff member, you have access to manage
          orders, view products, customer information, and coupons. Contact your admin for
          additional permissions.
        </p>
      </div>
    </div>
  );
}
