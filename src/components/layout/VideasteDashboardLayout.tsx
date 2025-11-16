// src/components/layout/VideasteDashboardLayout.tsx
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useQuery } from '@apollo/client/react';
import Logo from '@/components/ui/logo';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { GET_UNREAD_NOTIFICATIONS_COUNT_QUERY } from '@/lib/graphql';
import {
  Home,
  User,
  VideoPlay,
  HambergerMenu,
  CloseSquare,
  Logout,
  Calendar,
  Notification,
  UserTag,
} from 'iconsax-react';

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const VideasteDashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);

  const { data: countData } = useQuery(GET_UNREAD_NOTIFICATIONS_COUNT_QUERY, {
    pollInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  const unreadCount = countData?.unreadNotificationsCount || 0;

  const sidebarItems: SidebarItem[] = [
    {
      path: '/videaste/dashboard',
      label: 'Dashboard',
      icon: <Home color="#3B82F6" size={20} />,
      description: 'Vue d\'ensemble',
    },
    {
      path: '/videaste/shorts',
      label: 'Mes Shorts',
      icon: <VideoPlay color="#3B82F6" size={20} />,
      description: 'Shorts assignés',
    },
    {
      path: '/videaste/calendar',
      label: 'Calendrier',
      icon: <Calendar color="#3B82F6" size={20} />,
      description: 'Planning & deadlines',
    },
  ];

  const isActivePath = (path: string) => {
    if (path === '/videaste/dashboard') {
      return location.pathname === '/videaste/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (userMenuOpen && !target.closest('.relative')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          {/* Sidebar Header */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <Logo />
            <div>
              <h1 className="text-xl font-bold text-gray-900">ShortHub</h1>
              <p className="text-xs text-gray-500">Vidéaste Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                  ${isActivePath(item.path)
                    ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-lg transition-all duration-200
                  ${isActivePath(item.path)
                    ? 'bg-blue-100'
                    : 'bg-gray-100'
                  }
                `}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs opacity-70">{item.description}</p>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />

          <div className="relative flex flex-col w-64 bg-white shadow-xl">
            {/* Mobile Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Logo />
                <span className="text-lg font-bold text-gray-900">ShortHub</span>
              </div>
              <Button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <CloseSquare color="#6B7280" size={20} />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${isActivePath(item.path)
                      ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-all duration-200
                    ${isActivePath(item.path)
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                    }
                  `}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs opacity-70">{item.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu Button */}
              <Button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <HambergerMenu color="#6B7280" size={20} />
              </Button>

              {/* Page Title */}
              <div className="flex-1 lg:flex-initial">
                <h2 className="text-lg font-semibold text-gray-900">
                  {(() => {
                    const currentItem = sidebarItems.find(item => isActivePath(item.path));
                    return currentItem?.label || 'Dashboard Vidéaste';
                  })()}
                </h2>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-4">
                {/* Notification Button */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Notification size={24} color="#374151" variant="Bold" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 px-1.5 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationDropdown
                    isOpen={notificationOpen}
                    onClose={() => setNotificationOpen(false)}
                  />
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User color="#3B82F6" size={16} />
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.role}</p>
                      </div>

                      <button
                        onClick={() => {
                          navigate('/videaste/profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <UserTag size={18} color="#374151" variant="Bold" />
                        <span>Profil</span>
                      </button>

                      <div className="border-t border-gray-200 my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Logout size={18} color="#DC2626" variant="Bold" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VideasteDashboardLayout;
