// src/hooks/useVideos.ts
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_VIDEOS_QUERY,
  GET_VIDEO_QUERY,
  ROLL_VIDEOS_MUTATION,
  ASSIGN_VIDEO_MUTATION,
  UPDATE_VIDEO_STATUS_MUTATION,
  DELETE_VIDEO_MUTATION,
  GET_CALENDAR_VIDEOS_QUERY,
} from '@/lib/graphql';
import type {
  Video,
  VideosConnection,
  VideoFilterInput,
  RollVideosInput,
  AssignVideoInput,
  UpdateVideoStatusInput,
} from '@/types/graphql';

// Hook to get videos with optional filters
export const useVideos = (options?: {
  first?: number;
  after?: string;
  filter?: VideoFilterInput;
}) => {
  const { data, loading, error, refetch, fetchMore } = useQuery<{
    videos: VideosConnection;
  }>(GET_VIDEOS_QUERY, {
    variables: {
      first: options?.first || 50,
      after: options?.after,
      filter: options?.filter,
    },
    fetchPolicy: 'cache-and-network',
  });

  const videos = data?.videos.edges.map((edge) => edge.node) || [];
  const pageInfo = data?.videos.pageInfo;
  const totalCount = data?.videos.totalCount || 0;

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
    videos,
    loading,
    error,
    refetch,
    loadMore,
    hasMore: pageInfo?.hasNextPage || false,
    totalCount,
  };
};

// Hook to get a single video by ID
export const useVideo = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{ video: Video }>(
    GET_VIDEO_QUERY,
    {
      variables: { id },
      skip: !id,
      fetchPolicy: 'cache-and-network',
    }
  );

  return {
    video: data?.video || null,
    loading,
    error,
    refetch,
  };
};

// Hook to get calendar videos
export const useCalendarVideos = (
  startDate: string,
  endDate: string,
  userId?: string
) => {
  const { data, loading, error, refetch } = useQuery<{
    calendarVideos: Video[];
  }>(GET_CALENDAR_VIDEOS_QUERY, {
    variables: { startDate, endDate, userId },
    fetchPolicy: 'cache-and-network',
  });

  return {
    videos: data?.calendarVideos || [],
    loading,
    error,
    refetch,
  };
};

// Hook to roll videos from channels
export const useRollVideos = () => {
  const [rollVideosMutation, { loading, error }] = useMutation<
    { rollVideos: Video[] },
    { input: RollVideosInput }
  >(ROLL_VIDEOS_MUTATION, {
    refetchQueries: [
      { query: GET_VIDEOS_QUERY, variables: { first: 50, filter: { status: 'ROLLED' } } },
    ],
  });

  const rollVideos = async (input: RollVideosInput) => {
    const { data } = await rollVideosMutation({ variables: { input } });
    return data?.rollVideos || [];
  };

  return {
    rollVideos,
    loading,
    error,
  };
};

// Hook to assign a video to a videaste
export const useAssignVideo = () => {
  const [assignVideoMutation, { loading, error }] = useMutation<
    { assignVideo: Video },
    { input: AssignVideoInput }
  >(ASSIGN_VIDEO_MUTATION, {
    refetchQueries: [{ query: GET_VIDEOS_QUERY, variables: { first: 50 } }],
  });

  const assignVideo = async (input: AssignVideoInput) => {
    const { data } = await assignVideoMutation({ variables: { input } });
    return data?.assignVideo;
  };

  return {
    assignVideo,
    loading,
    error,
  };
};

// Hook to update video status
export const useUpdateVideoStatus = () => {
  const [updateStatusMutation, { loading, error }] = useMutation<
    { updateVideoStatus: Video },
    { input: UpdateVideoStatusInput }
  >(UPDATE_VIDEO_STATUS_MUTATION);

  const updateStatus = async (input: UpdateVideoStatusInput) => {
    const { data } = await updateStatusMutation({ variables: { input } });
    return data?.updateVideoStatus;
  };

  return {
    updateStatus,
    loading,
    error,
  };
};

// Hook to delete a video
export const useDeleteVideo = () => {
  const [deleteVideoMutation, { loading, error }] = useMutation<
    { deleteVideo: boolean },
    { id: string }
  >(DELETE_VIDEO_MUTATION, {
    refetchQueries: [{ query: GET_VIDEOS_QUERY, variables: { first: 50 } }],
  });

  const deleteVideo = async (id: string) => {
    const { data } = await deleteVideoMutation({ variables: { id } });
    return data?.deleteVideo;
  };

  return {
    deleteVideo,
    loading,
    error,
  };
};

// Utility functions for video status
export const getVideoStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ROLLED: 'bg-gray-100 text-gray-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    VALIDATED: 'bg-purple-100 text-purple-800',
    PUBLISHED: 'bg-green-200 text-green-900',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getVideoStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    ROLLED: 'Rollée',
    ASSIGNED: 'Assignée',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Complétée',
    VALIDATED: 'Validée',
    PUBLISHED: 'Publiée',
    REJECTED: 'Rejetée',
  };
  return labels[status] || status;
};

export const getVideoStatusOptions = () => [
  { value: 'ROLLED', label: 'Rollée' },
  { value: 'ASSIGNED', label: 'Assignée' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'COMPLETED', label: 'Complétée' },
  { value: 'VALIDATED', label: 'Validée' },
  { value: 'PUBLISHED', label: 'Publiée' },
  { value: 'REJECTED', label: 'Rejetée' },
];

// Format date utilities
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Aujourd\'hui';
  if (diffInDays === 1) return 'Hier';
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
  if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`;
  return `Il y a ${Math.floor(diffInDays / 365)} ans`;
};
