import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_SOURCE_CHANNEL_MUTATION, GET_SOURCE_CHANNELS_QUERY } from '@/lib/graphql';
import { ContentType } from '@/types/graphql';
import { useToast } from '@/context/toast-context';
import { extractChannelData } from '@/lib/youtube-api';
import SpinLoader from '@/components/SpinLoader';
import { CloseCircle, Youtube, VideoPlay, TickCircle, Warning2 } from 'iconsax-react';

interface CreateSourceChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChannelPreview {
  username: string;
  subscriberCount: number;
  profileImageUrl?: string;
}

export default function CreateSourceChannelModal({ isOpen, onClose }: CreateSourceChannelModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [contentType, setContentType] = useState<ContentType>(ContentType.VA_SANS_EDIT);
  const [channelPreview, setChannelPreview] = useState<ChannelPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const toast = useToast();

  const [createSourceChannel, { loading }] = useMutation(CREATE_SOURCE_CHANNEL_MUTATION, {
    refetchQueries: [{ query: GET_SOURCE_CHANNELS_QUERY }],
    onCompleted: () => {
      toast.success('Chaîne source créée avec succès');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleClose = () => {
    setYoutubeUrl('');
    setContentType(ContentType.VA_SANS_EDIT);
    setChannelPreview(null);
    setPreviewError(null);
    onClose();
  };

  const fetchChannelPreview = async (url: string) => {
    if (!url.trim()) {
      setChannelPreview(null);
      setPreviewError(null);
      return;
    }

    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const data = await extractChannelData(url);
      setChannelPreview({
        username: data.username,
        subscriberCount: data.subscriber_count,
        profileImageUrl: data.profile_image_url,
      });
    } catch (error) {
      setChannelPreview(null);
      setPreviewError(error instanceof Error ? error.message : 'Erreur lors de la récupération des informations');
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (youtubeUrl.trim()) {
        fetchChannelPreview(youtubeUrl);
      } else {
        setChannelPreview(null);
        setPreviewError(null);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [youtubeUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!youtubeUrl.trim()) {
      toast.error('Veuillez entrer une URL YouTube');
      return;
    }

    if (!channelPreview) {
      toast.error('Veuillez attendre la vérification de la chaîne');
      return;
    }

    try {
      await createSourceChannel({
        variables: {
          input: {
            youtubeUrl: youtubeUrl.trim(),
            contentType,
          },
        },
      });
    } catch {
      // Error handled by onError
    }
  };

  const formatSubscribers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Youtube size={24} color="white" variant="Bold" />
              </div>
              <h2 className="text-2xl font-bold">Nouvelle Chaîne Source</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <CloseCircle size={24} color="white" variant="Bold" />
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-2">
            Ajoutez une chaîne YouTube pour roller des shorts
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* URL Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL de la chaîne YouTube *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Youtube size={18} color="#9CA3AF" variant="Bold" />
              </div>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://youtube.com/@channelname"
                required
                disabled={loading}
              />
              {previewLoading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <SpinLoader />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Formats acceptés: @handle, /c/nom, /channel/ID, /user/nom
            </p>
          </div>

          {/* Channel Preview - Success */}
          {channelPreview && !previewError && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <TickCircle size={24} color="#10B981" variant="Bold" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">{channelPreview.username}</p>
                  <p className="text-xs text-green-700">
                    {formatSubscribers(channelPreview.subscriberCount)} abonnés
                  </p>
                </div>
                {channelPreview.profileImageUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={channelPreview.profileImageUrl}
                      alt={channelPreview.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-green-300"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Channel Preview - Error */}
          {previewError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Warning2 size={24} color="#EF4444" variant="Bold" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">Erreur</p>
                  <p className="text-xs text-red-700">{previewError}</p>
                </div>
              </div>
            </div>
          )}

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
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
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
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              disabled={loading || !channelPreview || previewLoading}
            >
              {loading ? (
                <>
                  <SpinLoader />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <Youtube size={18} color="white" variant="Bold" />
                  <span>Créer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
