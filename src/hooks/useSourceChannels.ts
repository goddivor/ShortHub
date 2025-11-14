// src/hooks/useSourceChannels.ts
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_SOURCE_CHANNELS_QUERY,
  GET_SOURCE_CHANNEL_QUERY,
  CREATE_SOURCE_CHANNEL_MUTATION,
  UPDATE_SOURCE_CHANNEL_MUTATION,
  DELETE_SOURCE_CHANNEL_MUTATION,
} from '@/lib/graphql';
import type {
  SourceChannel,
  CreateSourceChannelInput,
  UpdateSourceChannelInput,
  ContentType,
} from '@/types/graphql';

// Hook to get all source channels with optional content type filter
export const useSourceChannels = (contentType?: ContentType) => {
  const { data, loading, error, refetch } = useQuery<{
    sourceChannels: SourceChannel[];
  }>(GET_SOURCE_CHANNELS_QUERY, {
    variables: { contentType },
    fetchPolicy: 'cache-and-network',
  });

  return {
    sourceChannels: data?.sourceChannels || [],
    loading,
    error,
    refetch,
  };
};

// Hook to get a single source channel by ID
export const useSourceChannel = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{
    sourceChannel: SourceChannel;
  }>(GET_SOURCE_CHANNEL_QUERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  return {
    sourceChannel: data?.sourceChannel || null,
    loading,
    error,
    refetch,
  };
};

// Hook to create a source channel
export const useCreateSourceChannel = () => {
  const [createSourceChannelMutation, { loading, error }] = useMutation<
    { createSourceChannel: SourceChannel },
    { input: CreateSourceChannelInput }
  >(CREATE_SOURCE_CHANNEL_MUTATION, {
    refetchQueries: [{ query: GET_SOURCE_CHANNELS_QUERY }],
  });

  const createSourceChannel = async (input: CreateSourceChannelInput) => {
    const { data } = await createSourceChannelMutation({ variables: { input } });
    return data?.createSourceChannel;
  };

  return {
    createSourceChannel,
    loading,
    error,
  };
};

// Hook to update a source channel
export const useUpdateSourceChannel = () => {
  const [updateSourceChannelMutation, { loading, error }] = useMutation<
    { updateSourceChannel: SourceChannel },
    { id: string; input: UpdateSourceChannelInput }
  >(UPDATE_SOURCE_CHANNEL_MUTATION);

  const updateSourceChannel = async (
    id: string,
    input: UpdateSourceChannelInput
  ) => {
    const { data } = await updateSourceChannelMutation({
      variables: { id, input },
    });
    return data?.updateSourceChannel;
  };

  return {
    updateSourceChannel,
    loading,
    error,
  };
};

// Hook to delete a source channel
export const useDeleteSourceChannel = () => {
  const [deleteSourceChannelMutation, { loading, error }] = useMutation<
    { deleteSourceChannel: boolean },
    { id: string }
  >(DELETE_SOURCE_CHANNEL_MUTATION, {
    refetchQueries: [{ query: GET_SOURCE_CHANNELS_QUERY }],
  });

  const deleteSourceChannel = async (id: string) => {
    const { data } = await deleteSourceChannelMutation({ variables: { id } });
    return data?.deleteSourceChannel;
  };

  return {
    deleteSourceChannel,
    loading,
    error,
  };
};

// Utility functions
export const getContentTypeLabel = (contentType: ContentType): string => {
  const labels: Record<ContentType, string> = {
    VA_SANS_EDIT: 'VA Sans Edit',
    VA_AVEC_EDIT: 'VA Avec Edit',
    VF_SANS_EDIT: 'VF Sans Edit',
    VF_AVEC_EDIT: 'VF Avec Edit',
  };
  return labels[contentType];
};

export const getContentTypeColor = (contentType: ContentType): string => {
  const colors: Record<ContentType, string> = {
    VA_SANS_EDIT: 'bg-yellow-100 text-yellow-800',
    VA_AVEC_EDIT: 'bg-orange-100 text-orange-800',
    VF_SANS_EDIT: 'bg-blue-100 text-blue-800',
    VF_AVEC_EDIT: 'bg-purple-100 text-purple-800',
  };
  return colors[contentType];
};

export const getContentTypeOptions = () => [
  { value: 'VA_SANS_EDIT', label: 'VA Sans Edit' },
  { value: 'VA_AVEC_EDIT', label: 'VA Avec Edit' },
  { value: 'VF_SANS_EDIT', label: 'VF Sans Edit' },
  { value: 'VF_AVEC_EDIT', label: 'VF Avec Edit' },
];
