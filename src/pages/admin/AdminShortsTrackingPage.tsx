// src/pages/admin/AdminShortsTrackingPage.tsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_SHORTS_QUERY, UPDATE_SHORT_STATUS_MUTATION, CREATE_SHORT_COMMENT_MUTATION } from '@/lib/graphql';
import { Short, ShortStatus, ShortFilterInput } from '@/types/graphql';
import { useToast } from '@/context/toast-context';
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
  MessageText,
  Send
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
  const [comment, setComment] = useState('');

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
      setComment('');
    },
    onError: (err) => {
      error(err.message || 'Erreur lors de la mise à jour du statut');
    },
  });

  // Create comment mutation
  const [createComment, { loading: submittingComment }] = useMutation(
    CREATE_SHORT_COMMENT_MUTATION,
    {
      onCompleted: () => {
        success('Commentaire ajouté');
        setComment('');
        refetch();
      },
      onError: (err) => {
        error('Erreur', err.message || 'Impossible d\'ajouter le commentaire');
      },
    }
  );

  // Filter shorts by search and only show assigned/in-progress/completed
  const filteredShorts = useMemo(() => {
    const shorts: Short[] = data?.shorts || [];

    let filtered = shorts.filter(s =>
      s.status === ShortStatus.ASSIGNED ||
      s.status === ShortStatus.IN_PROGRESS ||
      s.status === ShortStatus.COMPLETED ||
      s.status === ShortStatus.VALIDATED ||
      s.status === ShortStatus.PUBLISHED
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
    };
  }, [filteredShorts]);

  const handleViewDetails = (short: Short) => {
    setSelectedShort(short);
    setModalOpen(true);
  };

  const handleValidate = (short: Short) => {
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
        },
      },
    });
    setRejectModalOpen(false);
    setRejectReason('');
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedShort) return;

    try {
      await createComment({
        variables: {
          input: {
            shortId: selectedShort.id,
            comment: comment.trim(),
          },
        },
      });
    } catch {
      // L'erreur est déjà gérée dans le onError de la mutation
    }
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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
            const isLate = short.deadline ? isPast(new Date(short.deadline)) && short.status !== ShortStatus.COMPLETED : false;

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
                      {short.deadline && (
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
                    setComment('');
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

              {/* Comments Section */}
              {selectedShort.comments && selectedShort.comments.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    <MessageText size={16} color="#111827" variant="Bold" />
                    <span>Commentaires ({selectedShort.comments.length})</span>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {selectedShort.comments.map((c) => (
                      <div key={c.id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900">{c.author.username}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(c.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Comment */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                  <MessageText size={16} color="#111827" variant="Bold" />
                  <span>Ajouter un commentaire</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Votre commentaire..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && !submittingComment && handleAddComment()}
                    disabled={submittingComment}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!comment.trim() || submittingComment}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {submittingComment ? (
                      <>
                        <SpinLoader />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} color="white" variant="Bold" />
                        <span>Envoyer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedShort(null);
                    setAdminFeedback('');
                    setComment('');
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
    </div>
  );
};

export default AdminShortsTrackingPage;
