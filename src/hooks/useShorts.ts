// src/hooks/useShorts.ts
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_SHORTS_QUERY,
  GET_SHORT_QUERY,
  ROLL_SHORT_MUTATION,
  RETAIN_SHORT_MUTATION,
  REJECT_SHORT_MUTATION,
  ASSIGN_SHORT_MUTATION,
  REASSIGN_SHORT_MUTATION,
  UPDATE_SHORT_STATUS_MUTATION,
  DELETE_SHORT_MUTATION,
  CREATE_SHORT_COMMENT_MUTATION,
  DELETE_SHORT_COMMENT_MUTATION,
} from '@/lib/graphql';
import type {
  Short,
  ShortFilterInput,
  RollShortInput,
  AssignShortInput,
  UpdateShortStatusInput,
  CreateShortCommentInput,
  ShortComment,
  ShortStatus,
} from '@/types/graphql';

// Hook to get shorts with optional filters
export const useShorts = (filter?: ShortFilterInput) => {
  const { data, loading, error, refetch } = useQuery<{ shorts: Short[] }>(
    GET_SHORTS_QUERY,
    {
      variables: { filter },
      fetchPolicy: 'cache-and-network',
    }
  );

  return {
    shorts: data?.shorts || [],
    loading,
    error,
    refetch,
  };
};

// Hook to get a single short by ID
export const useShort = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{ short: Short }>(
    GET_SHORT_QUERY,
    {
      variables: { id },
      skip: !id,
      fetchPolicy: 'cache-and-network',
    }
  );

  return {
    short: data?.short || null,
    loading,
    error,
    refetch,
  };
};

// Hook to roll a random short from a source channel
export const useRollShort = () => {
  const [rollShortMutation, { loading, error }] = useMutation<
    { rollShort: Short },
    { input: RollShortInput }
  >(ROLL_SHORT_MUTATION, {
    refetchQueries: [{ query: GET_SHORTS_QUERY }],
  });

  const rollShort = async (input: RollShortInput) => {
    const { data } = await rollShortMutation({ variables: { input } });
    return data?.rollShort;
  };

  return {
    rollShort,
    loading,
    error,
  };
};

// Hook to retain a short (prevents re-rolling)
export const useRetainShort = () => {
  const [retainShortMutation, { loading, error }] = useMutation<
    { retainShort: Short },
    { shortId: string }
  >(RETAIN_SHORT_MUTATION);

  const retainShort = async (shortId: string) => {
    const { data } = await retainShortMutation({ variables: { shortId } });
    return data?.retainShort;
  };

  return {
    retainShort,
    loading,
    error,
  };
};

// Hook to reject a short (allows re-rolling)
export const useRejectShort = () => {
  const [rejectShortMutation, { loading, error }] = useMutation<
    { rejectShort: Short },
    { shortId: string }
  >(REJECT_SHORT_MUTATION);

  const rejectShort = async (shortId: string) => {
    const { data } = await rejectShortMutation({ variables: { shortId } });
    return data?.rejectShort;
  };

  return {
    rejectShort,
    loading,
    error,
  };
};

// Hook to assign a short to a videaste
export const useAssignShort = () => {
  const [assignShortMutation, { loading, error }] = useMutation<
    { assignShort: Short },
    { input: AssignShortInput }
  >(ASSIGN_SHORT_MUTATION);

  const assignShort = async (input: AssignShortInput) => {
    const { data } = await assignShortMutation({ variables: { input } });
    return data?.assignShort;
  };

  return {
    assignShort,
    loading,
    error,
  };
};

// Hook to reassign a short to a different videaste
export const useReassignShort = () => {
  const [reassignShortMutation, { loading, error }] = useMutation<
    { reassignShort: Short },
    { shortId: string; newVideasteId: string }
  >(REASSIGN_SHORT_MUTATION);

  const reassignShort = async (shortId: string, newVideasteId: string) => {
    const { data } = await reassignShortMutation({
      variables: { shortId, newVideasteId },
    });
    return data?.reassignShort;
  };

  return {
    reassignShort,
    loading,
    error,
  };
};

