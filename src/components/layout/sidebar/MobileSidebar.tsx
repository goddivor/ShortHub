// src/components/layout/sidebar/MobileSidebar.tsx
import React from 'react';
import { CloseSquare } from 'iconsax-react';
import type { MenuGroupConfig } from '@/config/menu';
import type { RoleTheme } from '@/config/theme';
import SidebarHeader from './SidebarHeader';
import SidebarGroup from './SidebarGroup';
import SidebarFooter from './SidebarFooter';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  panelTitle,
  menuGroups,
  theme,
  user,
  onLogout,
  showAssignedTo = false,
}) => {
  if (!isOpen) return null;

  const handleNavigate = () => {
    onClose();
  };

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <div className="relative flex flex-col w-72 max-w-[85vw] bg-[#07121e] shadow-xl animate-slide-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <CloseSquare size={24} color="#FFFFFF" />
        </button>

        {/* Header */}
        <SidebarHeader panelTitle={panelTitle} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {menuGroups.map((group) => (
            <SidebarGroup
              key={group.id}
              group={group}
              theme={theme}
              onNavigate={handleNavigate}
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
    </div>
  );
};

export default MobileSidebar;
