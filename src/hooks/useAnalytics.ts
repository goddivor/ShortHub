// src/hooks/useAnalytics.ts
import { useQuery } from '@apollo/client/react';
import {
  GET_DASHBOARD_ANALYTICS_QUERY,
  GET_CHANNEL_ANALYTICS_QUERY,
  GET_USER_ANALYTICS_QUERY,
} from '@/lib/graphql';
import type {
  DashboardAnalytics,
  ChannelStats,
  UserStats,
} from '@/types/graphql';

// Hook to get dashboard analytics (admin only)
export const useDashboardAnalytics = () => {
  const { data, loading, error, refetch } = useQuery<{
    dashboardAnalytics: DashboardAnalytics;
  }>(GET_DASHBOARD_ANALYTICS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    analytics: data?.dashboardAnalytics || null,
    loading,
    error,
    refetch,
  };
};

// Hook to get channel analytics
export const useChannelAnalytics = (channelId: string) => {
  const { data, loading, error, refetch } = useQuery<{
    channelAnalytics: ChannelStats;
  }>(GET_CHANNEL_ANALYTICS_QUERY, {
    variables: { channelId },
    skip: !channelId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    stats: data?.channelAnalytics || null,
    loading,
    error,
    refetch,
  };
};

// Hook to get user analytics
export const useUserAnalytics = (userId: string) => {
  const { data, loading, error, refetch } = useQuery<{
    userAnalytics: UserStats;
  }>(GET_USER_ANALYTICS_QUERY, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    stats: data?.userAnalytics || null,
    loading,
    error,
    refetch,
  };
};
