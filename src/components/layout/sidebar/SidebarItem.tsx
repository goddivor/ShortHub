// src/components/layout/sidebar/SidebarItem.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import type { MenuItemConfig } from '@/config/menu';
import type { RoleTheme } from '@/config/theme';
import { sidebarStyles } from '@/config/theme';

interface SidebarItemProps {
  item: MenuItemConfig;
  theme: RoleTheme;
  onNavigate?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  theme,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (() => {
    // Handle dashboard paths specially (both /admin and /admin/dashboard should match)
    if (item.path.endsWith('/dashboard')) {
      const baseRoute = item.path.replace('/dashboard', '');
      return location.pathname === baseRoute || location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  })();

  const handleClick = () => {
    navigate(item.path);
    onNavigate?.();
  };

  const IconComponent = item.icon;

  return (
    <button
      onClick={handleClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
        transition-all duration-200 relative group
        ${isActive
          ? 'bg-white/15 text-white'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full ${theme.bgPrimary}`}
        />
      )}

      {/* Icon */}
      <div className={`
        flex-shrink-0 p-1.5 rounded-md transition-colors
        ${isActive ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/15'}
      `}>
        <IconComponent
          size={sidebarStyles.iconSize}
          color={isActive ? theme.primary : '#9CA3AF'}
        />
      </div>

      {/* Label and description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.label}</p>
        {item.description && (
          <p className="text-xs text-gray-400 truncate">{item.description}</p>
        )}
      </div>
    </button>
  );
};

export default SidebarItem;
