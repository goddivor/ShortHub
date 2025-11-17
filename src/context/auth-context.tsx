// src/context/auth-context.tsx
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { LOGIN_MUTATION, ME_QUERY } from '@/lib/graphql';
import { setAuthToken, setRefreshToken, clearAuthTokens, isAuthenticated } from '@/lib/apollo-client';
import type { User, AuthPayload } from '@/types/graphql';

// Navigation callback for logout
let authNavigationCallback: ((path: string) => void) | null = null;

// eslint-disable-next-line react-refresh/only-export-components
export const setAuthNavigationCallback = (callback: (path: string) => void) => {
  authNavigationCallback = callback;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Query to get current user
  const { data: meData, loading: meLoading, refetch: refetchMe, error: meError } = useQuery<{ me: User }>(ME_QUERY, {
    skip: !isAuthenticated(),
  });

  // Login mutation
  const [loginMutation, { loading: loginLoading }] = useMutation<{ login: AuthPayload }>(LOGIN_MUTATION);

  // Handle ME query results
  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me);
      localStorage.setItem('user', JSON.stringify(meData.me));
    }
  }, [meData]);

  // Handle ME query errors - only logout if user was previously authenticated
  useEffect(() => {
    if (meError && user) {
      console.error('Failed to fetch user:', meError);
      // Clear invalid session
      clearAuthTokens();
      setUser(null);
      localStorage.removeItem('user');
    }
  }, [meError, user]);

  useEffect(() => {
    // Try to load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser && isAuthenticated()) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        clearAuthTokens();
        localStorage.removeItem('user');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { username, password },
      });

      // Check if login was successful
      if (!data?.login) {
        throw new Error('Identifiants incorrects');
      }

      const authData: AuthPayload = data.login;

      // Store tokens
      setAuthToken(authData.token);
      setRefreshToken(authData.refreshToken);

      // Store user
      setUser(authData.user);
      localStorage.setItem('user', JSON.stringify(authData.user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    clearAuthTokens();
    setUser(null);
    localStorage.removeItem('user');

    // Use navigation callback if available, otherwise fallback to window.location
    if (authNavigationCallback) {
      authNavigationCallback('/login');
    } else {
      window.location.href = '/login';
    }
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
