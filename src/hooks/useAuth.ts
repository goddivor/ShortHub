// src/hooks/useAuth.ts
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router';
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
  const navigate = useNavigate();
  const { user, isAuthenticated: authenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !authenticated) {
      navigate('/login', { replace: true });
    }

    if (!loading && authenticated && user && allowedRoles) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to dashboard if user doesn't have required role
        navigate('/dashboard', { replace: true });
      }
    }
  }, [loading, authenticated, user, allowedRoles, navigate]);

  return { user, loading };
};
