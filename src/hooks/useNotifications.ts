// src/hooks/useNotifications.ts
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import {
  GET_NOTIFICATIONS_QUERY,
  GET_UNREAD_NOTIFICATIONS_COUNT_QUERY,
  MARK_NOTIFICATION_AS_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION,
  NOTIFICATION_RECEIVED_SUBSCRIPTION,
} from '@/lib/graphql';
import type {
  Notification,
  NotificationsConnection,
} from '@/types/graphql';

// Hook to get notifications
export const useNotifications = (options?: {
  first?: number;
  after?: string;
  unreadOnly?: boolean;
}) => {
  const { data, loading, error, refetch, fetchMore } = useQuery<{
    notifications: NotificationsConnection;
  }>(GET_NOTIFICATIONS_QUERY, {
    variables: {
      first: options?.first || 20,
      after: options?.after,
      unreadOnly: options?.unreadOnly,
    },
    fetchPolicy: 'cache-and-network',
  });

  const notifications = data?.notifications.edges.map((edge) => edge.node) || [];
  const pageInfo = data?.notifications.pageInfo;
  const totalCount = data?.notifications.totalCount || 0;

  const loadMore = () => {
    if (pageInfo?.hasNextPage && pageInfo.endCursor) {
      fetchMore({
        variables: {
          after: pageInfo.endCursor,
        },
      });
    }
  };

  return {
    notifications,
    loading,
    error,
    refetch,
    loadMore,
    hasMore: pageInfo?.hasNextPage || false,
    totalCount,
  };
};

// Hook to get unread notifications count
export const useUnreadNotificationsCount = () => {
  const { data, loading, error, refetch } = useQuery<{
    unreadNotificationsCount: number;
  }>(GET_UNREAD_NOTIFICATIONS_COUNT_QUERY, {
    pollInterval: 30000, // Poll every 30 seconds
    fetchPolicy: 'cache-and-network',
  });

  return {
    count: data?.unreadNotificationsCount || 0,
    loading,
    error,
    refetch,
  };
};

// Hook to mark a notification as read
export const useMarkNotificationAsRead = () => {
  const [markAsReadMutation, { loading, error }] = useMutation<
    { markNotificationAsRead: Notification },
    { id: string }
  >(MARK_NOTIFICATION_AS_READ_MUTATION, {
    refetchQueries: [
      GET_NOTIFICATIONS_QUERY,
      GET_UNREAD_NOTIFICATIONS_COUNT_QUERY,
    ],
  });

  const markAsRead = async (id: string) => {
    const { data } = await markAsReadMutation({ variables: { id } });
    return data?.markNotificationAsRead;
  };

  return {
    markAsRead,
    loading,
    error,
  };
};

// Hook to mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const [markAllAsReadMutation, { loading, error }] = useMutation<{
    markAllNotificationsAsRead: boolean;
  }>(MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION, {
    refetchQueries: [
      GET_NOTIFICATIONS_QUERY,
      GET_UNREAD_NOTIFICATIONS_COUNT_QUERY,
    ],
  });

  const markAllAsRead = async () => {
    const { data } = await markAllAsReadMutation();
    return data?.markAllNotificationsAsRead;
  };

  return {
    markAllAsRead,
    loading,
    error,
  };
};

// Hook to subscribe to real-time notifications
export const useNotificationSubscription = (userId: string) => {
  const { data, loading, error } = useSubscription<{
    notificationReceived: Notification;
  }>(NOTIFICATION_RECEIVED_SUBSCRIPTION, {
    variables: { userId },
    skip: !userId,
  });

  return {
    notification: data?.notificationReceived || null,
    loading,
    error,
  };
};

// Utility functions for notifications
export const getNotificationIcon = (type: string): string => {
  const icons: Record<string, string> = {
    VIDEO_ASSIGNED: '📹',
    DEADLINE_REMINDER: '⏰',
    VIDEO_COMPLETED: '✅',
    VIDEO_VALIDATED: '🎉',
    VIDEO_REJECTED: '❌',
    ACCOUNT_BLOCKED: '🚫',
    ACCOUNT_UNBLOCKED: '✅',
  };
  return icons[type] || '📬';
};

export const getNotificationColor = (type: string): string => {
  const colors: Record<string, string> = {
    VIDEO_ASSIGNED: 'bg-blue-50 border-blue-200',
    DEADLINE_REMINDER: 'bg-yellow-50 border-yellow-200',
    VIDEO_COMPLETED: 'bg-green-50 border-green-200',
    VIDEO_VALIDATED: 'bg-purple-50 border-purple-200',
    VIDEO_REJECTED: 'bg-red-50 border-red-200',
    ACCOUNT_BLOCKED: 'bg-red-50 border-red-200',
    ACCOUNT_UNBLOCKED: 'bg-green-50 border-green-200',
  };
  return colors[type] || 'bg-gray-50 border-gray-200';
};
