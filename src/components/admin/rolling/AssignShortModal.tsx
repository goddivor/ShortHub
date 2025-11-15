import { useState, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ASSIGN_SHORT_MUTATION,
  GET_USERS_QUERY,
  GET_ADMIN_CHANNELS_QUERY,
} from '@/lib/graphql';
import { Short, UserRole, AdminChannel, ContentType, User as UserType } from '@/types/graphql';
import { useToast } from '@/context/toast-context';
import SpinLoader from '@/components/SpinLoader';
import CustomSelect, { CustomSelectOption } from '@/components/ui/CustomSelect';
import { CloseCircle, User, Youtube, Calendar, DocumentText, Send2 } from 'iconsax-react';

interface AssignShortModalProps {
  isOpen: boolean;
  onClose: () => void;
  short: Short | null;
  onAssigned: () => void;
}

export default function AssignShortModal({ isOpen, onClose, short, onAssigned }: AssignShortModalProps) {
  const [selectedVideaste, setSelectedVideaste] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const toast = useToast();

  // Récupérer les vidéastes
  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS_QUERY, {
    variables: { role: UserRole.VIDEASTE },
  });

  // Récupérer les chaînes de publication
  const { data: channelsData, loading: channelsLoading } = useQuery<{ adminChannels: AdminChannel[] }>(
    GET_ADMIN_CHANNELS_QUERY
  );

  // Filtrer les chaînes par type de contenu correspondant
  const matchingChannels = useMemo(() => {
    if (!channelsData?.adminChannels || !short) return [];
    const sourceContentType = short.sourceChannel.contentType;
    return channelsData.adminChannels.filter(
      (channel) => channel.contentType === sourceContentType
    );
  }, [channelsData, short]);

  const [assignShort, { loading: assignLoading }] = useMutation(ASSIGN_SHORT_MUTATION, {
    onCompleted: () => {
      toast.success('Short assigné avec succès !');
      onAssigned();
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleClose = () => {
    setSelectedVideaste('');
    setSelectedChannel('');
    setDeadline('');
    setNotes('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!short) return;

    if (!selectedVideaste) {
      toast.error('Veuillez sélectionner un vidéaste');
      return;
    }

    if (!selectedChannel) {
      toast.error('Veuillez sélectionner une chaîne de publication');
      return;
    }

    if (!deadline) {
      toast.error('Veuillez définir une date d\'échéance');
      return;
    }

    try {
      await assignShort({
        variables: {
          input: {
            shortId: short.id,
            videasteId: selectedVideaste,
            targetChannelId: selectedChannel,
            deadline: new Date(deadline).toISOString(),
            notes: notes.trim() || undefined,
          },
        },
      });
    } catch {
      // Error handled by onError
    }
  };

  // Helper pour obtenir le label du type
  const getContentTypeLabel = (contentType: ContentType): string => {
    const labels = {
      [ContentType.VA_SANS_EDIT]: 'VA Sans Édition',
      [ContentType.VA_AVEC_EDIT]: 'VA Avec Édition',
      [ContentType.VF_SANS_EDIT]: 'VF Sans Édition',
      [ContentType.VF_AVEC_EDIT]: 'VF Avec Édition',
    };
    return labels[contentType] || contentType;
  };

  // Date minimum (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];

  if (!isOpen || !short) return null;

  const videasts = (usersData as { users?: { edges?: { node: UserType }[] } })?.users?.edges?.map((edge) => edge.node) || [];
  const loading = usersLoading || channelsLoading;

  // Préparer les options pour CustomSelect (vidéastes)
  const videasteOptions: CustomSelectOption[] = videasts.map((videaste) => ({
    id: videaste.id,
    name: videaste.username,
    profileImage: videaste.profileImage,
    type: 'user' as const,
  }));

  // Préparer les options pour CustomSelect (chaînes)
  const channelOptions: CustomSelectOption[] = matchingChannels.map((channel) => ({
    id: channel.id,
    name: `${channel.channelName} - ${getContentTypeLabel(channel.contentType)}`,
    imageUrl: channel.imageUrl,
    type: 'channel' as const,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Send2 size={24} color="white" variant="Bold" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Assigner le Short</h2>
                <p className="text-green-100 text-sm mt-1">
                  Assignez ce short à un vidéaste pour réalisation
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={assignLoading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <CloseCircle size={24} color="white" variant="Bold" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Short Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 mb-2">Informations du Short</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Chaîne source</p>
                <p className="text-gray-900 font-medium">{short.sourceChannel.channelName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Type</p>
                <p className="text-gray-900 font-medium">
                  {getContentTypeLabel(short.sourceChannel.contentType)}
                </p>
              </div>
            </div>
            {short.title && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Titre</p>
                <p className="text-sm text-gray-900">{short.title}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">URL</p>
              <a
                href={short.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline break-all"
              >
                {short.videoUrl}
              </a>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <SpinLoader />
            </div>
          ) : (
            <>
              {/* Vidéaste Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User size={18} color="#374151" variant="Bold" />
                    <span>Vidéaste *</span>
                  </div>
                </label>
                <CustomSelect
                  options={videasteOptions}
                  value={selectedVideaste}
                  onChange={setSelectedVideaste}
                  placeholder="Sélectionner un vidéaste"
                  disabled={assignLoading}
                  required
                />
                {videasts.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Aucun vidéaste disponible. Créez des comptes vidéastes d'abord.
                  </p>
                )}
              </div>

              {/* Channel Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Youtube size={18} color="#374151" variant="Bold" />
                    <span>Chaîne de publication *</span>
                  </div>
                </label>
                <CustomSelect
                  options={channelOptions}
                  value={selectedChannel}
                  onChange={setSelectedChannel}
                  placeholder="Sélectionner une chaîne"
                  disabled={assignLoading}
                  required
                />
                {matchingChannels.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Aucune chaîne de publication de type "{getContentTypeLabel(short.sourceChannel.contentType)}" disponible.
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Seules les chaînes de type "{getContentTypeLabel(short.sourceChannel.contentType)}" sont affichées
                </p>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} color="#374151" variant="Bold" />
                    <span>Date d'échéance *</span>
                  </div>
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={today}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                  disabled={assignLoading}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <DocumentText size={18} color="#374151" variant="Bold" />
                    <span>Notes (optionnel)</span>
                  </div>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  placeholder="Instructions spécifiques, détails supplémentaires..."
                  disabled={assignLoading}
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50"
              disabled={assignLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              disabled={assignLoading || loading || videasts.length === 0 || matchingChannels.length === 0}
            >
              {assignLoading ? (
                <>
                  <SpinLoader />
                  <span>Assignation...</span>
                </>
              ) : (
                <>
                  <Send2 size={20} color="white" variant="Bold" />
                  <span>Assigner</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
