// src/hooks/useAdminChannels.ts
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_ADMIN_CHANNELS_QUERY,
  GET_ADMIN_CHANNEL_QUERY,
  GET_ADMIN_CHANNEL_STATS_QUERY,
  CREATE_ADMIN_CHANNEL_MUTATION,
  UPDATE_ADMIN_CHANNEL_MUTATION,
  DELETE_ADMIN_CHANNEL_MUTATION,
} from '@/lib/graphql';
import type {
  AdminChannel,
  AdminChannelStats,
  CreateAdminChannelInput,
  UpdateAdminChannelInput,
} from '@/types/graphql';

// Hook to get all admin channels
export const useAdminChannels = () => {
  const { data, loading, error, refetch } = useQuery<{
    adminChannels: AdminChannel[];
  }>(GET_ADMIN_CHANNELS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    adminChannels: data?.adminChannels || [],
    loading,
    error,
    refetch,
  };
};

// Hook to get a single admin channel by ID
export const useAdminChannel = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{
    adminChannel: AdminChannel;
  }>(GET_ADMIN_CHANNEL_QUERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  return {
    adminChannel: data?.adminChannel || null,
    loading,
    error,
    refetch,
  };
};

// Hook to get admin channel stats
export const useAdminChannelStats = (channelId: string) => {
  const { data, loading, error, refetch } = useQuery<{
    adminChannelStats: AdminChannelStats;
  }>(GET_ADMIN_CHANNEL_STATS_QUERY, {
    variables: { channelId },
    skip: !channelId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    stats: data?.adminChannelStats || null,
    loading,
    error,
    refetch,
  };
};

// Hook to create an admin channel
export const useCreateAdminChannel = () => {
  const [createAdminChannelMutation, { loading, error }] = useMutation<
    { createAdminChannel: AdminChannel },
    { input: CreateAdminChannelInput }
  >(CREATE_ADMIN_CHANNEL_MUTATION, {
    refetchQueries: [{ query: GET_ADMIN_CHANNELS_QUERY }],
  });

  const createAdminChannel = async (input: CreateAdminChannelInput) => {
    const { data } = await createAdminChannelMutation({ variables: { input } });
    return data?.createAdminChannel;
  };

  return {
    createAdminChannel,
    loading,
    error,
  };
};

// Hook to update an admin channel
export const useUpdateAdminChannel = () => {
  const [updateAdminChannelMutation, { loading, error }] = useMutation<
    { updateAdminChannel: AdminChannel },
    { id: string; input: UpdateAdminChannelInput }
  >(UPDATE_ADMIN_CHANNEL_MUTATION);

  const updateAdminChannel = async (
    id: string,
    input: UpdateAdminChannelInput
  ) => {
    const { data } = await updateAdminChannelMutation({
      variables: { id, input },
    });
    return data?.updateAdminChannel;
  };

  return {
    updateAdminChannel,
    loading,
    error,
  };
};

// Hook to delete an admin channel
export const useDeleteAdminChannel = () => {
  const [deleteAdminChannelMutation, { loading, error }] = useMutation<
    { deleteAdminChannel: boolean },
    { id: string }
  >(DELETE_ADMIN_CHANNEL_MUTATION, {
    refetchQueries: [{ query: GET_ADMIN_CHANNELS_QUERY }],
  });

  const deleteAdminChannel = async (id: string) => {
    const { data } = await deleteAdminChannelMutation({ variables: { id } });
    return data?.deleteAdminChannel;
  };

  return {
    deleteAdminChannel,
    loading,
    error,
  };
};

// Utility function to format subscriber count
export const formatSubscriberCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};
