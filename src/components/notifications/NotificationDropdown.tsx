// src/components/notifications/NotificationDropdown.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_NOTIFICATIONS_QUERY,
  GET_UNREAD_NOTIFICATIONS_COUNT_QUERY,
  MARK_NOTIFICATION_AS_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION,
} from '@/lib/graphql';
import { Notification as NotificationType } from '@/types/graphql';
import NotificationItem from './NotificationItem';
import SpinLoader from '@/components/SpinLoader';
import { Notification, Refresh, TickCircle, CloseCircle } from 'iconsax-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Fetch notifications
  const { data, loading, refetch } = useQuery<{
    notifications: {
      edges: { node: NotificationType }[]
    }
  }>(GET_NOTIFICATIONS_QUERY, {
    variables: {
      first: 20,
      unreadOnly: showUnreadOnly,
    },
    skip: !isOpen,
  });

  // Fetch unread count
  const { data: countData } = useQuery<{ unreadNotificationsCount: number }>(GET_UNREAD_NOTIFICATIONS_COUNT_QUERY, {
    skip: !isOpen,
    pollInterval: 30000,
  });

  // Mark as read mutation
  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ_MUTATION, {
    refetchQueries: [
      GET_NOTIFICATIONS_QUERY,
      GET_UNREAD_NOTIFICATIONS_COUNT_QUERY,
    ],
  });

  // Mark all as read mutation
  const [markAllAsRead, { loading: markingAll }] = useMutation(
    MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION,
    {
      refetchQueries: [
        GET_NOTIFICATIONS_QUERY,
        GET_UNREAD_NOTIFICATIONS_COUNT_QUERY,
      ],
    }
  );

  const notifications: NotificationType[] =
    data?.notifications?.edges?.map((edge: { node: NotificationType }) => edge.node) || [];
  const unreadCount = countData?.unreadNotificationsCount || 0;

  const handleMarkAsRead = (id: string) => {
    markAsRead({ variables: { id } });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleRefresh = () => {
    refetch();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-black/20"
        onClick={onClose}
      />

      {/* Dropdown - positioned to the right of the sidebar */}
      <div className="fixed left-64 top-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[9999] max-h-[calc(100vh-32px)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Notification size={18} color="#FFFFFF" variant="Bold" />
              <h3 className="text-base font-semibold text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Actualiser"
              >
                <Refresh
                  size={16}
                  color="#FFFFFF"
                  className={loading ? 'animate-spin' : ''}
                />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Tout marquer comme lu"
                >
                  <TickCircle size={16} color="#10B981" variant="Bold" />
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Fermer"
              >
                <CloseCircle size={16} color="#FFFFFF" />
              </button>
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setShowUnreadOnly(false)}
              className={`
                px-3 py-1 text-xs font-medium rounded-full transition-colors
                ${!showUnreadOnly
                  ? 'bg-white text-gray-900'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
                }
              `}
            >
              Toutes
            </button>
            <button
              onClick={() => setShowUnreadOnly(true)}
              className={`
                px-3 py-1 text-xs font-medium rounded-full transition-colors
                ${showUnreadOnly
                  ? 'bg-white text-gray-900'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
                }
              `}
            >
              Non lues
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <SpinLoader />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-gray-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
                <Notification size={28} color="#9CA3AF" variant="Bulk" />
              </div>
              <p className="text-gray-500 text-sm">
                {showUnreadOnly
                  ? 'Aucune notification non lue'
                  : 'Aucune notification'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onClick={() => {
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
