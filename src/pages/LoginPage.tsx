// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';
import SpinLoader from '@/components/SpinLoader';
import { Lock, User as UserIcon, Eye, EyeSlash } from 'iconsax-react';
import { useToast } from '@/context/toast-context';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await login(username, password);
      showToast('Connexion réussie !', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle different error types
      const errorMessage = error.message || 'Identifiants incorrects';

      if (errorMessage.includes('credentials')) {
        showToast('Nom d\'utilisateur ou mot de passe incorrect', 'error');
      } else if (errorMessage.includes('blocked')) {
        showToast('Votre compte a été bloqué. Contactez l\'administrateur.', 'error');
      } else {
        showToast('Erreur de connexion. Veuillez réessayer.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <SpinLoader />
          <p className="mt-4 text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-600 rounded-2xl p-4 shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            ShortHub
          </h2>
          <p className="text-sm text-gray-600">
            Plateforme de gestion de YouTube Shorts
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Connexion
            </h3>
            <p className="text-sm text-gray-600">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={20} className="text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="admin"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlash size={20} className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading || !username || !password}
                className={`
                  w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium text-white
                  transition-all duration-200 shadow-lg
                  ${isLoading || !username || !password
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-xl transform hover:-translate-y-0.5'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <SpinLoader />
                    <span className="ml-2">Connexion en cours...</span>
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Comptes de démonstration :
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-semibold text-gray-700 mb-1">👑 Admin</p>
                <p className="text-gray-600">
                  <span className="font-mono">admin</span> / <span className="font-mono">admin123</span>
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-semibold text-gray-700 mb-1">🎬 Vidéaste</p>
                <p className="text-gray-600">
                  <span className="font-mono">videaste1</span> / <span className="font-mono">videaste123</span>
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-semibold text-gray-700 mb-1">🤝 Assistant</p>
                <p className="text-gray-600">
                  <span className="font-mono">assistant1</span> / <span className="font-mono">assistant123</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            ShortHub v2.0 - Gestion collaborative de YouTube Shorts
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
