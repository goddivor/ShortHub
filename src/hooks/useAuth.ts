// src/hooks/useAuth.ts
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/context/auth-context';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook for protected routes
export const useRequireAuth = (allowedRoles?: string[]) => {
  const { user, isAuthenticated: authenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !authenticated) {
      window.location.href = '/login';
    }

    if (!loading && authenticated && user && allowedRoles) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to dashboard if user doesn't have required role
        window.location.href = '/dashboard';
      }
    }
  }, [loading, authenticated, user, allowedRoles]);

  return { user, loading };
};
