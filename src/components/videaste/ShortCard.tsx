// src/components/videaste/ShortCard.tsx
import React, { useState } from 'react';
import { Short, ShortStatus } from '@/types/graphql';
import { getAuthToken } from '@/lib/apollo-client';
import {
  VideoPlay,
  Calendar,
  Clock,
  Youtube,
  TickCircle,
  Play,
  Eye,
  CloseCircle,
  DocumentUpload,
  DocumentDownload
} from 'iconsax-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import VideoUploadModal from './VideoUploadModal';

interface ShortCardProps {
  short: Short;
  onViewDetails: (short: Short) => void;
  onStart?: (short: Short) => void;
  onUploadSuccess?: () => void;
}

const ShortCard: React.FC<ShortCardProps> = ({
  short,
  onViewDetails,
  onStart,
  onUploadSuccess
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleDownload = () => {
    const token = getAuthToken();
    if (!token) {
      alert('Non authentifié');
      return;
    }

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/drive/download/${short.id}`;

    // Créer un lien temporaire pour télécharger
    const link = document.createElement('a');
    link.href = url;
    link.download = short.fileName || 'video.mp4';

    // Ajouter le token dans les headers via fetch puis télécharger
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('Download error:', error);
        alert('Erreur lors du téléchargement');
      });
  };

  const getStatusConfig = (status: ShortStatus) => {
    switch (status) {
      case ShortStatus.ASSIGNED:
        return {
          label: 'Assigné',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <VideoPlay size={14} color="#1E40AF" variant="Bold" />
        };
      case ShortStatus.IN_PROGRESS:
        return {
          label: 'En cours',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Play size={14} color="#B45309" variant="Bold" />
        };
      case ShortStatus.COMPLETED:
        return {
          label: 'Terminé',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <TickCircle size={14} color="#15803D" variant="Bold" />
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <VideoPlay size={14} color="#374151" variant="Bold" />
        };
    }
  };

  const statusConfig = getStatusConfig(short.status);

  // Statuts où le travail est terminé (pas besoin d'afficher deadline)
  const completedStatuses = [ShortStatus.COMPLETED, ShortStatus.VALIDATED, ShortStatus.PUBLISHED];
  const isCompleted = completedStatuses.includes(short.status);

  // Calculate days until deadline
  const daysUntilDeadline = short.deadline
    ? differenceInDays(new Date(short.deadline), new Date())
    : null;

  const isLate = short.deadline && !isCompleted ? isPast(new Date(short.deadline)) : false;

  const getDeadlineColor = () => {
    if (isLate) return 'text-red-600 bg-red-50';
    if (daysUntilDeadline !== null && daysUntilDeadline <= 2) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Header avec statut et deadline */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
            {statusConfig.icon}
            {statusConfig.label}
          </span>

          {isLate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
              <CloseCircle size={14} color="#B91C1C" variant="Bold" />
              En retard
            </span>
          )}
        </div>

        {/* Afficher la deadline seulement si le short n'est pas terminé */}
        {short.deadline && !isCompleted && (
          <div className={`flex items-center gap-2 text-xs font-medium px-2 py-1.5 rounded-lg ${getDeadlineColor()}`}>
            <Calendar size={14} variant="Bold" />
            <span>
              Deadline: {format(new Date(short.deadline), 'dd MMM yyyy à HH:mm', { locale: fr })}
              {daysUntilDeadline !== null && !isLate && (
                <span className="ml-1">
                  ({daysUntilDeadline === 0 ? "Aujourd'hui" : `${daysUntilDeadline}j restants`})
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Thumbnail & Video Info */}
        <div className="flex gap-4 mb-4">
          <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative group/thumbnail">
            <img
              src={`https://img.youtube.com/vi/${short.videoId}/mqdefault.jpg`}
              alt={short.title || 'Short thumbnail'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity flex items-center justify-center">
              <Youtube size={32} color="white" variant="Bold" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {short.title || 'Titre non disponible'}
            </h3>

            {short.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {short.description}
              </p>
            )}

            {/* Channel Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <VideoPlay size={14} color="#6B7280" variant="Bold" />
                <span className="text-gray-600 font-medium">Source:</span>
                <span className="text-gray-900">{short.sourceChannel.channelName}</span>
              </div>

              {short.targetChannel && (
                <div className="flex items-center gap-2 text-xs">
                  <Youtube size={14} color="#6B7280" variant="Bold" />
                  <span className="text-gray-600 font-medium">Publication:</span>
                  <span className="text-gray-900">{short.targetChannel.channelName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {short.notes && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-1">Notes de l'admin:</p>
            <p className="text-sm text-blue-800">{short.notes}</p>
          </div>
        )}

        {/* Admin Feedback (for completed shorts) */}
        {short.adminFeedback && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-900 mb-1">Feedback de l'admin:</p>
            <p className="text-sm text-green-800">{short.adminFeedback}</p>
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={12} color="#6B7280" />
            <span>Assigné le {format(new Date(short.assignedAt || short.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(short)}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Eye size={18} color="#374151" variant="Bold" />
            <span>Voir détails</span>
          </button>

          {short.status === ShortStatus.ASSIGNED && onStart && (
            <button
              onClick={() => onStart(short)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Play size={18} color="white" variant="Bold" />
              <span>Démarrer</span>
            </button>
          )}

          {short.status === ShortStatus.IN_PROGRESS && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <DocumentUpload size={18} color="white" variant="Bold" />
              <span>Upload vidéo</span>
            </button>
          )}

          {short.status === ShortStatus.REJECTED && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <DocumentUpload size={18} color="white" variant="Bold" />
              <span>Re-uploader</span>
            </button>
          )}

          {/* Bouton télécharger pour les shorts avec fichier uploadé */}
          {short.driveFileId && [ShortStatus.COMPLETED, ShortStatus.VALIDATED, ShortStatus.PUBLISHED, ShortStatus.REJECTED].includes(short.status) && (
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <DocumentDownload size={18} color="white" variant="Bold" />
              <span>Télécharger</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <VideoUploadModal
        short={short}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          setIsUploadModalOpen(false);
          onUploadSuccess?.();
        }}
      />
    </div>
  );
};

export default ShortCard;
