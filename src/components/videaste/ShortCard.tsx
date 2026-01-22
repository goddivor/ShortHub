// src/components/videaste/ShortCard.tsx
import React, { useState } from 'react';
import { Short, ShortStatus } from '@/types/graphql';
import { getAuthToken } from '@/lib/apollo-client';
import {
  VideoPlay,
  Clock,
  Youtube,
  TickCircle,
  Play,
  Eye,
  CloseCircle,
  DocumentUpload,
  DocumentDownload,
  Timer1,
  Danger,
  Send2,
  ArrowRight2
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

    const link = document.createElement('a');
    link.href = url;
    link.download = short.fileName || 'video.mp4';

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
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          icon: <VideoPlay size={12} color="white" />
        };
      case ShortStatus.IN_PROGRESS:
        return {
          label: 'En cours',
          bgColor: 'bg-amber-500',
          textColor: 'text-white',
          icon: <Play size={12} color="white" />
        };
      case ShortStatus.COMPLETED:
        return {
          label: 'Terminé',
          bgColor: 'bg-emerald-500',
          textColor: 'text-white',
          icon: <TickCircle size={12} color="white" />
        };
      case ShortStatus.VALIDATED:
        return {
          label: 'Validé',
          bgColor: 'bg-green-600',
          textColor: 'text-white',
          icon: <TickCircle size={12} color="white" />
        };
      case ShortStatus.PUBLISHED:
        return {
          label: 'Publié',
          bgColor: 'bg-purple-600',
          textColor: 'text-white',
          icon: <Send2 size={12} color="white" />
        };
      case ShortStatus.REJECTED:
        return {
          label: 'Rejeté',
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          icon: <CloseCircle size={12} color="white" />
        };
      default:
        return {
          label: status,
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
          icon: <VideoPlay size={12} color="white" />
        };
    }
  };

  const statusConfig = getStatusConfig(short.status);

  // Statuts où le travail est terminé
  const completedStatuses = [ShortStatus.COMPLETED, ShortStatus.VALIDATED, ShortStatus.PUBLISHED];
  const isCompleted = completedStatuses.includes(short.status);

  // Calculate days until deadline
  const daysUntilDeadline = short.deadline
    ? differenceInDays(new Date(short.deadline), new Date())
    : null;

  const isLate = short.deadline && !isCompleted ? isPast(new Date(short.deadline)) : false;

  // Déterminer l'action principale
  const getPrimaryAction = () => {
    if (short.status === ShortStatus.ASSIGNED && onStart) {
      return {
        label: 'Démarrer',
        icon: <Play size={16} color="white" />,
        onClick: () => onStart(short),
        className: 'bg-blue-600 hover:bg-blue-700 text-white'
      };
    }
    if (short.status === ShortStatus.IN_PROGRESS) {
      return {
        label: 'Upload',
        icon: <DocumentUpload size={16} color="white" />,
        onClick: () => setIsUploadModalOpen(true),
        className: 'bg-emerald-600 hover:bg-emerald-700 text-white'
      };
    }
    if (short.status === ShortStatus.REJECTED) {
      return {
        label: 'Re-upload',
        icon: <DocumentUpload size={16} color="white" />,
        onClick: () => setIsUploadModalOpen(true),
        className: 'bg-orange-600 hover:bg-orange-700 text-white'
      };
    }
    if (short.driveFileId && [ShortStatus.COMPLETED, ShortStatus.VALIDATED, ShortStatus.PUBLISHED].includes(short.status)) {
      return {
        label: 'Télécharger',
        icon: <DocumentDownload size={16} color="white" />,
        onClick: handleDownload,
        className: 'bg-purple-600 hover:bg-purple-700 text-white'
      };
    }
    return null;
  };

  const primaryAction = getPrimaryAction();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Thumbnail Section */}
      <div className="relative">
        <div className="aspect-video bg-gray-900 overflow-hidden">
          <img
            src={`https://img.youtube.com/vi/${short.videoId}/maxresdefault.jpg`}
            alt={short.title || 'Short thumbnail'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${short.videoId}/mqdefault.jpg`;
            }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor} shadow-lg`}>
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>

        {/* Late Badge */}
        {isLate && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600 text-white shadow-lg">
              <Danger size={12} color="white" />
              En retard
            </span>
          </div>
        )}

        {/* Deadline Banner */}
        {short.deadline && !isCompleted && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/70 backdrop-blur-sm">
            <div className={`flex items-center gap-2 text-xs font-medium ${isLate ? 'text-red-400' : daysUntilDeadline !== null && daysUntilDeadline <= 2 ? 'text-amber-400' : 'text-gray-300'}`}>
              <Timer1 size={14} color="currentColor" />
              <span>
                {isLate
                  ? `Deadline dépassée (${format(new Date(short.deadline), 'dd MMM', { locale: fr })})`
                  : daysUntilDeadline === 0
                    ? "Deadline aujourd'hui"
                    : `${daysUntilDeadline}j restants`
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 leading-tight">
          {short.title || 'Titre non disponible'}
        </h3>

        {/* Channels */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <VideoPlay size={14} color="#6B7280" />
            <span className="truncate max-w-[100px]">{short.sourceChannel.channelName}</span>
          </div>
          {short.targetChannel && (
            <>
              <ArrowRight2 size={12} color="#9CA3AF" />
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Youtube size={14} color="#EF4444" />
                <span className="truncate max-w-[100px]">{short.targetChannel.channelName}</span>
              </div>
            </>
          )}
        </div>

        {/* Notes (condensed) */}
        {short.notes && (
          <div className="mb-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700 line-clamp-2">
              <span className="font-medium">Note: </span>
              {short.notes}
            </p>
          </div>
        )}

        {/* Admin Feedback */}
        {short.adminFeedback && (
          <div className="mb-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-700 line-clamp-2">
              <span className="font-medium">Feedback: </span>
              {short.adminFeedback}
            </p>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Clock size={12} color="#9CA3AF" />
          <span>Assigné le {format(new Date(short.assignedAt || short.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(short)}
            className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye size={16} color="#374151" />
            Détails
          </button>

          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${primaryAction.className}`}
            >
              {primaryAction.icon}
              {primaryAction.label}
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
