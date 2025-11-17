// src/components/notifications/NotificationItem.tsx
import React from 'react';
import { Notification, NotificationType } from '@/types/graphql';
import {
  VideoPlay,
  TickCircle,
  CloseCircle,
  UserTag,
  MessageText,
  Calendar,
  Send,
} from 'iconsax-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClick,
}) => {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SHORT_ASSIGNED:
        return <VideoPlay size={20} color="#3B82F6" variant="Bold" />;
      case NotificationType.SHORT_COMPLETED:
        return <TickCircle size={20} color="#10B981" variant="Bold" />;
      case NotificationType.SHORT_VALIDATED:
        return <TickCircle size={20} color="#10B981" variant="Bold" />;
      case NotificationType.SHORT_REJECTED:
        return <CloseCircle size={20} color="#EF4444" variant="Bold" />;
      case NotificationType.SHORT_PUBLISHED:
        return <Send size={20} color="#8B5CF6" variant="Bold" />;
      case NotificationType.SHORT_DEADLINE_REMINDER:
        return <Calendar size={20} color="#F59E0B" variant="Bold" />;
      case NotificationType.SHORT_LATE:
        return <CloseCircle size={20} color="#EF4444" variant="Bold" />;
      case NotificationType.ACCOUNT_CREATED:
        return <UserTag size={20} color="#3B82F6" variant="Bold" />;
      case NotificationType.ACCOUNT_BLOCKED:
        return <CloseCircle size={20} color="#EF4444" variant="Bold" />;
      case NotificationType.ACCOUNT_UNBLOCKED:
        return <TickCircle size={20} color="#10B981" variant="Bold" />;
      case NotificationType.SHORT_COMMENT_ADDED:
        return <MessageText size={20} color="#6366F1" variant="Bold" />;
      default:
        return <VideoPlay size={20} color="#6B7280" variant="Bold" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SHORT_ASSIGNED:
      case NotificationType.ACCOUNT_CREATED:
        return 'bg-blue-50 border-blue-200';
      case NotificationType.SHORT_COMPLETED:
      case NotificationType.SHORT_VALIDATED:
      case NotificationType.ACCOUNT_UNBLOCKED:
        return 'bg-green-50 border-green-200';
      case NotificationType.SHORT_REJECTED:
      case NotificationType.SHORT_LATE:
      case NotificationType.ACCOUNT_BLOCKED:
        return 'bg-red-50 border-red-200';
      case NotificationType.SHORT_PUBLISHED:
        return 'bg-purple-50 border-purple-200';
      case NotificationType.SHORT_DEADLINE_REMINDER:
        return 'bg-orange-50 border-orange-200';
      case NotificationType.SHORT_COMMENT_ADDED:
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50
        ${!notification.read ? 'bg-blue-50/30' : 'bg-white'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg border ${getNotificationColor(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
            {notification.message}
          </p>

          {notification.short && (
            <p className="text-xs text-gray-500 mt-1">
              {notification.short.title || notification.short.sourceChannel.channelName}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span>
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </span>

            {/* Badges pour les canaux d'envoi */}
            <div className="flex items-center gap-1">
              {notification.sentViaPlatform && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  App
                </span>
              )}
              {notification.sentViaEmail && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                  Email
                </span>
              )}
              {notification.sentViaWhatsApp && (
                <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-xs">
                  WhatsApp
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
