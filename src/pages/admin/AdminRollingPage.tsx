import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_SOURCE_CHANNELS_QUERY, GET_SHORTS_STATS_QUERY } from '@/lib/graphql';
import { SourceChannel, ContentType, Short, ShortsStats } from '@/types/graphql';
import SpinLoader from '@/components/SpinLoader';
import { VideoPlay, Play, TickCircle, Send2, TaskSquare, Chart } from 'iconsax-react';
import RollShortModal from '@/components/admin/rolling/RollShortModal';
import AssignShortModal from '@/components/admin/rolling/AssignShortModal';
import FloatingFilter from '@/components/admin/rolling/FloatingFilter';
import RandomButton from '@/components/admin/rolling/RandomButton';
import { FilterState, filterChannelsByContentType } from '@/lib/filterHelpers';

// Helper pour afficher les types abrégés
const getContentTypeShort = (contentType: ContentType): string => {
  const shorts = {
    [ContentType.VA_SANS_EDIT]: 'VA',
    [ContentType.VA_AVEC_EDIT]: 'VAE',
    [ContentType.VF_SANS_EDIT]: 'VF',
    [ContentType.VF_AVEC_EDIT]: 'VFE',
    [ContentType.VO_SANS_EDIT]: 'VO',
    [ContentType.VO_AVEC_EDIT]: 'VOE',
  };
  return shorts[contentType] || contentType;
};

// Helper pour obtenir la couleur du badge selon le type
const getContentTypeColor = (contentType: ContentType): string => {
  const colors = {
    [ContentType.VA_SANS_EDIT]: 'bg-blue-500 text-white',
    [ContentType.VA_AVEC_EDIT]: 'bg-blue-700 text-white',
    [ContentType.VF_SANS_EDIT]: 'bg-purple-500 text-white',
    [ContentType.VF_AVEC_EDIT]: 'bg-purple-700 text-white',
    [ContentType.VO_SANS_EDIT]: 'bg-green-500 text-white',
    [ContentType.VO_AVEC_EDIT]: 'bg-emerald-700 text-white',
  };
  return colors[contentType] || 'bg-gray-500 text-white';
};

