import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { ROLL_SHORT_MUTATION, REJECT_SHORT_MUTATION, RETAIN_SHORT_MUTATION } from '@/lib/graphql';
import { SourceChannel, Short } from '@/types/graphql';
import { useToast } from '@/context/toast-context';
import SpinLoader from '@/components/SpinLoader';
import { CloseCircle, VideoPlay, CloseSquare, TickSquare } from 'iconsax-react';

interface RollShortModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: SourceChannel | null;
  onShortRetained: (short: Short) => void;
}

export default function RollShortModal({ isOpen, onClose, channel, onShortRetained }: RollShortModalProps) {
  const [rolledShort, setRolledShort] = useState<Short | null>(null);
  const toast = useToast();

  const [rollShort, { loading: rollingLoading }] = useMutation<{ rollShort: Short }>(ROLL_SHORT_MUTATION, {
    onCompleted: (data) => {
      setRolledShort(data.rollShort);
      toast.success('Short généré avec succès !');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [rejectShort, { loading: rejectLoading }] = useMutation(REJECT_SHORT_MUTATION, {
    onCompleted: () => {
      toast.info('Short ignoré');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [retainShort, { loading: retainLoading }] = useMutation<{ retainShort: Short }>(RETAIN_SHORT_MUTATION, {
    onCompleted: (data) => {
      toast.success('Short retenu avec succès !');
      onShortRetained(data.retainShort);
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (isOpen && channel) {
      // Générer automatiquement un short quand le modal s'ouvre
      rollShort({
        variables: {
          input: {
            sourceChannelId: channel.id,
          },
        },
      });
    }
  }, [isOpen, channel, rollShort]);

  const handleClose = () => {
    setRolledShort(null);
    onClose();
  };

  const handleIgnore = () => {
    if (!rolledShort) return;
    rejectShort({
      variables: {
        shortId: rolledShort.id,
      },
    });
  };

  const handleRetain = () => {
    if (!rolledShort) return;
    retainShort({
      variables: {
        shortId: rolledShort.id,
      },
    });
  };

  // Extraire l'ID de la vidéo YouTube depuis l'URL
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  if (!isOpen || !channel) return null;

  const videoId = rolledShort ? getYouTubeVideoId(rolledShort.videoUrl) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <VideoPlay size={24} color="white" variant="Bold" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Générer un Short</h2>
                <p className="text-indigo-100 text-sm mt-1">{channel.channelName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={rollingLoading || rejectLoading || retainLoading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <CloseCircle size={24} color="white" variant="Bold" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {rollingLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <SpinLoader />
              <p className="text-gray-600 mt-4 font-medium">Génération d'un short aléatoire...</p>
              <p className="text-gray-500 text-sm mt-2">Veuillez patienter</p>
            </div>
          ) : rolledShort && videoId ? (
            <div className="space-y-6">
              {/* YouTube Player */}
              <div className="aspect-[9/16] max-h-[600px] mx-auto bg-black rounded-xl overflow-hidden shadow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube Short Preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Short Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {rolledShort.title && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Titre</p>
                    <p className="text-sm text-gray-900 font-medium">{rolledShort.title}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">URL</p>
                  <a
                    href={rolledShort.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline break-all"
                  >
                    {rolledShort.videoUrl}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Généré le</p>
                  <p className="text-sm text-gray-900">
                    {new Date(rolledShort.rolledAt).toLocaleString('fr-FR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleIgnore}
                  disabled={rejectLoading || retainLoading}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {rejectLoading ? (
                    <>
                      <SpinLoader />
                      <span>Ignorer...</span>
                    </>
                  ) : (
                    <>
                      <CloseSquare size={20} color="currentColor" variant="Bold" />
                      <span>Ignorer</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleRetain}
                  disabled={rejectLoading || retainLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {retainLoading ? (
                    <>
                      <SpinLoader />
                      <span>Validation...</span>
                    </>
                  ) : (
                    <>
                      <TickSquare size={20} color="white" variant="Bold" />
                      <span>Valider</span>
                    </>
                  )}
                </button>
              </div>

              {/* Info Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-xs">
                  <strong>💡 Astuce :</strong> Si vous ignorez ce short, il pourra réapparaître lors d'un prochain roll.
                  Si vous le validez, vous pourrez l'assigner à un vidéaste.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <VideoPlay size={64} color="#9CA3AF" className="mb-4" variant="Bulk" />
              <p className="text-gray-500 font-medium">Aucun short généré</p>
              <p className="text-gray-400 text-sm mt-2">Une erreur s'est produite</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
