import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const PrivateSuperAdminRoute = ({ children }) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!authStore.isSuperAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateSuperAdminRoute;
