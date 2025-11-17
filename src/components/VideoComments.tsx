// src/components/VideoComments.tsx
import React, { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';
import SpinLoader from '@/components/SpinLoader';
import { Send, Trash, MessageText } from 'iconsax-react';
import type { VideoComment } from '@/types/graphql';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface VideoCommentsProps {
  videoId: string;
  comments: VideoComment[];
}

const VideoComments: React.FC<VideoCommentsProps> = ({ videoId, comments }) => {
  const { user } = useAuth();
  const { addComment, deleteComment, loading } = useComments(videoId);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await addComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-2">
            <MessageText size={20} color="white" variant="Bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Commentaires</h3>
            <p className="text-sm text-gray-600">{comments.length} commentaire{comments.length > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="p-8 text-center">
            <MessageText size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
            <p className="text-gray-500">Aucun commentaire pour le moment</p>
            <p className="text-sm text-gray-400 mt-1">Soyez le premier à commenter</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {comment.author.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{comment.author.username}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'PPp', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 ml-10 text-sm leading-relaxed">{comment.comment}</p>
                </div>

                {/* Delete button - only show for comment author */}
                {user?.id === comment.author.id && (
                  <Button
                    onClick={() => handleDelete(comment.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash size={16} variant="Bold" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              disabled={submitting}
            />
          </div>
          <Button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className={`
              self-end px-5 py-3 rounded-lg font-medium transition-all flex items-center gap-2
              ${!newComment.trim() || submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }
            `}
          >
            {submitting ? (
              <>
                <SpinLoader />
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <Send size={18} variant="Bold" />
                <span>Envoyer</span>
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VideoComments;