// Hook to update short status
export const useUpdateShortStatus = () => {
  const [updateShortStatusMutation, { loading, error }] = useMutation<
    { updateShortStatus: Short },
    { input: UpdateShortStatusInput }
  >(UPDATE_SHORT_STATUS_MUTATION);

  const updateShortStatus = async (input: UpdateShortStatusInput) => {
    const { data } = await updateShortStatusMutation({ variables: { input } });
    return data?.updateShortStatus;
  };

  return {
    updateShortStatus,
    loading,
    error,
  };
};

// Hook to delete a short
export const useDeleteShort = () => {
  const [deleteShortMutation, { loading, error }] = useMutation<
    { deleteShort: boolean },
    { id: string }
  >(DELETE_SHORT_MUTATION, {
    refetchQueries: [{ query: GET_SHORTS_QUERY }],
  });

  const deleteShort = async (id: string) => {
    const { data } = await deleteShortMutation({ variables: { id } });
    return data?.deleteShort;
  };

  return {
    deleteShort,
    loading,
    error,
  };
};

// Hook to create a comment on a short
export const useCreateShortComment = () => {
  const [createShortCommentMutation, { loading, error }] = useMutation<
    { createShortComment: ShortComment },
    { input: CreateShortCommentInput }
  >(CREATE_SHORT_COMMENT_MUTATION);

  const createShortComment = async (input: CreateShortCommentInput) => {
    const { data } = await createShortCommentMutation({ variables: { input } });
    return data?.createShortComment;
  };

  return {
    createShortComment,
    loading,
    error,
  };
};

// Hook to delete a short comment
export const useDeleteShortComment = () => {
  const [deleteShortCommentMutation, { loading, error }] = useMutation<
    { deleteShortComment: boolean },
    { id: string }
  >(DELETE_SHORT_COMMENT_MUTATION);

  const deleteShortComment = async (id: string) => {
    const { data } = await deleteShortCommentMutation({ variables: { id } });
    return data?.deleteShortComment;
  };

  return {
    deleteShortComment,
    loading,
    error,
  };
};

// Utility functions
export const getShortStatusLabel = (status: ShortStatus): string => {
  const labels: Record<ShortStatus, string> = {
    ROLLED: 'Rollé',
    RETAINED: 'Retenu',
    REJECTED: 'Rejeté',
    ASSIGNED: 'Assigné',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminé',
    VALIDATED: 'Validé',
    PUBLISHED: 'Publié',
  };
  return labels[status];
};

export const getShortStatusColor = (status: ShortStatus): string => {
  const colors: Record<ShortStatus, string> = {
    ROLLED: 'bg-gray-100 text-gray-800',
    RETAINED: 'bg-blue-100 text-blue-800',
    REJECTED: 'bg-red-100 text-red-800',
    ASSIGNED: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-green-100 text-green-800',
    VALIDATED: 'bg-teal-100 text-teal-800',
    PUBLISHED: 'bg-purple-100 text-purple-800',
  };
  return colors[status];
};

export const getShortStatusOptions = () => [
  { value: 'ROLLED', label: 'Rollé' },
  { value: 'RETAINED', label: 'Retenu' },
  { value: 'REJECTED', label: 'Rejeté' },
  { value: 'ASSIGNED', label: 'Assigné' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'VALIDATED', label: 'Validé' },
  { value: 'PUBLISHED', label: 'Publié' },
];

// Extract YouTube video ID from URL for embedding
export const extractYouTubeVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    // /watch?v=VIDEO_ID
    if (pathname === '/watch' && searchParams.has('v')) {
      return searchParams.get('v');
    }

    // /shorts/VIDEO_ID
    if (pathname.startsWith('/shorts/')) {
      return pathname.split('/shorts/')[1].split('/')[0].split('?')[0];
    }

    // youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      return pathname.substring(1).split('/')[0].split('?')[0];
    }

    return null;
  } catch {
    return null;
  }
};
