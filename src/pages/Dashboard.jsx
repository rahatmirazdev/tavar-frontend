import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UserDashboard from './UserDashboard';
import StaffDashboard from './StaffDashboard';
import AdminDashboard from './admin/AdminDashboard';

/**
 * Main Dashboard component
 * Routes to appropriate dashboard based on user role
 * - admin → AdminDashboard
 * - staff → StaffDashboard  
 * - user → UserDashboard
 */
export default function Dashboard() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;

  // Route based on role
  if (role === 'admin') {
    return (
      <div className="pt-24 pb-20 px-4 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <AdminDashboard />
        </div>
      </div>
    );
  }

  if (role === 'staff') {
    return (
      <div className="pt-24 pb-20 px-4 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <StaffDashboard />
        </div>
      </div>
    );
  }

  // Default to user dashboard for 'user' role
  return <UserDashboard />;
}
