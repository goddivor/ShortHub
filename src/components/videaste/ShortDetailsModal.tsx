// src/components/videaste/ShortDetailsModal.tsx
import React, { useState } from 'react';
import { Short, ShortStatus } from '@/types/graphql';
import {
  CloseCircle,
  VideoPlay,
  Calendar,
  Youtube,
  User,
  Play,
  DocumentUpload,
  DocumentText,
  MessageText
} from 'iconsax-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import VideoUploadModal from './VideoUploadModal';
import SpinLoader from '../SpinLoader';

interface ShortDetailsModalProps {
  isOpen: boolean;
  short: Short | null;
  onClose: () => void;
  onStart?: (short: Short) => void;
  onUploadSuccess?: () => void;
  loading?: boolean;
}

const ShortDetailsModal: React.FC<ShortDetailsModalProps> = ({
  isOpen,
  short,
  onClose,
  onStart,
  onUploadSuccess,
  loading = false
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (!isOpen || !short) return null;

  const getStatusConfig = (status: ShortStatus) => {
    switch (status) {
      case ShortStatus.ASSIGNED:
        return {
          label: 'Assigné',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case ShortStatus.IN_PROGRESS:
        return {
          label: 'En cours',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case ShortStatus.COMPLETED:
        return {
          label: 'Terminé',
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const statusConfig = getStatusConfig(short.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <VideoPlay size={24} color="white" variant="Bold" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Détails du Short</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mt-2 ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <CloseCircle size={24} color="white" variant="Bold" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Video Preview */}
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${short.videoId}`}
              title={short.title || 'Short video'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {short.title || 'Titre non disponible'}
            </h3>
            {short.description && (
              <p className="text-gray-700 leading-relaxed">{short.description}</p>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Channel */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                <VideoPlay size={16} color="#6B7280" variant="Bold" />
                <span>Chaîne source</span>
              </div>
              <div className="flex items-center gap-3">
                {short.sourceChannel.profileImageUrl && (
                  <img
                    src={short.sourceChannel.profileImageUrl}
                    alt={short.sourceChannel.channelName}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{short.sourceChannel.channelName}</p>
                  <p className="text-xs text-gray-500">{short.sourceChannel.contentType}</p>
                </div>
              </div>
            </div>

            {/* Target Channel */}
            {short.targetChannel && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                  <Youtube size={16} color="#6B7280" variant="Bold" />
                  <span>Chaîne de publication</span>
                </div>
                <div className="flex items-center gap-3">
                  {short.targetChannel.profileImageUrl && (
                    <img
                      src={short.targetChannel.profileImageUrl}
                      alt={short.targetChannel.channelName}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{short.targetChannel.channelName}</p>
                    <p className="text-xs text-gray-500">{short.targetChannel.contentType}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Deadline */}
            {short.deadline && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                  <Calendar size={16} color="#6B7280" variant="Bold" />
                  <span>Deadline</span>
                </div>
                <p className="font-medium text-gray-900">
                  {format(new Date(short.deadline), 'PPp', { locale: fr })}
                </p>
              </div>
            )}

            {/* Assigned By */}
            {short.assignedBy && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                  <User size={16} color="#6B7280" variant="Bold" />
                  <span>Assigné par</span>
                </div>
                <p className="font-medium text-gray-900">{short.assignedBy.username}</p>
                <p className="text-xs text-gray-500">
                  Le {format(new Date(short.assignedAt || short.createdAt), 'PPp', { locale: fr })}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {short.notes && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                <DocumentText size={16} color="#1E40AF" variant="Bold" />
                <span>Notes de l'admin</span>
              </div>
              <p className="text-blue-800">{short.notes}</p>
            </div>
          )}

          {/* Admin Feedback */}
          {short.adminFeedback && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-900 mb-2">
                <MessageText size={16} color="#15803D" variant="Bold" />
                <span>Feedback de l'admin</span>
              </div>
              <p className="text-green-800">{short.adminFeedback}</p>
            </div>
          )}


          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50"
            >
              Fermer
            </button>

            {short.status === ShortStatus.ASSIGNED && onStart && (
              <button
                onClick={() => onStart(short)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <SpinLoader />
                    <span>Démarrage...</span>
                  </>
                ) : (
                  <>
                    <Play size={20} color="white" variant="Bold" />
                    <span>Démarrer</span>
                  </>
                )}
              </button>
            )}

            {short.status === ShortStatus.IN_PROGRESS && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <DocumentUpload size={20} color="white" variant="Bold" />
                <span>Upload vidéo</span>
              </button>
            )}

            {short.status === ShortStatus.REJECTED && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <DocumentUpload size={20} color="white" variant="Bold" />
                <span>Re-uploader</span>
              </button>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {short && (
          <VideoUploadModal
            short={short}
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadSuccess={() => {
              setIsUploadModalOpen(false);
              onUploadSuccess?.();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ShortDetailsModal;
