import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getProfile } from '../services/authService';
import * as orderService from '../services/orderService';
import * as productService from '../services/productService';
import {
  ShoppingBagIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  MapPinIcon,
  CheckCircleIcon,
  TruckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function UserDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load profile
        const profileData = await getProfile();
        setProfile(profileData);

        // Load user orders
        const ordersData = await orderService.getUserOrders();
        const userOrders = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
        setOrders(userOrders.slice(0, 5));

        // Load trending products
        const productsData = await productService.getTrendingProducts();
        const trendingProds = Array.isArray(productsData) ? productsData : productsData.products || [];
        setTrendingProducts(trendingProds.slice(0, 4));

        setError(null);
      } catch (err) {
        setError('Failed to load some dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  const QUICK_LINKS = [
    {
      label: 'My Orders',
      desc: 'Track your purchases',
      href: '/orders',
      Icon: ClipboardDocumentListIcon,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      border: 'border-blue-100',
      count: orders.length,
    },
    {
      label: 'My Wishlist',
      desc: 'Saved items for later',
      href: '/wishlist',
      Icon: HeartIcon,
      bg: 'bg-red-50',
      iconColor: 'text-red-600',
      border: 'border-red-100',
      count: wishlistItems.length,
    },
    {
      label: 'Shopping Cart',
      desc: 'Review your cart',
      href: '/cart',
      Icon: ShoppingBagIcon,
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      border: 'border-purple-100',
      count: cartItems.length,
    },
    {
      label: 'Shop Now',
      desc: 'Browse all products',
      href: '/products',
      Icon: SparklesIcon,
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
      border: 'border-green-100',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-20 sm:pt-24 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-black mb-4"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.name?.split(' ')[0] || 'Guest'}</span>! 👋
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Here's what's happening with your store today</p>
            </div>
            <div className="hidden md:block text-4xl sm:text-5xl lg:text-6xl">📊</div>
          </div>
          
          {error && (
            <div className="p-3 sm:p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-none flex items-start gap-3 text-sm sm:text-base">
              <span className="text-lg sm:text-xl flex-shrink-0">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Orders Stat Card */}
          <div className="group bg-white rounded-none sm:rounded-none p-4 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100">
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-semibold mb-1">TOTAL ORDERS</p>
                <p className="text-3xl sm:text-4xl font-black text-gray-900">{orders.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-none sm:rounded-none group-hover:scale-110 transition-transform">
                <ClipboardDocumentListIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <Link
              to="/orders"
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 group"
            >
              View Orders <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Wishlist Stat Card */}
          <div className="group bg-white rounded-none sm:rounded-none p-4 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100">
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-semibold mb-1">WISHLIST ITEMS</p>
                <p className="text-3xl sm:text-4xl font-black text-gray-900">{wishlistItems.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 rounded-none sm:rounded-none group-hover:scale-110 transition-transform">
                <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
            <Link
              to="/wishlist"
              className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-1 group"
            >
              View Wishlist <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Cart Stat Card */}
          <div className="group bg-white rounded-none sm:rounded-none p-4 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100">
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-semibold mb-1">CART ITEMS</p>
                <p className="text-3xl sm:text-4xl font-black text-gray-900">{cartItems.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-none sm:rounded-none group-hover:scale-110 transition-transform">
                <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
            <Link
              to="/cart"
              className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-semibold flex items-center gap-1 group"
            >
              Review Cart <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Account Status Card */}
          <div className="group bg-white rounded-none sm:rounded-none p-4 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100">
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-semibold mb-1">ACCOUNT STATUS</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-none animate-pulse"></div>
                  <p className="text-base sm:text-lg font-black text-green-600">ACTIVE</p>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-none sm:rounded-none group-hover:scale-110 transition-transform">
                <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'now'}</p>
          </div>
        </div>

        {/* Profile & Address Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Profile Card */}
          {profile && (
            <div className="lg:col-span-2 bg-white rounded-none sm:rounded-none p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">Profile Details</h2>
                <Link to="/orders" className="text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm whitespace-nowrap">Edit Profile →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="border-b pb-4">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Full Name</p>
                  <p className="text-gray-900 text-base sm:text-lg font-bold">{profile.name}</p>
                </div>
                <div className="border-b pb-4">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Email Address</p>
                  <p className="text-gray-900 text-base sm:text-lg font-bold break-all">{profile.email}</p>
                </div>
                <div className="border-b pb-4">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Phone Number</p>
                  <p className="text-gray-900 text-base sm:text-lg font-bold">{profile.phone || 'Not provided'}</p>
                </div>
                <div className="border-b pb-4">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Account Type</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-none text-xs sm:text-sm font-bold uppercase">
                      {profile.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Address Card */}
          {profile?.address && (
            <div className="bg-white rounded-none sm:rounded-none p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                <h2 className="text-lg sm:text-2xl font-black text-gray-900">Delivery Address</h2>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {profile.address.street && <p className="text-gray-700 font-semibold text-sm sm:text-base">{profile.address.street}</p>}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  {profile.address.city && <p className="text-gray-600 text-sm sm:text-base">{profile.address.city}</p>}
                  {profile.address.district && <p className="text-gray-600 text-sm sm:text-base">{profile.address.district}</p>}
                </div>
                {profile.address.zipcode && <p className="text-gray-600 text-sm sm:text-base">Zipcode: <span className="font-semibold">{profile.address.zipcode}</span></p>}
                {!profile.address.street && <p className="text-gray-400 italic text-sm sm:text-base">No address set yet</p>}
              </div>
              <button className="mt-4 sm:mt-6 w-full py-2 border-2 border-gray-200 rounded-none text-gray-900 font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base\">
                Update Address
              </button>
            </div>
          )}
        </div>

        {/* Recent Orders Section */}
        {!loading && orders.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Recent Orders</h2>
              <Link to="/orders" className="text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm whitespace-nowrap">View All Orders →</Link>
            </div>
            <div className="bg-white rounded-none sm:rounded-none shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {orders.map((order, index) => (
                  <Link
                    key={order._id}
                    to={`/order-details/${order._id}`}
                    className="block p-3 sm:p-4 lg:p-6 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-gray-500 text-xs sm:text-sm font-semibold">Order</span>
                          <p className="font-black text-gray-900 text-base sm:text-lg">#{order._id?.slice(-6).toUpperCase()}</p>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-right">
                          <p className="text-gray-500 text-xs font-semibold mb-1 lg:block hidden">TOTAL</p>
                          <p className="font-black text-gray-900 text-base sm:text-lg">৳{order.totalAmount?.toFixed(0)}</p>
                        </div>
                        
                        <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-none font-semibold text-xs sm:text-sm whitespace-nowrap ${
                          order.orderStatus === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.orderStatus === 'shipped'
                            ? 'bg-blue-100 text-blue-700'
                            : order.orderStatus === 'processing'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {order.orderStatus === 'delivered' && <CheckCircleIcon className="h-4 w-4" />}
                          {order.orderStatus === 'shipped' && <TruckIcon className="h-4 w-4" />}
                          <span className="uppercase">{order.orderStatus}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {QUICK_LINKS.map(({ label, desc, href, Icon, bg, iconColor, border, count }) => (
              <Link
                key={label}
                to={href}
                className="group relative bg-white rounded-none sm:rounded-none p-4 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${
                  label.includes('Orders') ? 'bg-blue-600' :
                  label.includes('Wishlist') ? 'bg-red-600' :
                  label.includes('Cart') ? 'bg-purple-600' :
                  'bg-green-600'
                }`}></div>
                
                {count !== undefined && count > 0 && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-black rounded-none w-5 h-5 flex items-center justify-center text-xs">
                    {count}
                  </span>
                )}
                
                <div className="relative z-10">
                  <div className={`inline-block p-2 sm:p-3 rounded-none sm:rounded-none mb-3 sm:mb-4 ${bg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
                  </div>
                  <h3 className="text-gray-900 font-black text-base sm:text-lg mb-1">{label}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">{desc}</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                    <span>{label.includes('Shop') ? 'Browse' : 'Go'}</span>
                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Trending Products */}
        {!loading && trendingProducts.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Trending For You</h2>
              <Link to="/products" className="text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm whitespace-nowrap">Explore All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {trendingProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="group bg-white rounded-none sm:rounded-none overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                >
                  <div className="relative overflow-hidden bg-gray-100 h-40 sm:h-48">
                    {product.images && product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    {product.badge && (
                      <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-600 text-white text-xs font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-none">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-gray-900 font-bold text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3">
                      {product.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 font-black text-base sm:text-lg">৳{product.price}</p>
                      {product.rating && (
                        <span className="flex items-center gap-1 text-xs font-semibold">
                          <span className="text-yellow-500">★</span>
                          <span className="text-gray-700">{product.rating.toFixed(1)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
