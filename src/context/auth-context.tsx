// src/context/auth-context.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_MUTATION, ME_QUERY } from '@/lib/graphql';
import { setAuthToken, setRefreshToken, clearAuthTokens, isAuthenticated } from '@/lib/apollo-client';
import type { User, AuthPayload } from '@/types/graphql';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Query to get current user
  const { data: meData, loading: meLoading, refetch: refetchMe } = useQuery(ME_QUERY, {
    skip: !isAuthenticated(),
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
        localStorage.setItem('user', JSON.stringify(data.me));
      }
    },
    onError: (error) => {
      console.error('Failed to fetch user:', error);
      handleLogout();
    },
  });

  // Login mutation
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);

  useEffect(() => {
    // Try to load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser && isAuthenticated()) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        handleLogout();
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { username, password },
      });

      if (data?.login) {
        const authData: AuthPayload = data.login;

        // Store tokens
        setAuthToken(authData.token);
        setRefreshToken(authData.refreshToken);

        // Store user
        setUser(authData.user);
        localStorage.setItem('user', JSON.stringify(authData.user));
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    clearAuthTokens();
    setUser(null);
    window.location.href = '/';
  };

  const refetchUser = async () => {
    try {
      const { data } = await refetchMe();
      if (data?.me) {
        setUser(data.me);
        localStorage.setItem('user', JSON.stringify(data.me));
      }
    } catch (error) {
      console.error('Failed to refetch user:', error);
      handleLogout();
    }
  };

  const loading = isInitializing || meLoading || loginLoading;

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && isAuthenticated(),
    login: handleLogin,
    logout: handleLogout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
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
