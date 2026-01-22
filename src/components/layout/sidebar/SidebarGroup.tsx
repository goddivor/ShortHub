// src/components/layout/sidebar/SidebarGroup.tsx
import React, { useState } from 'react';
import { ArrowDown2, ArrowUp2 } from 'iconsax-react';
import type { MenuGroupConfig } from '@/config/menu';
import type { RoleTheme } from '@/config/theme';
import SidebarItem from './SidebarItem';

interface SidebarGroupProps {
  group: MenuGroupConfig;
  theme: RoleTheme;
  onNavigate?: () => void;
}

const SidebarGroup: React.FC<SidebarGroupProps> = ({
  group,
  theme,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(group.defaultOpen ?? true);

  const toggleGroup = () => {
    if (group.collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="mb-2">
      {/* Group header */}
      <button
        onClick={toggleGroup}
        disabled={!group.collapsible}
        className={`
          w-full flex items-center justify-between px-3 py-2 mb-1
          ${group.collapsible ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'}
          transition-colors rounded-md
        `}
      >
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          {group.title}
        </span>
        {group.collapsible && (
          <span>
            {isOpen ? (
              <ArrowUp2 size={14} color="rgba(255,255,255,0.6)" />
            ) : (
              <ArrowDown2 size={14} color="rgba(255,255,255,0.6)" />
            )}
          </span>
        )}
      </button>

      {/* Group items */}
      <div
        className={`
          space-y-1 overflow-hidden transition-all duration-200
          ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        {group.items.map((item) => (
          <SidebarItem
            key={item.path}
            item={item}
            theme={theme}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
};

export default SidebarGroup;
