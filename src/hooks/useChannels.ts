// src/hooks/useChannels.ts
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_CHANNELS_QUERY,
  GET_CHANNEL_QUERY,
  CREATE_CHANNEL_MUTATION,
  UPDATE_CHANNEL_MUTATION,
  DELETE_CHANNEL_MUTATION,
  REFRESH_CHANNEL_SUBSCRIBERS_MUTATION,
} from '@/lib/graphql';
import type {
  Channel,
  ChannelsConnection,
  CreateChannelInput,
  UpdateChannelInput,
  ChannelPurpose,
  ChannelLanguage,
} from '@/types/graphql';

// Hook to get all channels with optional filters
export const useChannels = (options?: {
  first?: number;
  after?: string;
  purpose?: ChannelPurpose;
  language?: ChannelLanguage;
}) => {
  const { data, loading, error, refetch, fetchMore } = useQuery<{
    channels: ChannelsConnection;
  }>(GET_CHANNELS_QUERY, {
    variables: {
      first: options?.first || 50,
      after: options?.after,
      purpose: options?.purpose,
      language: options?.language,
    },
    fetchPolicy: 'cache-and-network',
  });

  const channels = data?.channels.edges.map((edge) => edge.node) || [];
  const pageInfo = data?.channels.pageInfo;
  const totalCount = data?.channels.totalCount || 0;

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
    channels,
    loading,
    error,
    refetch,
    loadMore,
    hasMore: pageInfo?.hasNextPage || false,
    totalCount,
  };
};

// Hook to get a single channel by ID
export const useChannel = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{ channel: Channel }>(
    GET_CHANNEL_QUERY,
    {
      variables: { id },
      skip: !id,
      fetchPolicy: 'cache-and-network',
    }
  );

  return {
    channel: data?.channel || null,
    loading,
    error,
    refetch,
  };
};

// Hook to create a channel
export const useCreateChannel = () => {
  const [createChannelMutation, { loading, error }] = useMutation<
    { createChannel: Channel },
    { input: CreateChannelInput }
  >(CREATE_CHANNEL_MUTATION, {
    refetchQueries: [{ query: GET_CHANNELS_QUERY, variables: { first: 50 } }],
  });

  const createChannel = async (input: CreateChannelInput) => {
    const { data } = await createChannelMutation({ variables: { input } });
    return data?.createChannel;
  };

  return {
    createChannel,
    loading,
    error,
  };
};

// Hook to update a channel
export const useUpdateChannel = () => {
  const [updateChannelMutation, { loading, error }] = useMutation<
    { updateChannel: Channel },
    { id: string; input: UpdateChannelInput }
  >(UPDATE_CHANNEL_MUTATION);

  const updateChannel = async (id: string, input: UpdateChannelInput) => {
    const { data } = await updateChannelMutation({ variables: { id, input } });
    return data?.updateChannel;
  };

  return {
    updateChannel,
    loading,
    error,
  };
};

// Hook to delete a channel
export const useDeleteChannel = () => {
  const [deleteChannelMutation, { loading, error }] = useMutation<
    { deleteChannel: boolean },
    { id: string }
  >(DELETE_CHANNEL_MUTATION, {
    refetchQueries: [{ query: GET_CHANNELS_QUERY, variables: { first: 50 } }],
  });

  const deleteChannel = async (id: string) => {
    const { data } = await deleteChannelMutation({ variables: { id } });
    return data?.deleteChannel;
  };

  return {
    deleteChannel,
    loading,
    error,
  };
};

// Hook to refresh channel subscribers count
export const useRefreshChannelSubscribers = () => {
  const [refreshMutation, { loading, error }] = useMutation<
    { refreshChannelSubscribers: Channel },
    { id: string }
  >(REFRESH_CHANNEL_SUBSCRIBERS_MUTATION);

  const refreshSubscribers = async (id: string) => {
    const { data } = await refreshMutation({ variables: { id } });
    return data?.refreshChannelSubscribers;
  };

  return {
    refreshSubscribers,
    loading,
    error,
  };
};

// Utility functions (moved from supabase.ts)
export const formatSubscriberCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const getChannelTypeColor = (type: string): string => {
  return type === 'MIX'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-green-100 text-green-800';
};

export const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    VF: 'bg-red-100 text-red-800',
    VOSTFR: 'bg-blue-100 text-blue-800',
    VA: 'bg-yellow-100 text-yellow-800',
    VOSTA: 'bg-purple-100 text-purple-800',
    VO: 'bg-green-100 text-green-800',
  };
  return colors[language] || 'bg-gray-100 text-gray-800';
};

export const getTypeOptions = () => [
  { value: 'MIX', label: 'Mix' },
  { value: 'ONLY', label: 'Only' },
];

export const getLanguageOptions = () => [
  { value: 'VF', label: 'VF' },
  { value: 'VOSTFR', label: 'VOSTFR' },
  { value: 'VA', label: 'VA' },
  { value: 'VOSTA', label: 'VOSTA' },
  { value: 'VO', label: 'VO' },
];

export const getCountryOptions = () => [
  { value: 'FRANCE', label: 'France' },
  { value: 'USA', label: 'USA' },
  { value: 'OTHER', label: 'Autre' },
];

export const getEditTypeOptions = () => [
  { value: 'SANS_EDIT', label: 'Sans Edit' },
  { value: 'AVEC_EDIT', label: 'Avec Edit' },
];

export const getPurposeOptions = () => [
  { value: 'SOURCE', label: 'Source' },
  { value: 'PUBLICATION', label: 'Publication' },
];
