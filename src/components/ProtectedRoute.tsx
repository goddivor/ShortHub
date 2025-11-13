// src/components/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import SpinLoader from './SpinLoader';
import { UserRole } from '@/types/graphql';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, requireRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to initialize
    if (loading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
      return;
    }

    // Check specific role requirement
    if (requireRole && user.role !== requireRole) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Check if user has any of the allowed roles
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role as UserRole)) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, allowedRoles, requireRole, navigate]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <SpinLoader />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check role restrictions
  if (requireRole && user.role !== requireRole) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
