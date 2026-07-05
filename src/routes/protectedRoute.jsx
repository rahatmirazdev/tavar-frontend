import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RouteTitleManager from '../components/RouteTitleManager';

const resolveRole = (user) => {
  const role = user?.role;
  if (!role) return null;
  if (typeof role === 'string') return role;
  if (typeof role === 'object' && role.name) return role.name;
  return null;
};

/**
 * RequireAuth — wraps routes that require any authenticated user.
 * Redirects to /login if not logged in.
 */
export function RequireAuth() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? (
    <>
      <RouteTitleManager />
      <Outlet />
    </>
  ) : <Navigate to="/login" replace />;
}

/**
 * ProtectedRoute — wraps admin/staff-only routes.
 *
 * Behaviour:
 *  - Not authenticated  →  redirect to /login
 *  - Authenticated but role is neither 'admin' nor 'staff'  →  redirect to /
 *  - admin or staff  →  render children via <Outlet>
 */
export function ProtectedRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = resolveRole(user);
  if (role !== 'admin' && role !== 'staff') return <Navigate to="/dashboard" replace />;

  return (
    <>
      <RouteTitleManager />
      <Outlet />
    </>
  );
}

/**
 * AdminOnlyRoute — wraps admin-only routes (more restrictive)
 *
 * Behaviour:
 *  - Not authenticated  →  redirect to /login
 *  - Authenticated but role is not 'admin'  →  redirect to /dashboard
 *  - admin  →  render children via <Outlet>
 */
export function AdminOnlyRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = resolveRole(user);
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <>
      <RouteTitleManager />
      <Outlet />
    </>
  );
}

/**
 * StaffRoute — wraps staff-only routes
 *
 * Behaviour:
 *  - Not authenticated  →  redirect to /login
 *  - Authenticated but role is not 'staff'  →  redirect to /dashboard
 *  - staff  →  render children via <Outlet>
 */
export function StaffRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = resolveRole(user);
  if (role !== 'staff') return <Navigate to="/dashboard" replace />;

  return (
    <>
      <RouteTitleManager />
      <Outlet />
    </>
  );
}

/**
 * UserRoute — wraps user-only routes (excludes admin/staff)
 *
 * Behaviour:
 *  - Not authenticated  →  redirect to /login
 *  - Authenticated but role is 'admin' or 'staff'  →  redirect to /dashboard
 *  - user  →  render children via <Outlet>
 */
export function UserRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = resolveRole(user);
  if (role === 'admin' || role === 'staff') return <Navigate to="/dashboard" replace />;

  return (
    <>
      <RouteTitleManager />
      <Outlet />
    </>
  );
}

// Alias kept for backward compatibility
export { ProtectedRoute as RequireAdmin };
