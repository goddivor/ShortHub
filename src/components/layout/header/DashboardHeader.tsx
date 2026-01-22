// src/components/layout/header/DashboardHeader.tsx
import React from 'react';
import { useLocation } from 'react-router';
import { HambergerMenu } from 'iconsax-react';
import type { MenuGroupConfig } from '@/config/menu';

interface DashboardHeaderProps {
  menuGroups: MenuGroupConfig[];
  onMenuClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  menuGroups,
  onMenuClick,
}) => {
  const location = useLocation();

  // Find current page title from menu configuration
  const getCurrentPageTitle = (): string => {
    for (const group of menuGroups) {
      for (const item of group.items) {
        // Handle dashboard paths specially
        if (item.path.endsWith('/dashboard')) {
          const baseRoute = item.path.replace('/dashboard', '');
          if (location.pathname === baseRoute || location.pathname === item.path) {
            return item.label;
          }
        } else if (location.pathname.startsWith(item.path)) {
          return item.label;
        }
      }
    }
    return 'Dashboard';
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <HambergerMenu size={22} color="#6B7280" />
          </button>

          {/* Page title */}
          <h1 className="text-lg font-semibold text-gray-900">
            {getCurrentPageTitle()}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
