// src/pages/videaste/VideasteShortsPage.tsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_MY_SHORTS_QUERY, UPDATE_SHORT_STATUS_MUTATION } from '@/lib/graphql';
import { Short, ShortStatus, ShortFilterInput } from '@/types/graphql';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/toast-context';
import ShortCard from '@/components/videaste/ShortCard';
import ShortDetailsModal from '@/components/videaste/ShortDetailsModal';
import SpinLoader from '@/components/SpinLoader';
import {
  VideoPlay,
  SearchNormal,
  Calendar,
  TickCircle,
  CloseCircle,
  Play,
  Timer1
} from 'iconsax-react';

type StatusFilterType = ShortStatus | 'ALL';
type DeadlineFilterType = 'ALL' | 'TODAY' | 'WEEK' | 'LATE';

const VideasteShortsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [selectedShort, setSelectedShort] = useState<Short | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilterType>('ALL');

  // Build filter for GraphQL query
  const filter: ShortFilterInput = useMemo(() => {
    const f: ShortFilterInput = {
      assignedToId: user?.id,
    };

    if (statusFilter !== 'ALL') {
      f.status = statusFilter;
    }

    return f;
  }, [user?.id, statusFilter]);

  // Fetch shorts
  const { data, loading, refetch } = useQuery<{ shorts: Short[] }>(GET_MY_SHORTS_QUERY, {
    variables: { filter },
    skip: !user,
  });

  // Update short status mutation
  const [updateShortStatus, { loading: updateLoading }] = useMutation(UPDATE_SHORT_STATUS_MUTATION, {
    onCompleted: () => {
      success('Statut mis à jour avec succès');
      refetch();
      setModalOpen(false);
    },
    onError: (err) => {
      error(err.message || 'Erreur lors de la mise à jour du statut');
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shorts: Short[] = data?.shorts || [];

  // Filter shorts by search and deadline
  const filteredShorts = useMemo(() => {
    let filtered = [...shorts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (short) =>
          short.title?.toLowerCase().includes(query) ||
          short.sourceChannel.channelName.toLowerCase().includes(query) ||
          short.targetChannel?.channelName.toLowerCase().includes(query)
      );
    }

    // Deadline filter
    if (deadlineFilter !== 'ALL') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      filtered = filtered.filter((short) => {
        if (!short.deadline) return false;
        const deadline = new Date(short.deadline);

        switch (deadlineFilter) {
          case 'TODAY':
            return deadline >= today && deadline < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          case 'WEEK':
            return deadline >= today && deadline <= weekFromNow;
          case 'LATE':
            return deadline < now && short.status !== ShortStatus.COMPLETED;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [shorts, searchQuery, deadlineFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: shorts.length,
      assigned: shorts.filter((s) => s.status === ShortStatus.ASSIGNED).length,
      inProgress: shorts.filter((s) => s.status === ShortStatus.IN_PROGRESS).length,
      completed: shorts.filter((s) => [ShortStatus.COMPLETED, ShortStatus.VALIDATED, ShortStatus.PUBLISHED].includes(s.status)).length,
      late: shorts.filter((s) => {
        if (!s.deadline || [ShortStatus.COMPLETED, ShortStatus.VALIDATED, ShortStatus.PUBLISHED].includes(s.status)) return false;
        return new Date(s.deadline) < new Date();
      }).length,
    };
  }, [shorts]);

  const handleViewDetails = (short: Short) => {
    setSelectedShort(short);
    setModalOpen(true);
  };

  const handleStartShort = (short: Short) => {
    updateShortStatus({
      variables: {
        input: {
          shortId: short.id,
          status: ShortStatus.IN_PROGRESS,
        },
      },
    });
  };

  const handleUploadSuccess = () => {
    refetch();
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: <VideoPlay size={18} color="#3B82F6" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Assignés', value: stats.assigned, icon: <Calendar size={18} color="#6366F1" />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'En cours', value: stats.inProgress, icon: <Play size={18} color="#F59E0B" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Terminés', value: stats.completed, icon: <TickCircle size={18} color="#10B981" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'En retard', value: stats.late, icon: <CloseCircle size={18} color="#EF4444" />, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Mes Shorts</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos shorts assignés et suivez votre progression</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</span>
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  {stat.icon}
                </div>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <SearchNormal
                size={18}
                color="#9CA3AF"
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre ou chaîne..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors appearance-none cursor-pointer"
              >
                <option value="ALL">Tous les statuts</option>
                <option value={ShortStatus.ASSIGNED}>Assignés</option>
                <option value={ShortStatus.IN_PROGRESS}>En cours</option>
                <option value={ShortStatus.COMPLETED}>Terminés</option>
                <option value={ShortStatus.VALIDATED}>Validés</option>
                <option value={ShortStatus.PUBLISHED}>Publiés</option>
                <option value={ShortStatus.REJECTED}>Rejetés</option>
              </select>
            </div>

            {/* Deadline Filter */}
            <div className="md:w-48">
              <select
                value={deadlineFilter}
                onChange={(e) => setDeadlineFilter(e.target.value as DeadlineFilterType)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors appearance-none cursor-pointer"
              >
                <option value="ALL">Toutes les deadlines</option>
                <option value="TODAY">Aujourd'hui</option>
                <option value="WEEK">Cette semaine</option>
                <option value="LATE">En retard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shorts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <SpinLoader />
          </div>
        ) : filteredShorts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {deadlineFilter === 'LATE' ? (
                <Timer1 size={32} color="#9CA3AF" />
              ) : (
                <VideoPlay size={32} color="#9CA3AF" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {deadlineFilter === 'LATE' ? 'Aucun short en retard' : 'Aucun short trouvé'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'ALL' || deadlineFilter !== 'ALL'
                ? 'Aucun short ne correspond aux filtres sélectionnés. Essayez de modifier vos critères de recherche.'
                : 'Aucun short ne vous a été assigné pour le moment. Revenez plus tard !'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {filteredShorts.map((short) => (
              <ShortCard
                key={short.id}
                short={short}
                onViewDetails={handleViewDetails}
                onStart={handleStartShort}
                onUploadSuccess={handleUploadSuccess}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <ShortDetailsModal
        isOpen={modalOpen}
        short={selectedShort}
        onClose={() => {
          setModalOpen(false);
          setSelectedShort(null);
        }}
        onStart={handleStartShort}
        onUploadSuccess={handleUploadSuccess}
        loading={updateLoading}
      />
    </div>
  );
};

export default VideasteShortsPage;
