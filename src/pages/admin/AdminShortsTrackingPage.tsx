// src/pages/admin/AdminShortsTrackingPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_SHORTS_QUERY, UPDATE_SHORT_STATUS_MUTATION } from '@/lib/graphql';
import { Short, ShortStatus, ShortFilterInput } from '@/types/graphql';
import { useToast } from '@/context/toast-context';
import { getAuthToken } from '@/lib/apollo-client';
import SpinLoader from '@/components/SpinLoader';
import {
  VideoPlay,
  SearchNormal,
  Filter,
  User,
  TickCircle,
  CloseCircle,
  Play,
  Eye,
  Send2,
  DocumentText,
  DocumentDownload
} from 'iconsax-react';
import { format, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminShortsTrackingPage: React.FC = () => {
  const { success, error } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShortStatus | 'ALL'>('ALL');
  const [selectedShort, setSelectedShort] = useState<Short | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [deleteFileOnReject, setDeleteFileOnReject] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);

  // Build filter for assigned/in-progress/completed shorts
  const filter: ShortFilterInput = useMemo(() => {
    const f: ShortFilterInput = {};

    if (statusFilter !== 'ALL') {
      f.status = statusFilter;
    } else {
      // By default, show only assigned, in-progress, and completed shorts
      // Not rolled/retained/rejected
    }

    return f;
  }, [statusFilter]);

  // Fetch shorts
  const { data, loading, refetch } = useQuery<{ shorts: Short[] }>(GET_SHORTS_QUERY, {
    variables: { filter },
  });

  // Update short status mutation
  const [updateShortStatus, { loading: updateLoading }] = useMutation(UPDATE_SHORT_STATUS_MUTATION, {
    onCompleted: () => {
      success('Statut mis à jour avec succès');
      refetch();
      setModalOpen(false);
      setSelectedShort(null);
      setAdminFeedback('');
      // Cleanup video URL
      if (videoUrl) {
        window.URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
      }
    },
    onError: (err) => {
      error(err.message || 'Erreur lors de la mise à jour du statut');
    },
  });


  // Filter shorts by search and only show assigned/in-progress/completed/rejected
  const filteredShorts = useMemo(() => {
    const shorts: Short[] = data?.shorts || [];

    let filtered = shorts.filter(s =>
      s.status === ShortStatus.ASSIGNED ||
      s.status === ShortStatus.IN_PROGRESS ||
      s.status === ShortStatus.COMPLETED ||
      s.status === ShortStatus.VALIDATED ||
      s.status === ShortStatus.PUBLISHED ||
      s.status === ShortStatus.REJECTED
    );

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (short) =>
          short.title?.toLowerCase().includes(query) ||
          short.sourceChannel.channelName.toLowerCase().includes(query) ||
          short.assignedTo?.username.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [data?.shorts, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: filteredShorts.length,
      assigned: filteredShorts.filter((s) => s.status === ShortStatus.ASSIGNED).length,
      inProgress: filteredShorts.filter((s) => s.status === ShortStatus.IN_PROGRESS).length,
      completed: filteredShorts.filter((s) => s.status === ShortStatus.COMPLETED).length,
      validated: filteredShorts.filter((s) => s.status === ShortStatus.VALIDATED).length,
      published: filteredShorts.filter((s) => s.status === ShortStatus.PUBLISHED).length,
      rejected: filteredShorts.filter((s) => s.status === ShortStatus.REJECTED).length,
    };
  }, [filteredShorts]);

  const handleViewDetails = (short: Short) => {
    // Cleanup previous video URL
    if (videoUrl) {
      window.URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setSelectedShort(short);
    setModalOpen(true);
  };

  const handleValidate = (short: Short) => {
    // Cleanup previous video URL
    if (videoUrl) {
      window.URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setSelectedShort(short);
    setModalOpen(true);
  };

  const handleConfirmValidate = () => {
    if (!selectedShort) return;

    updateShortStatus({
      variables: {
        input: {
          shortId: selectedShort.id,
          status: ShortStatus.VALIDATED,
          adminFeedback: adminFeedback.trim() || undefined,
        },
      },
    });
  };

  const handlePublish = () => {
    if (!selectedShort) return;

    updateShortStatus({
      variables: {
        input: {
          shortId: selectedShort.id,
          status: ShortStatus.PUBLISHED,
        },
      },
    });
  };

  const handleReject = (short: Short) => {
    setSelectedShort(short);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedShort) return;
    if (!rejectReason.trim()) {
      error('Raison requise', 'Veuillez indiquer la raison du rejet');
      return;
    }

    updateShortStatus({
      variables: {
        input: {
          shortId: selectedShort.id,
          status: ShortStatus.REJECTED,
          adminFeedback: rejectReason.trim(),
          deleteFile: deleteFileOnReject,
        },
      },
    });
    setRejectModalOpen(false);
    setRejectReason('');
    setDeleteFileOnReject(false);
  };

  // Charger la vidéo pour la prévisualisation
  useEffect(() => {
    if (videoPreviewOpen && selectedShort?.driveFileId) {
      setLoadingVideo(true);
      const token = getAuthToken();

      if (!token) {
        setLoadingVideo(false);
        return;
      }

      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/drive/download/${selectedShort.id}`;

      fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          setVideoUrl(blobUrl);
          setLoadingVideo(false);
        })
        .catch(() => {
          error('Erreur lors du chargement de la vidéo');
          setLoadingVideo(false);
        });

      // Cleanup
      return () => {
        if (videoUrl) {
          window.URL.revokeObjectURL(videoUrl);
          setVideoUrl(null);
        }
      };
    }
  }, [videoPreviewOpen, selectedShort]);

  const handleDownloadVideo = (shortId: string, fileName?: string) => {
    const token = getAuthToken();
    if (!token) {
      error('Non authentifié');
      return;
    }

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/drive/download/${shortId}`;

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName || 'video.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        error('Erreur lors du téléchargement');
      });
  };

  const getStatusConfig = (status: ShortStatus) => {
    switch (status) {
      case ShortStatus.ASSIGNED:
        return {
          label: 'Assigné',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case ShortStatus.IN_PROGRESS:
        return {
          label: 'En cours',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case ShortStatus.COMPLETED:
        return {
          label: 'Terminé',
          color: 'bg-green-100 text-green-800 border-green-200',
        };
      case ShortStatus.VALIDATED:
        return {
          label: 'Validé',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case ShortStatus.REJECTED:
        return {
          label: 'Rejeté',
          color: 'bg-red-100 text-red-800 border-red-200',
        };
      case ShortStatus.PUBLISHED:
        return {
          label: 'Publié',
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Suivi des Shorts</h1>
            <p className="text-purple-100 text-lg">
              Suivez l'avancement des shorts assignés et validez les travaux terminés
            </p>
          </div>
          <div className="hidden md:block">
            <VideoPlay size={64} color="white" className="opacity-20" variant="Bold" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total</span>
            <VideoPlay size={20} color="#8B5CF6" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Assignés</span>
            <User size={20} color="#3B82F6" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">En cours</span>
            <Play size={20} color="#F59E0B" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Terminés</span>
            <TickCircle size={20} color="#10B981" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Validés</span>
            <TickCircle size={20} color="#8B5CF6" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.validated}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Rejetés</span>
            <CloseCircle size={20} color="#EF4444" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Publiés</span>
            <Send2 size={20} color="#6366F1" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{stats.published}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} color="#374151" variant="Bold" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchNormal
              size={20}
              color="#6B7280"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, chaîne ou vidéaste..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ShortStatus | 'ALL')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="ALL">Tous les statuts</option>
              <option value={ShortStatus.ASSIGNED}>Assignés</option>
              <option value={ShortStatus.IN_PROGRESS}>En cours</option>
              <option value={ShortStatus.COMPLETED}>Terminés (à valider)</option>
              <option value={ShortStatus.VALIDATED}>Validés</option>
              <option value={ShortStatus.REJECTED}>Rejetés</option>
              <option value={ShortStatus.PUBLISHED}>Publiés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shorts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <SpinLoader />
        </div>
      ) : filteredShorts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <VideoPlay size={32} color="#9CA3AF" variant="Bulk" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun short trouvé</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Aucun short ne correspond aux filtres sélectionnés'
              : 'Aucun short assigné pour le moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredShorts.map((short) => {
            const statusConfig = getStatusConfig(short.status);

            // Statuts où le travail est terminé (pas besoin d'afficher deadline)
            const completedStatuses = [ShortStatus.COMPLETED, ShortStatus.VALIDATED, ShortStatus.PUBLISHED];
            const isCompleted = completedStatuses.includes(short.status);
            const isLate = short.deadline && !isCompleted ? isPast(new Date(short.deadline)) : false;

            return (
              <div
                key={short.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6"
              >
                <div className="flex items-start gap-6">
                  {/* Thumbnail */}
                  <div className="w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={`https://img.youtube.com/vi/${short.videoId}/mqdefault.jpg`}
                      alt={short.title || 'Short thumbnail'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {short.title || 'Titre non disponible'}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>Source: {short.sourceChannel.channelName}</span>
                          {short.targetChannel && (
                            <>
                              <span>•</span>
                              <span>Publication: {short.targetChannel.channelName}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        {isLate && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            <CloseCircle size={14} color="#B91C1C" variant="Bold" />
                            En retard
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vidéaste</p>
                        <p className="text-sm font-medium text-gray-900">
                          {short.assignedTo?.username || 'Non assigné'}
                        </p>
                      </div>
                      {/* Afficher la deadline seulement si le short n'est pas terminé */}
                      {short.deadline && !isCompleted && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Deadline</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(short.deadline), 'dd MMM yyyy HH:mm', { locale: fr })}
                          </p>
                        </div>
                      )}
                      {short.completedAt && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Terminé le</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(short.completedAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                          </p>
                        </div>
                      )}
                    </div>

                    {short.notes && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Notes:</p>
                        <p className="text-sm text-blue-800">{short.notes}</p>
                      </div>
                    )}

                    {/* Admin Feedback for rejected shorts */}
                    {short.status === ShortStatus.REJECTED && short.adminFeedback && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs font-semibold text-red-900 mb-1">Raison du rejet:</p>
                        <p className="text-sm text-red-800">{short.adminFeedback}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(short)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Eye size={18} color="#374151" variant="Bold" />
                        <span>Voir détails</span>
                      </button>

                      {short.status === ShortStatus.COMPLETED && (
                        <>
                          <button
                            onClick={() => handleValidate(short)}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md"
                          >
                            <TickCircle size={18} color="white" variant="Bold" />
                            <span>Valider</span>
                          </button>
                          <button
                            onClick={() => handleReject(short)}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md"
                          >
                            <CloseCircle size={18} color="white" variant="Bold" />
                            <span>Rejeter</span>
                          </button>
                        </>
                      )}

                      {short.status === ShortStatus.VALIDATED && (
                        <button
                          onClick={() => {
                            setSelectedShort(short);
                            handlePublish();
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md"
                        >
                          <Send2 size={18} color="white" variant="Bold" />
                          <span>Publier</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Validation Modal */}
      {modalOpen && selectedShort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-lg p-2">
                    <TickCircle size={24} color="white" variant="Bold" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Valider le Short</h2>
                    <p className="text-green-100 text-sm mt-1">
                      Vérifiez le travail et validez pour publication
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedShort(null);
                    setAdminFeedback('');
                    // Cleanup video URL
                    if (videoUrl) {
                      window.URL.revokeObjectURL(videoUrl);
                      setVideoUrl(null);
                    }
                  }}
                  disabled={updateLoading}
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
                  src={`https://www.youtube.com/embed/${selectedShort.videoId}`}
                  title={selectedShort.title || 'Short video'}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <DocumentText size={18} color="#374151" variant="Bold" />
                    <span>Feedback (optionnel)</span>
                  </div>
                </label>
                <textarea
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Ajoutez vos commentaires ou suggestions..."
                  disabled={updateLoading}
                />
              </div>

              {/* Uploaded Video Section */}
              {selectedShort.driveFileId && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-green-900 mb-1">
                        <TickCircle size={16} color="#15803D" variant="Bold" />
                        <span>Vidéo uploadée par le vidéaste</span>
                      </div>
                      {selectedShort.fileName && (
                        <p className="text-xs text-green-700 ml-5">
                          {selectedShort.fileName}
                          {selectedShort.fileSize && ` • ${(selectedShort.fileSize / 1024 / 1024).toFixed(2)} MB`}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVideoPreviewOpen(true)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} color="white" variant="Bold" />
                        <span>Voir la vidéo</span>
                      </button>
                      <button
                        onClick={() => handleDownloadVideo(selectedShort.id, selectedShort.fileName)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <DocumentDownload size={16} color="white" variant="Bold" />
                        <span>Télécharger</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedShort(null);
                    setAdminFeedback('');
                    // Cleanup video URL
                    if (videoUrl) {
                      window.URL.revokeObjectURL(videoUrl);
                      setVideoUrl(null);
                    }
                  }}
                  disabled={updateLoading}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmValidate}
                  disabled={updateLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {updateLoading ? (
                    <>
                      <SpinLoader />
                      <span>Validation...</span>
                    </>
                  ) : (
                    <>
                      <TickCircle size={20} color="white" variant="Bold" />
                      <span>Valider le short</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedShort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-lg p-2">
                    <CloseCircle size={24} color="white" variant="Bold" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Rejeter le Short</h2>
                    <p className="text-red-100 text-sm mt-1">
                      Indiquez la raison du rejet au vidéaste
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setSelectedShort(null);
                    setRejectReason('');
                  }}
                  disabled={updateLoading}
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
                  src={`https://www.youtube.com/embed/${selectedShort.videoId}`}
                  title={selectedShort.title || 'Short video'}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Short Info */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {selectedShort.title || 'Titre non disponible'}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Vidéaste: {selectedShort.assignedTo?.username}</span>
                  <span>•</span>
                  <span>Source: {selectedShort.sourceChannel.channelName}</span>
                </div>
              </div>

              {/* Reject Reason (Required) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <DocumentText size={18} color="#374151" variant="Bold" />
                    <span>Raison du rejet <span className="text-red-600">*</span></span>
                  </div>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Expliquez pourquoi ce short est rejeté (ex: qualité insuffisante, contenu inapproprié, etc.)..."
                  disabled={updateLoading}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cette raison sera envoyée au vidéaste par notification
                </p>
              </div>

              {/* Delete File Option */}
              {selectedShort.driveFileId && (
                <div className="flex items-center gap-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <input
                    type="checkbox"
                    id="deleteFile"
                    checked={deleteFileOnReject}
                    onChange={(e) => setDeleteFileOnReject(e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <label htmlFor="deleteFile" className="text-sm text-gray-700 cursor-pointer">
                    Supprimer également le fichier vidéo du Drive
                  </label>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setSelectedShort(null);
                    setRejectReason('');
                  }}
                  disabled={updateLoading}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={updateLoading || !rejectReason.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {updateLoading ? (
                    <>
                      <SpinLoader />
                      <span>Rejet...</span>
                    </>
                  ) : (
                    <>
                      <CloseCircle size={20} color="white" variant="Bold" />
                      <span>Confirmer le rejet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {videoPreviewOpen && selectedShort && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-lg p-2">
                    <Eye size={24} color="white" variant="Bold" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Prévisualisation de la vidéo</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Vidéo uploadée par le vidéaste
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setVideoPreviewOpen(false);
                    // Cleanup video URL
                    if (videoUrl) {
                      window.URL.revokeObjectURL(videoUrl);
                      setVideoUrl(null);
                    }
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <CloseCircle size={24} color="white" variant="Bold" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                {loadingVideo ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <SpinLoader />
                      <p className="text-white mt-4">Chargement de la vidéo...</p>
                    </div>
                  </div>
                ) : videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                    controlsList="nodownload"
                  >
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-white">Impossible de charger la vidéo</p>
                  </div>
                )}
              </div>

              {/* File Information */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DocumentText size={20} color="#374151" variant="Bold" />
                  Informations du fichier
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedShort.fileName && (
                    <div>
                      <p className="text-gray-500 mb-1">Nom du fichier</p>
                      <p className="font-medium text-gray-900">{selectedShort.fileName}</p>
                    </div>
                  )}
                  {selectedShort.fileSize && (
                    <div>
                      <p className="text-gray-500 mb-1">Taille</p>
                      <p className="font-medium text-gray-900">
                        {(selectedShort.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  {selectedShort.mimeType && (
                    <div>
                      <p className="text-gray-500 mb-1">Type</p>
                      <p className="font-medium text-gray-900">{selectedShort.mimeType}</p>
                    </div>
                  )}
                  {selectedShort.uploadedAt && (
                    <div>
                      <p className="text-gray-500 mb-1">Date d'upload</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(selectedShort.uploadedAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Short Information */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {selectedShort.title || 'Titre non disponible'}
                </h3>
                <div className="flex items-center gap-4 text-sm text-blue-700">
                  <span>Vidéaste: {selectedShort.assignedTo?.username}</span>
                  <span>•</span>
                  <span>Source: {selectedShort.sourceChannel.channelName}</span>
                  {selectedShort.targetChannel && (
                    <>
                      <span>•</span>
                      <span>Publication: {selectedShort.targetChannel.channelName}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadVideo(selectedShort.id, selectedShort.fileName)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <DocumentDownload size={20} color="white" variant="Bold" />
                  <span>Télécharger la vidéo</span>
                </button>
                <button
                  onClick={() => {
                    setVideoPreviewOpen(false);
                    // Cleanup video URL
                    if (videoUrl) {
                      window.URL.revokeObjectURL(videoUrl);
                      setVideoUrl(null);
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShortsTrackingPage;
