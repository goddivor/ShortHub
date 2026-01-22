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
        return <VideoPlay size={16} color="#3B82F6" variant="Bold" />;
      case NotificationType.SHORT_COMPLETED:
        return <TickCircle size={16} color="#10B981" variant="Bold" />;
      case NotificationType.SHORT_VALIDATED:
        return <TickCircle size={16} color="#10B981" variant="Bold" />;
      case NotificationType.SHORT_REJECTED:
        return <CloseCircle size={16} color="#EF4444" variant="Bold" />;
      case NotificationType.SHORT_PUBLISHED:
        return <Send size={16} color="#8B5CF6" variant="Bold" />;
      case NotificationType.SHORT_DEADLINE_REMINDER:
        return <Calendar size={16} color="#F59E0B" variant="Bold" />;
      case NotificationType.SHORT_LATE:
        return <CloseCircle size={16} color="#EF4444" variant="Bold" />;
      case NotificationType.ACCOUNT_CREATED:
        return <UserTag size={16} color="#3B82F6" variant="Bold" />;
      case NotificationType.ACCOUNT_BLOCKED:
        return <CloseCircle size={16} color="#EF4444" variant="Bold" />;
      case NotificationType.ACCOUNT_UNBLOCKED:
        return <TickCircle size={16} color="#10B981" variant="Bold" />;
      case NotificationType.SHORT_COMMENT_ADDED:
        return <MessageText size={16} color="#6366F1" variant="Bold" />;
      default:
        return <VideoPlay size={16} color="#6B7280" variant="Bold" />;
    }
  };

  const getNotificationBg = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SHORT_ASSIGNED:
      case NotificationType.ACCOUNT_CREATED:
        return 'bg-blue-100';
      case NotificationType.SHORT_COMPLETED:
      case NotificationType.SHORT_VALIDATED:
      case NotificationType.ACCOUNT_UNBLOCKED:
        return 'bg-green-100';
      case NotificationType.SHORT_REJECTED:
      case NotificationType.SHORT_LATE:
      case NotificationType.ACCOUNT_BLOCKED:
        return 'bg-red-100';
      case NotificationType.SHORT_PUBLISHED:
        return 'bg-purple-100';
      case NotificationType.SHORT_DEADLINE_REMINDER:
        return 'bg-orange-100';
      case NotificationType.SHORT_COMMENT_ADDED:
        return 'bg-indigo-100';
      default:
        return 'bg-gray-100';
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
        px-4 py-3 cursor-pointer transition-all hover:bg-gray-50
        ${!notification.read ? 'bg-blue-50/50' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-1.5 rounded-lg ${getNotificationBg(notification.type)} flex-shrink-0`}>
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs leading-relaxed ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
            {notification.message}
          </p>

          <p className="text-[10px] text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
        </div>

        {/* Unread indicator */}
        {!notification.read && (
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
