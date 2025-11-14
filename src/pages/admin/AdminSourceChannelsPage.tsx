import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Add, VideoPlay, Edit2, Trash } from 'iconsax-react';
import {
  GET_SOURCE_CHANNELS_QUERY,
  DELETE_SOURCE_CHANNEL_MUTATION,
} from '@/lib/graphql';
import { ContentType, SourceChannel } from '@/types/graphql';
import { useToast } from '@/context/toast-context';
import SpinLoader from '@/components/SpinLoader';
import CreateSourceChannelModal from '@/components/admin/channels/CreateSourceChannelModal';
import EditSourceChannelModal from '@/components/admin/channels/EditSourceChannelModal';
import DeleteChannelModal from '@/components/admin/channels/DeleteChannelModal';

const contentTypeLabels: Record<ContentType, string> = {
  [ContentType.VA_SANS_EDIT]: 'VA Sans Édition',
  [ContentType.VA_AVEC_EDIT]: 'VA Avec Édition',
  [ContentType.VF_SANS_EDIT]: 'VF Sans Édition',
  [ContentType.VF_AVEC_EDIT]: 'VF Avec Édition',
};

const contentTypeColors: Record<ContentType, string> = {
  [ContentType.VA_SANS_EDIT]: 'bg-blue-100 text-blue-700',
  [ContentType.VA_AVEC_EDIT]: 'bg-purple-100 text-purple-700',
  [ContentType.VF_SANS_EDIT]: 'bg-green-100 text-green-700',
  [ContentType.VF_AVEC_EDIT]: 'bg-orange-100 text-orange-700',
};

export default function AdminSourceChannelsPage() {
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<SourceChannel | null>(null);
  const toast = useToast();

  const { data, loading } = useQuery<{ sourceChannels: SourceChannel[] }>(
    GET_SOURCE_CHANNELS_QUERY,
    {
      variables: contentTypeFilter !== 'ALL' ? { contentType: contentTypeFilter } : {},
    }
  );

  const [deleteSourceChannel, { loading: deleteLoading }] = useMutation(
    DELETE_SOURCE_CHANNEL_MUTATION,
    {
      refetchQueries: [{ query: GET_SOURCE_CHANNELS_QUERY }],
      onCompleted: () => {
        toast.success('Chaîne source supprimée avec succès');
        setIsDeleteModalOpen(false);
        setSelectedChannel(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );

  const channels = useMemo(() => {
    if (!data?.sourceChannels) return [];
    let filtered = data.sourceChannels;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (channel) =>
          channel.channelName.toLowerCase().includes(query) ||
          channel.channelId.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [data, searchQuery]);

  const handleEdit = (channel: SourceChannel) => {
    setSelectedChannel(channel);
    setIsEditModalOpen(true);
  };

  const handleDelete = (channel: SourceChannel) => {
    setSelectedChannel(channel);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedChannel) return;
    try {
      await deleteSourceChannel({
        variables: { id: selectedChannel.id },
      });
    } catch {
      // Error handled by onError
    }
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

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-xl p-3">
                <VideoPlay size={32} color="white" variant="Bold" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Chaînes Sources</h1>
                <p className="text-blue-100 text-sm mt-1">
                  Gérez les chaînes YouTube sources pour roller des shorts
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Add size={20} color="currentColor" variant="Bold" />
            <span>Ajouter une chaîne</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-blue-100 text-sm font-medium">Total</p>
            <p className="text-3xl font-bold mt-1">{data?.sourceChannels?.length || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-blue-100 text-sm font-medium">VA Sans Édition</p>
            <p className="text-3xl font-bold mt-1">
              {data?.sourceChannels?.filter((c) => c.contentType === ContentType.VA_SANS_EDIT).length || 0}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-blue-100 text-sm font-medium">VF Sans Édition</p>
            <p className="text-3xl font-bold mt-1">
              {data?.sourceChannels?.filter((c) => c.contentType === ContentType.VF_SANS_EDIT).length || 0}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-blue-100 text-sm font-medium">Avec Édition</p>
            <p className="text-3xl font-bold mt-1">
              {data?.sourceChannels?.filter((c) => c.contentType === ContentType.VA_AVEC_EDIT || c.contentType === ContentType.VF_AVEC_EDIT).length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou ID de chaîne..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-64">
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value as ContentType | 'ALL')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tous les types</option>
              <option value={ContentType.VA_SANS_EDIT}>VA Sans Édition</option>
              <option value={ContentType.VA_AVEC_EDIT}>VA Avec Édition</option>
              <option value={ContentType.VF_SANS_EDIT}>VF Sans Édition</option>
              <option value={ContentType.VF_AVEC_EDIT}>VF Avec Édition</option>
            </select>
          </div>
        </div>
      </div>

      {/* Channels Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Chaîne</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Type de contenu</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Vidéos totales</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Shorts rollés</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {channels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <VideoPlay size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
                    <p className="text-gray-500 font-medium">Aucune chaîne source trouvée</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Ajoutez une chaîne source pour commencer à roller des shorts
                    </p>
                  </td>
                </tr>
              ) : (
                channels.map((channel) => (
                  <tr key={channel.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {channel.profileImageUrl && (
                          <img
                            src={channel.profileImageUrl}
                            alt={channel.channelName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{channel.channelName}</div>
                          <div className="text-xs text-gray-500 font-mono">{channel.channelId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          contentTypeColors[channel.contentType]
                        }`}
                      >
                        {contentTypeLabels[channel.contentType]}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900 font-medium">
                        {channel.totalVideos !== null && channel.totalVideos !== undefined
                          ? channel.totalVideos.toLocaleString()
                          : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900 font-medium">{channel.shortsRolled?.length || 0}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(channel)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={18} color="currentColor" />
                        </button>
                        <button
                          onClick={() => handleDelete(channel)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash size={18} color="currentColor" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateSourceChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditSourceChannelModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedChannel(null);
        }}
        channel={selectedChannel}
      />

      <DeleteChannelModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedChannel(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer la chaîne source"
        message={
          selectedChannel
            ? `Êtes-vous sûr de vouloir supprimer la chaîne "${selectedChannel.channelName}" ? Cette action est irréversible.`
            : ''
        }
        loading={deleteLoading}
      />
    </div>
  );
}