export default function AdminRollingPage() {
  const [selectedChannel, setSelectedChannel] = useState<SourceChannel | null>(null);
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [retainedShort, setRetainedShort] = useState<Short | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    language: 'ALL',
    edit: 'ALL',
  });

  const { data, loading } = useQuery<{ sourceChannels: SourceChannel[] }>(
    GET_SOURCE_CHANNELS_QUERY
  );

  const { data: statsData, loading: statsLoading } = useQuery<{ shortsStats: ShortsStats }>(
    GET_SHORTS_STATS_QUERY
  );

  const handleRollShort = (channel: SourceChannel) => {
    setSelectedChannel(channel);
    setIsRollModalOpen(true);
  };

  const handleRandomSelect = (channel: SourceChannel) => {
    // Sélectionner la chaîne
    setSelectedChannel(channel);
    // Ouvrir automatiquement le modal de génération
    setIsRollModalOpen(true);
  };

  const handleShortRetained = (short: Short) => {
    setRetainedShort(short);
    setIsAssignModalOpen(true);
  };

  const handleShortAssigned = () => {
    setRetainedShort(null);
    setSelectedChannel(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <SpinLoader />
          <p className="text-gray-600 mt-4">Chargement des chaînes sources...</p>
        </div>
      </div>
    );
  }

  const sourceChannels = data?.sourceChannels || [];
  const filteredChannels = filterChannelsByContentType(sourceChannels, filters);

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 rounded-xl p-3">
            <VideoPlay size={32} color="white" variant="Bold" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Rolling & Assignation</h1>
            <p className="text-indigo-100 text-sm mt-1">
              Générez des shorts aléatoires et assignez-les aux vidéastes
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        {statsLoading ? (
          <div className="flex items-center justify-center py-4">
            <SpinLoader />
          </div>
        ) : statsData?.shortsStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Chart size={24} color="#6366F1" variant="Bold" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{statsData.shortsStats.totalRolled}</p>
              <p className="text-xs text-gray-500 mt-1">Générés</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TickCircle size={24} color="#10B981" variant="Bold" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{statsData.shortsStats.totalRetained}</p>
              <p className="text-xs text-gray-500 mt-1">Retenus</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Send2 size={24} color="#F59E0B" variant="Bold" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{statsData.shortsStats.totalAssigned}</p>
              <p className="text-xs text-gray-500 mt-1">Assignés</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TaskSquare size={24} color="#3B82F6" variant="Bold" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{statsData.shortsStats.totalInProgress}</p>
              <p className="text-xs text-gray-500 mt-1">En cours</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TickCircle size={24} color="#8B5CF6" variant="Bold" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{statsData.shortsStats.totalCompleted}</p>
              <p className="text-xs text-gray-500 mt-1">Complétés</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TickCircle size={24} color="#EC4899" variant="Bold" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{statsData.shortsStats.totalValidated}</p>
              <p className="text-xs text-gray-500 mt-1">Validés</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <VideoPlay size={24} color="#14B8A6" variant="Bold" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{statsData.shortsStats.totalPublished}</p>
              <p className="text-xs text-gray-500 mt-1">Publiés</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">×</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{statsData.shortsStats.totalRejected}</p>
              <p className="text-xs text-gray-500 mt-1">Ignorés</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Aucune statistique disponible</p>
        )}
      </div>

      {/* Source Channels Grid */}
      {filteredChannels.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <VideoPlay size={64} color="#9CA3AF" className="mx-auto mb-4" variant="Bulk" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {sourceChannels.length === 0 ? 'Aucune chaîne source' : 'Aucune chaîne ne correspond aux filtres'}
          </h3>
          <p className="text-gray-500">
            {sourceChannels.length === 0
              ? 'Ajoutez des chaînes sources depuis la page "Chaînes Sources" pour commencer à roller des shorts.'
              : 'Essayez de modifier vos critères de filtrage pour voir plus de chaînes.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer ${
                selectedChannel?.id === channel.id
                  ? 'border-indigo-500 ring-4 ring-indigo-200'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => setSelectedChannel(channel)}
            >
              {/* Card Content */}
              <div className="p-6 text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  {channel.profileImageUrl ? (
                    <img
                      src={channel.profileImageUrl}
                      alt={channel.channelName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-4 border-gray-200 mx-auto">
                      <VideoPlay size={40} color="white" variant="Bold" />
                    </div>
                  )}
                  {/* Type Badge */}
                  <span
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getContentTypeColor(
                      channel.contentType
                    )}`}
                  >
                    {getContentTypeShort(channel.contentType)}
                  </span>
                </div>

                {/* Channel Name */}
                <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2">
                  {channel.channelName}
                </h3>

                {/* Stats */}
                <div className="text-xs text-gray-500 mb-4">
                  {channel.totalVideos !== null && channel.totalVideos !== undefined ? (
                    <span>{channel.totalVideos.toLocaleString()} vidéos</span>
                  ) : (
                    <span>—</span>
                  )}
                </div>

                {/* Roll Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRollShort(channel);
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    selectedChannel?.id === channel.id
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Play size={18} color="currentColor" variant="Bold" />
                  <span>Générer un Short</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Roll Short Modal */}
      <RollShortModal
        isOpen={isRollModalOpen}
        onClose={() => setIsRollModalOpen(false)}
        channel={selectedChannel}
        onShortRetained={handleShortRetained}
      />

      {/* Assign Short Modal */}
      <AssignShortModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        short={retainedShort}
        onAssigned={handleShortAssigned}
      />

      {/* Floating Filter */}
      <FloatingFilter onFilterChange={setFilters} />

      {/* Random Button */}
      <RandomButton
        filteredChannels={filteredChannels}
        onRandomSelect={handleRandomSelect}
      />
    </div>
  );
}
