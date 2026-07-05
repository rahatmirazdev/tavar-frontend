import { Outlet, NavLink, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { logout as logoutAPI } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/admin',            label: 'Dashboard', end: true },
  { to: '/admin/products',   label: 'Products' },
  { to: '/admin/orders',     label: 'Orders' },
  { to: '/admin/customers',  label: 'Customers' },
  { to: '/admin/coupons',    label: 'Coupons' },
  { to: '/admin/categories', label: 'Categories', adminOnly: true },
  { to: '/admin/staff',      label: 'Staff',      adminOnly: true },
];

/**
 * Minimal admin shell — horizontal top-bar + content area.
 * Will be replaced by a full sidebar layout in Phase 10.
 */
export default function AdminLayout() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((state) => state.auth);
  const isAdmin    = user?.role === 'admin';

  // Filter nav links based on role
  const visibleLinks = NAV_LINKS.filter((link) => !link.adminOnly || isAdmin);

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      // Even if API call fails, still clear client-side auth
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top bar */}
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <Link
          to="/admin"
          className="text-sm font-black uppercase tracking-widest hover:text-gray-300 transition-colors"
        >
          Admin Panel
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
          {visibleLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? 'text-white' : 'text-gray-400 hover:text-white transition-colors'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            ← Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden bg-gray-800 px-4 py-2 flex gap-4 overflow-x-auto text-xs font-bold uppercase tracking-widest">
        {visibleLinks.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-shrink-0 py-1 border-b-2 transition-colors ${
                isActive ? 'border-white text-white' : 'border-transparent text-gray-400'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Page content */}
      <main className="flex-1 p-6 md:p-10 max-w-screen-xl w-full mx-auto">
        <Outlet />
      </main>

    </div>
  );
}
