// src/components/layout/BaseDashboardLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import type { MenuGroupConfig } from '@/config/menu';
import type { RoleTheme, UserRole } from '@/config/theme';
import { Sidebar, MobileSidebar } from './sidebar';

interface BaseDashboardLayoutProps {
  role?: UserRole;
  panelTitle: string;
  menuGroups: MenuGroupConfig[];
  theme: RoleTheme;
  showAssignedTo?: boolean;
}

const BaseDashboardLayout: React.FC<BaseDashboardLayoutProps> = ({
  panelTitle,
  menuGroups,
  theme,
  showAssignedTo = false,
}) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-40">
        <Sidebar
          panelTitle={panelTitle}
          menuGroups={menuGroups}
          theme={theme}
          user={user}
          onLogout={logout}
          showAssignedTo={showAssignedTo}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        panelTitle={panelTitle}
        menuGroups={menuGroups}
        theme={theme}
        user={user}
        onLogout={logout}
        showAssignedTo={showAssignedTo}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen relative z-0">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white shadow-md rounded-lg"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BaseDashboardLayout;
