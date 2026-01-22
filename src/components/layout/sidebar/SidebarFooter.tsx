// src/components/layout/sidebar/SidebarFooter.tsx
import React from 'react';
import { User, Logout } from 'iconsax-react';
import type { RoleTheme } from '@/config/theme';

interface SidebarFooterProps {
  user: {
    username?: string;
    profileImage?: string;
    role?: string;
    assignedTo?: {
      username: string;
    };
  } | null;
  theme: RoleTheme;
  onLogout: () => void;
  showAssignedTo?: boolean;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  user,
  theme,
  onLogout,
  showAssignedTo = false,
}) => {
  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    VIDEASTE: 'Vidéaste',
    ASSISTANT: 'Assistant',
  };

  return (
    <div className="border-t border-white/10 bg-white/5">
      {/* Assigned to info (for assistants) */}
      {showAssignedTo && user?.assignedTo && (
        <div className="px-4 py-3 bg-white/10 border-b border-white/10">
          <p className="text-xs text-gray-400 mb-0.5">Vidéaste assigné</p>
          <p className="text-sm font-medium text-white">
            {user.assignedTo.username}
          </p>
        </div>
      )}

      {/* User info */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={20} color="#FFFFFF" />
            )}
          </div>

          {/* User details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.username || 'Utilisateur'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.role ? roleLabels[user.role] || user.role : ''}
            </p>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
            title="Déconnexion"
          >
            <Logout
              size={18}
              color={theme.primary}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarFooter;
