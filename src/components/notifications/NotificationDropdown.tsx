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
import { Notification, Refresh, TickCircle } from 'iconsax-react';

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
    pollInterval: 30000, // Rafraîchir toutes les 30 secondes
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
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Notification size={20} color="#374151" variant="Bold" />
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Actualiser"
              >
                <Refresh
                  size={18}
                  color="#6B7280"
                  className={loading ? 'animate-spin' : ''}
                />
              </button>

              {/* Mark all as read */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Tout marquer comme lu"
                >
                  <TickCircle size={18} color="#10B981" variant="Bold" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUnreadOnly(false)}
              className={`
                px-3 py-1.5 text-sm rounded-lg transition-colors
                ${
                  !showUnreadOnly
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              Toutes
            </button>
            <button
              onClick={() => setShowUnreadOnly(true)}
              className={`
                px-3 py-1.5 text-sm rounded-lg transition-colors
                ${
                  showUnreadOnly
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Notification size={32} color="#9CA3AF" variant="Bulk" />
              </div>
              <p className="text-gray-500 text-sm">
                {showUnreadOnly
                  ? 'Aucune notification non lue'
                  : 'Aucune notification'}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onClick={() => {
                  // TODO: Navigate to related short if applicable
                  onClose();
                }}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 text-center">
            <button
              onClick={onClose}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;
