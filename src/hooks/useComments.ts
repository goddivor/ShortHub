// src/hooks/useComments.ts
import { useMutation } from '@apollo/client/react';
import { ADD_VIDEO_COMMENT_MUTATION, DELETE_VIDEO_COMMENT_MUTATION, GET_VIDEO_QUERY } from '@/lib/graphql';
import type { VideoComment } from '@/types/graphql';

interface AddCommentResult {
  addVideoComment: VideoComment;
}

interface AddCommentVariables {
  videoId: string;
  comment: string;
}

interface DeleteCommentVariables {
  id: string;
}

export const useComments = (videoId: string) => {
  const [addCommentMutation, { loading: adding }] = useMutation<AddCommentResult, AddCommentVariables>(
    ADD_VIDEO_COMMENT_MUTATION,
    {
      refetchQueries: [
        {
          query: GET_VIDEO_QUERY,
          variables: { id: videoId },
        },
      ],
    }
  );

  const [deleteCommentMutation, { loading: deleting }] = useMutation<boolean, DeleteCommentVariables>(
    DELETE_VIDEO_COMMENT_MUTATION,
    {
      refetchQueries: [
        {
          query: GET_VIDEO_QUERY,
          variables: { id: videoId },
        },
      ],
    }
  );

  const addComment = async (comment: string) => {
    try {
      const result = await addCommentMutation({
        variables: {
          videoId,
          comment,
        },
      });
      return result.data?.addVideoComment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation({
        variables: {
          id: commentId,
        },
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  };

  return {
    addComment,
    deleteComment,
    loading: adding || deleting,
  };
};
