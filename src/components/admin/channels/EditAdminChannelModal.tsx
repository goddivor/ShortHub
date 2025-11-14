import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { UPDATE_ADMIN_CHANNEL_MUTATION, GET_ADMIN_CHANNELS_QUERY } from '@/lib/graphql';
import { AdminChannel, ContentType } from '@/types/graphql';
import { useToast } from '@/context/toast-context';
import SpinLoader from '@/components/SpinLoader';
import { CloseCircle, Edit, VideoPlay } from 'iconsax-react';

interface EditAdminChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: AdminChannel | null;
}

export default function EditAdminChannelModal({ isOpen, onClose, channel }: EditAdminChannelModalProps) {
  const [contentType, setContentType] = useState<ContentType>(ContentType.VA_SANS_EDIT);
  const toast = useToast();

  useEffect(() => {
    if (channel) {
      setContentType(channel.contentType || ContentType.VA_SANS_EDIT);
    }
  }, [channel]);

  const [updateAdminChannel, { loading }] = useMutation(UPDATE_ADMIN_CHANNEL_MUTATION, {
    refetchQueries: [{ query: GET_ADMIN_CHANNELS_QUERY }],
    onCompleted: () => {
      toast.success('Chaîne de publication modifiée avec succès');
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!channel) return;

    try {
      await updateAdminChannel({
        variables: {
          id: channel.id,
          input: {
            contentType,
          },
        },
      });
    } catch {
      // Error handled by onError
    }
  };

  if (!isOpen || !channel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Edit size={24} color="white" variant="Bold" />
              </div>
              <h2 className="text-2xl font-bold">Modifier la Chaîne</h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <CloseCircle size={24} color="white" variant="Bold" />
            </button>
          </div>
          <p className="text-purple-100 text-sm mt-2">
            Modifiez les informations de la chaîne de publication
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Channel Info Display */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {channel.profileImageUrl && (
                <img
                  src={channel.profileImageUrl}
                  alt={channel.channelName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{channel.channelName}</p>
                <p className="text-xs text-gray-500 font-mono">{channel.channelId}</p>
              </div>
            </div>
          </div>

          {/* Content Type Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type de contenu *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <VideoPlay size={18} color="#9CA3AF" variant="Bold" />
              </div>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white"
                disabled={loading}
              >
                <option value={ContentType.VA_SANS_EDIT}>VA Sans Édition</option>
                <option value={ContentType.VA_AVEC_EDIT}>VA Avec Édition</option>
                <option value={ContentType.VF_SANS_EDIT}>VF Sans Édition</option>
                <option value={ContentType.VF_AVEC_EDIT}>VF Avec Édition</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <SpinLoader />
                  <span>Modification...</span>
                </>
              ) : (
                <>
                  <Edit size={18} color="white" variant="Bold" />
                  <span>Modifier</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
