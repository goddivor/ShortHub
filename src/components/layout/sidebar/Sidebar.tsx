// src/components/layout/sidebar/Sidebar.tsx
import React from 'react';
import type { MenuGroupConfig } from '@/config/menu';
import type { RoleTheme } from '@/config/theme';
import SidebarHeader from './SidebarHeader';
import SidebarGroup from './SidebarGroup';
import SidebarFooter from './SidebarFooter';

interface SidebarProps {
  panelTitle: string;
  menuGroups: MenuGroupConfig[];
  theme: RoleTheme;
  user: {
    username?: string;
    profileImage?: string;
    role?: string;
    assignedTo?: {
      username: string;
    };
  } | null;
  onLogout: () => void;
  showAssignedTo?: boolean;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  panelTitle,
  menuGroups,
  theme,
  user,
  onLogout,
  showAssignedTo = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col h-full bg-[#07121e] ${className}`}>
      {/* Header */}
      <SidebarHeader panelTitle={panelTitle} />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {menuGroups.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            theme={theme}
          />
        ))}
      </nav>

      {/* Footer */}
      <SidebarFooter
        user={user}
        theme={theme}
        onLogout={onLogout}
        showAssignedTo={showAssignedTo}
      />
    </div>
  );
};

export default Sidebar;
