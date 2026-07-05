import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  TicketIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import * as productService from '../../services/productService';
import * as adminService from '../../services/adminService';

const CARDS = [
  {
    label: 'Products',
    desc: 'Add, edit, and manage your product catalog.',
    href: '/admin/products',
    Icon: ArchiveBoxIcon,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    border: 'border-blue-100',
  },
  {
    label: 'Orders',
    desc: 'View, process, and update customer orders.',
    href: '/admin/orders',
    Icon: ClipboardDocumentListIcon,
    bg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    border: 'border-yellow-100',
  },
  {
    label: 'Customers',
    desc: 'Browse and manage customer accounts.',
    href: '/admin/customers',
    Icon: UsersIcon,
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
    border: 'border-green-100',
  },
  {
    label: 'Coupons',
    desc: 'Create, edit, and deactivate discount coupons.',
    href: '/admin/coupons',
    Icon: TicketIcon,
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    border: 'border-purple-100',
  },
  {
    label: 'Categories',
    desc: 'Create, edit, and manage product categories.',
    href: '/admin/categories',
    Icon: FolderIcon,
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    border: 'border-teal-100',
    adminOnly: true,
  },
  {
    label: 'Staff',
    desc: 'Manage admin and staff member accounts.',
    href: '/admin/staff',
    Icon: IdentificationIcon,
    bg: 'bg-red-50',
    iconColor: 'text-red-600',
    border: 'border-red-100',
    adminOnly: true,
  },
];

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const visibleCards = CARDS.filter((card) => !card.adminOnly || isAdmin);

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: [],
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all products
        const productsRes = await productService.getAllProducts();
        const products = productsRes.data || [];

        // Fetch all orders
        const ordersRes = await adminService.getAllOrders();
        const orders = ordersRes || [];

        // Calculate stats
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const lowStockProducts = products.filter((p) => p.stock <= 10);

        // Get recent items
        const sortedOrders = [...orders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        const sortedProducts = [...products]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          lowStockProducts: lowStockProducts.slice(0, 5),
        });
        setRecentOrders(sortedOrders);
        setRecentProducts(sortedProducts);
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
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-xl">
          Welcome to the control panel. Manage products, orders, customers, coupons, and staff below.
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
              Manage Products →
            </Link>
          </div>

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
              View Orders →
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

          {/* Low Stock Alert */}
          <div className="border-2 border-red-100 bg-red-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-1">
                  Low Stock
                </p>
                <p className="text-3xl font-black text-gray-900">{stats.lowStockProducts.length}</p>
              </div>
              <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
            </div>
            <p className="mt-4 text-xs text-gray-500">Products ≤ 10 units</p>
          </div>
        </div>
      )}

      {/* Low Stock Products Alert */}
      {!loading && stats.lowStockProducts.length > 0 && (
        <div className="border-2 border-orange-200 bg-orange-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">
              Low Stock Alert
            </h2>
          </div>
          <div className="space-y-2">
            {stats.lowStockProducts.map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between text-sm bg-white p-3 border border-orange-100"
              >
                <span className="font-medium text-gray-900">{product.name}</span>
                <span className="font-bold text-orange-600">{product.stock} units</span>
              </div>
            ))}
          </div>
          <Link
            to="/admin/products"
            className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-orange-600 hover:text-orange-800"
          >
            Update Stock →
          </Link>
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

      {/* Recent Products */}
      {!loading && recentProducts.length > 0 && (
        <div className="border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">
              Recent Products
            </h2>
            <Link
              to="/admin/products"
              className="text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentProducts.map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between text-sm bg-gray-50 p-4 border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 object-cover border border-gray-200"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      Stock: {product.stock} | Category: {product.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">৳{product.price}</p>
                  {product.stock <= 10 && (
                    <span className="text-xs font-bold text-red-600">LOW STOCK</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick-access Management Cards */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">
          Management Sections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCards.map(({ label, desc, href, Icon, bg, iconColor, border }) => (
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
                Manage {label} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
