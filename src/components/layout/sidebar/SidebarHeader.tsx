// src/components/layout/sidebar/SidebarHeader.tsx
import React, { useState } from 'react';
import { Notification } from 'iconsax-react';
import { useQuery } from '@apollo/client/react';
import { GET_UNREAD_NOTIFICATIONS_COUNT_QUERY } from '@/lib/graphql';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import Logo from '@/components/ui/logo';

interface SidebarHeaderProps {
  panelTitle: string;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ panelTitle }) => {
  const [notificationOpen, setNotificationOpen] = useState(false);

  const { data: countData } = useQuery<{ unreadNotificationsCount: number }>(
    GET_UNREAD_NOTIFICATIONS_COUNT_QUERY,
    { pollInterval: 30000 }
  );

  const unreadCount = countData?.unreadNotificationsCount || 0;

  return (
    <div className="flex items-center justify-between px-4 py-5">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <Logo />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-white">ShortHub</h1>
          <p className="text-xs text-white/70">{panelTitle}</p>
        </div>
      </div>

      {/* Notification */}
      <div className="relative">
        <button
          onClick={() => setNotificationOpen(!notificationOpen)}
          className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Notification size={20} color="#FFFFFF" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        <NotificationDropdown
          isOpen={notificationOpen}
          onClose={() => setNotificationOpen(false)}
        />
      </div>
    </div>
  );
};

export default SidebarHeader;
