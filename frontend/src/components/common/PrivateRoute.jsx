import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import BaseLayout from '../layout/BaseLayout'; 

const PrivateRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Block access to admin routes for non-admin users
  // if (isAuthenticated && location.pathname.startsWith('/admin')) {
  //   const role = user?.role || (user && user.role) || null;
  //   if (role !== 'admin' && role !== 'superadmin') {
  //     return <Navigate to="/dashboard" replace />;
  //   }
  // }

  // Renders the BaseLayout wrapper, and the requested child route (e.g., DashboardPage) 
  return isAuthenticated ? (
    <BaseLayout>
      <Outlet /> 
    </BaseLayout>
  ) : (
    // If not authenticated, redirect to the login page
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;