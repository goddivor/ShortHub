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
  Filter,
  Calendar,
  TickCircle,
  CloseCircle,
  Play
} from 'iconsax-react';

const VideasteShortsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [selectedShort, setSelectedShort] = useState<Short | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShortStatus | 'ALL'>('ALL');
  const [deadlineFilter, setDeadlineFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'LATE'>('ALL');

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
      completed: shorts.filter((s) => s.status === ShortStatus.COMPLETED).length,
      late: shorts.filter((s) => {
        if (!s.deadline || s.status === ShortStatus.COMPLETED) return false;
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

  const handleCompleteShort = (short: Short) => {
    updateShortStatus({
      variables: {
        input: {
          shortId: short.id,
          status: ShortStatus.COMPLETED,
        },
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes Shorts</h1>
            <p className="text-blue-100 text-lg">
              Gérez vos shorts assignés et suivez votre progression
            </p>
          </div>
          <div className="hidden md:block">
            <VideoPlay size={64} color="white" className="opacity-20" variant="Bold" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total</span>
            <VideoPlay size={20} color="#3B82F6" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Assignés</span>
            <Calendar size={20} color="#3B82F6" variant="Bold" />
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
            <span className="text-sm font-medium text-gray-600">En retard</span>
            <CloseCircle size={20} color="#EF4444" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.late}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} color="#374151" variant="Bold" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              placeholder="Rechercher par titre ou chaîne..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ShortStatus | 'ALL')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tous les statuts</option>
              <option value={ShortStatus.ASSIGNED}>Assignés</option>
              <option value={ShortStatus.IN_PROGRESS}>En cours</option>
              <option value={ShortStatus.COMPLETED}>Terminés</option>
            </select>
          </div>

          {/* Deadline Filter */}
          <div>
            <select
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value as 'ALL' | 'TODAY' | 'WEEK' | 'LATE')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            {searchQuery || statusFilter !== 'ALL' || deadlineFilter !== 'ALL'
              ? 'Aucun short ne correspond aux filtres sélectionnés'
              : 'Aucun short ne vous a été assigné pour le moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredShorts.map((short) => (
            <ShortCard
              key={short.id}
              short={short}
              onViewDetails={handleViewDetails}
              onStart={handleStartShort}
              onComplete={handleCompleteShort}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <ShortDetailsModal
        isOpen={modalOpen}
        short={selectedShort}
        onClose={() => {
          setModalOpen(false);
          setSelectedShort(null);
        }}
        onStart={handleStartShort}
        onComplete={handleCompleteShort}
        loading={updateLoading}
      />
    </div>
  );
};

export default VideasteShortsPage;
