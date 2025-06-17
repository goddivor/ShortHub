// src/components/layout/DashboardLayout.tsx
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import Logo from '@/components/ui/logo';
import Button from '@/components/Button';
import { 
  Home, 
  User, 
  VideoPlay, 
  Setting2, 
  HambergerMenu,
  CloseSquare,
  Youtube,
  Chart,
  TrendUp
} from 'iconsax-react';

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <Home color="#FF0000" size={20} className="text-red-600" />,
      description: 'Vue d\'ensemble'
    },
    {
      path: '/dashboard/add-channel',
      label: 'Ajouter Chaîne',
      icon: <User color="#FF0000" size={20} className="text-red-600" />,
      description: 'Gérer les chaînes'
    },
    {
      path: '/dashboard/roll-shorts',
      label: 'Générer Shorts',
      icon: <VideoPlay color="#FF0000" size={20} className="text-red-600" />,
      description: 'Rolling & validation'
    },
    {
      path: '/dashboard/debug',
      label: 'Debug',
      icon: <Setting2 color="#6B7280" size={20} className="text-gray-500" />,
      description: 'Tests & configuration'
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false); // Close mobile sidebar
  };

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
              <p className="text-xs text-gray-500">YouTube Shorts Manager</p>
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
                    ? 'bg-red-50 border-l-4 border-red-600 text-red-900'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-lg transition-all duration-200
                  ${isActivePath(item.path) 
                    ? 'bg-red-100' 
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

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Youtube color="#FF0000" size={16} className="text-red-600" />
                <span className="text-sm font-medium text-red-900">ShortHub Pro</span>
              </div>
              <p className="text-xs text-red-700 mb-3">
                Optimisez votre workflow YouTube Shorts
              </p>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors">
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          
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
                <CloseSquare color="#6B7280" size={20} className="text-gray-500" />
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
                      ? 'bg-red-50 border-l-4 border-red-600 text-red-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-all duration-200
                    ${isActivePath(item.path) 
                      ? 'bg-red-100' 
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
                <HambergerMenu color="#6B7280" size={20} className="text-gray-500" />
              </Button>

              {/* Page Title */}
              <div className="flex-1 lg:flex-initial">
                <h2 className="text-lg font-semibold text-gray-900">
                  {(() => {
                    const currentItem = sidebarItems.find(item => isActivePath(item.path));
                    return currentItem?.label || 'Dashboard';
                  })()}
                </h2>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-4">
                {/* Quick Stats */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Chart color="#10B981" size={16} className="text-green-600" />
                    <span>0 validés</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendUp color="#F59E0B" size={16} className="text-yellow-600" />
                    <span>0 en attente</span>
                  </div>
                </div>

                {/* User Menu Placeholder */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <User color="#FF0000" size={16} className="text-red-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
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

export default DashboardLayout;