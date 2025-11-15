import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import BaseLayout from '../layout/BaseLayout'; 

const PrivateRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but password not changed, redirect to change password
  if (user && !user.passwordChanged) {
    if (location.pathname !== '/change-password') {
      return <Navigate to="/change-password" replace />;
    }
    // Allow access to change password page without BaseLayout
    return <Outlet />;
  }

  // Block access to admin routes for non-admin users
  if (location.pathname.startsWith('/admin')) {
    const role = user?.role || (user && user.role) || null;
    if (role !== 'admin' && role !== 'superadmin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Block access to super admin routes for non-super-admin users
  if (location.pathname.startsWith('/superadmin')) {
    const role = user?.role || (user && user.role) || null;
    if (role !== 'superadmin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Renders the BaseLayout wrapper, and the requested child route (e.g., DashboardPage)
  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  );
};

export default PrivateRoute;