import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Add, Youtube, Edit2, Trash } from 'iconsax-react';
import {
  GET_ADMIN_CHANNELS_QUERY,
  DELETE_ADMIN_CHANNEL_MUTATION,
} from '@/lib/graphql';
import { AdminChannel, ContentType } from '@/types/graphql';
import { useToast } from '@/context/toast-context';
import SpinLoader from '@/components/SpinLoader';
import CreateAdminChannelModal from '@/components/admin/channels/CreateAdminChannelModal';
import EditAdminChannelModal from '@/components/admin/channels/EditAdminChannelModal';
import DeleteChannelModal from '@/components/admin/channels/DeleteChannelModal';

// Helper pour afficher le label du type de contenu
const getContentTypeLabel = (contentType: ContentType): string => {
  const labels = {
    [ContentType.VA_SANS_EDIT]: 'VA Sans Édition',
    [ContentType.VA_AVEC_EDIT]: 'VA Avec Édition',
    [ContentType.VF_SANS_EDIT]: 'VF Sans Édition',
    [ContentType.VF_AVEC_EDIT]: 'VF Avec Édition',
    [ContentType.VO_SANS_EDIT]: 'VO Sans Édition',
    [ContentType.VO_AVEC_EDIT]: 'VO Avec Édition',
  };
  return labels[contentType] || contentType;
};

// Helper pour obtenir la couleur du badge selon le type
const getContentTypeColor = (contentType: ContentType): string => {
  const colors = {
    [ContentType.VA_SANS_EDIT]: 'bg-blue-100 text-blue-800',
    [ContentType.VA_AVEC_EDIT]: 'bg-blue-100 text-blue-800',
    [ContentType.VF_SANS_EDIT]: 'bg-purple-100 text-purple-800',
    [ContentType.VF_AVEC_EDIT]: 'bg-purple-100 text-purple-800',
    [ContentType.VO_SANS_EDIT]: 'bg-green-100 text-green-800',
    [ContentType.VO_AVEC_EDIT]: 'bg-emerald-100 text-emerald-800',
  };
  return colors[contentType] || 'bg-gray-100 text-gray-800';
};

export default function AdminPublicationChannelsPage() {
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<AdminChannel | null>(null);
  const toast = useToast();

  const { data, loading } = useQuery<{ adminChannels: AdminChannel[] }>(
    GET_ADMIN_CHANNELS_QUERY
  );

  const [deleteAdminChannel, { loading: deleteLoading }] = useMutation(
    DELETE_ADMIN_CHANNEL_MUTATION,
    {
      refetchQueries: [{ query: GET_ADMIN_CHANNELS_QUERY }],
      onCompleted: () => {
        toast.success('Chaîne de publication supprimée avec succès');
        setIsDeleteModalOpen(false);
        setSelectedChannel(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );

  const channels = useMemo(() => {
    if (!data?.adminChannels) return [];
    let filtered = data.adminChannels;

    // Filtrer par type de contenu
    if (contentTypeFilter !== 'ALL') {
      filtered = filtered.filter((channel) => channel.contentType === contentTypeFilter);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (channel) =>
          channel.channelName.toLowerCase().includes(query) ||
          channel.channelId.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [data, searchQuery, contentTypeFilter]);

  const handleEdit = (channel: AdminChannel) => {
    setSelectedChannel(channel);
    setIsEditModalOpen(true);
  };

  const handleDelete = (channel: AdminChannel) => {
    setSelectedChannel(channel);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedChannel) return;
    try {
      await deleteAdminChannel({
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
          <p className="text-gray-600 mt-4">Chargement des chaînes de publication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-xl p-3">
                <Youtube size={32} color="white" variant="Bold" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Chaînes de Publication</h1>
                <p className="text-purple-100 text-sm mt-1">
                  Gérez vos chaînes YouTube de publication
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Add size={20} color="currentColor" variant="Bold" />
            <span>Ajouter une chaîne</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-purple-100 text-sm font-medium">Total</p>
            <p className="text-3xl font-bold mt-1">{data?.adminChannels?.length || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-purple-100 text-sm font-medium">VA Sans Édition</p>
            <p className="text-3xl font-bold mt-1">
              {data?.adminChannels?.filter((c) => c.contentType === ContentType.VA_SANS_EDIT).length || 0}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-purple-100 text-sm font-medium">VF Sans Édition</p>
            <p className="text-3xl font-bold mt-1">
              {data?.adminChannels?.filter((c) => c.contentType === ContentType.VF_SANS_EDIT).length || 0}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-purple-100 text-sm font-medium">Avec Édition</p>
            <p className="text-3xl font-bold mt-1">
              {data?.adminChannels?.filter((c) => c.contentType === ContentType.VA_AVEC_EDIT || c.contentType === ContentType.VF_AVEC_EDIT).length || 0}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-64">
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value as ContentType | 'ALL')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Shorts publiés</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {channels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Youtube size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
                    <p className="text-gray-500 font-medium">Aucune chaîne de publication trouvée</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Ajoutez une chaîne de publication pour publier vos shorts
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getContentTypeColor(channel.contentType)}`}>
                        {getContentTypeLabel(channel.contentType)}
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
                      <span className="text-gray-900 font-medium">{channel.stats?.totalShortsPublished || 0}</span>
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
      <CreateAdminChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditAdminChannelModal
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
        title="Supprimer la chaîne de publication"
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
