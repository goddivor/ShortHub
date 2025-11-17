// src/pages/DashboardRedirectPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import SpinLoader from '@/components/SpinLoader';
import { UserRole } from '@/types/graphql';

const DashboardRedirectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Redirect based on role
    switch (user.role) {
      case UserRole.ADMIN:
        navigate('/admin/dashboard', { replace: true });
        break;
      case UserRole.VIDEASTE:
        navigate('/videaste/dashboard', { replace: true });
        break;
      case UserRole.ASSISTANT:
        navigate('/assistant/dashboard', { replace: true });
        break;
      default:
        navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <SpinLoader />
        <p className="mt-4 text-gray-600">Redirection...</p>
      </div>
    </div>
  );
};

export default DashboardRedirectPage;
