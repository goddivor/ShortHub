/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/RollShortsPage.tsx
import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/toast-context';
import FloatingNav from '@/components/FloatingNav';
import { 
  ChannelService, 
  ShortsService, 
  type ChannelWithStats, 
  formatSubscriberCount,
  getTagColor,
  getChannelTypeColor 
} from '@/lib/supabase';
import { getChannelShorts } from '@/lib/youtube-api';
import Button from '@/components/Button';
import Badge from '@/components/badge';
import SpinLoader from '@/components/SpinLoader';
import { 
  Youtube, 
  Play, 
  TickCircle, 
  Refresh, 
  User, 
  TrendUp,
  Link as LinkIcon,
  Chart,
  VideoPlay,
  CloseCircle
} from 'iconsax-react';

interface RolledVideo {
  id: string;
  channelId: string;
  videoUrl: string;
  isValidating: boolean;
  rollId: string;
}

const RollShortsPage: React.FC = () => {
  const { success, error, info, warning } = useToast();
  
  // State management
  const [channels, setChannels] = useState<ChannelWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rollingStates, setRollingStates] = useState<Record<string, boolean>>({});
  const [rolledVideos, setRolledVideos] = useState<Record<string, RolledVideo[]>>({});

  // Load channels on component mount
  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setIsLoading(true);
      const channelsData = await ChannelService.getChannelsWithStats();
      setChannels(channelsData);
      
      // Load pending rolls for each channel
      await loadPendingRolls(channelsData);
    } catch (err) {
      error('Erreur de chargement', 'Impossible de charger les chaînes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingRolls = async (channelsData: ChannelWithStats[]) => {
    const newRolledVideos: Record<string, RolledVideo[]> = {};
    
    for (const channel of channelsData) {
      try {
        const pendingRolls = await ShortsService.getUnvalidatedShortsForChannel(channel.id);
        newRolledVideos[channel.id] = pendingRolls.map(roll => ({
          id: `${channel.id}-${roll.id}`,
          channelId: channel.id,
          videoUrl: roll.video_url,
          isValidating: false,
          rollId: roll.id
        }));
      } catch (err) {
        console.error(`Error loading pending rolls for channel ${channel.id}:`, err);
        newRolledVideos[channel.id] = [];
      }
    }
    
    setRolledVideos(newRolledVideos);
  };

  const handleRoll = async (channel: ChannelWithStats) => {
    try {
      setRollingStates(prev => ({ ...prev, [channel.id]: true }));
      info('Génération en cours...', `Recherche d'un Short pour ${channel.username}`);

      // Get channel's available shorts
      const channelShorts = await getChannelShorts(channel.youtube_url);
      
      if (!channelShorts || channelShorts.length === 0) {
        warning('Aucun Short trouvé', 'Cette chaîne ne semble pas avoir de YouTube Shorts disponibles');
        return;
      }

      // Get already validated videos for this channel to avoid duplicates
      const existingRolls = await ShortsService.getShortsRolls(channel.id);
      const validatedUrls = existingRolls
        .filter(roll => roll.validated)
        .map(roll => roll.video_url);

      // Filter out already validated videos
      const availableShorts = channelShorts.filter(
        shortUrl => !validatedUrls.includes(shortUrl)
      );

      if (availableShorts.length === 0) {
        warning('Tous les Shorts traités', 'Tous les Shorts disponibles de cette chaîne ont déjà été validés');
        return;
      }

      // Select a random short from available ones
      const randomIndex = Math.floor(Math.random() * availableShorts.length);
      const selectedShortUrl = availableShorts[randomIndex];

      // Always create a new roll (even if the same video was rolled before but not validated)
      const newRoll = await ShortsService.createShortsRoll({
        channel_id: channel.id,
        video_url: selectedShortUrl,
      });

      // Add to local state
      const newRolledVideo: RolledVideo = {
        id: `${channel.id}-${newRoll.id}`,
        channelId: channel.id,
        videoUrl: selectedShortUrl,
        isValidating: false,
        rollId: newRoll.id
      };

      setRolledVideos(prev => ({
        ...prev,
        [channel.id]: [...(prev[channel.id] || []), newRolledVideo]
      }));

      success('Short généré !', 'Cliquez sur "Valider" ou "Ignorer" pour ce contenu');
      
    } catch (err) {
      console.error('Error rolling shorts:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('quotaExceeded')) {
          error('Quota API dépassé', 'Limite YouTube API atteinte. Réessayez plus tard.');
        } else if (err.message.includes('API key')) {
          error('Erreur API', 'Clé YouTube API non configurée ou invalide');
        } else {
          error('Erreur de génération', err.message || 'Impossible de générer un Short pour cette chaîne');
        }
      } else {
        error('Erreur de génération', 'Impossible de générer un Short pour cette chaîne');
      }
    } finally {
      setRollingStates(prev => ({ ...prev, [channel.id]: false }));
    }
  };

  const handleValidate = async (channel: ChannelWithStats, rolledVideo: RolledVideo) => {
    try {
      // Set validating state for this specific video
      setRolledVideos(prev => ({
        ...prev,
        [channel.id]: prev[channel.id].map(video => 
          video.id === rolledVideo.id 
            ? { ...video, isValidating: true }
            : video
        )
      }));

      await ShortsService.validateShortsRoll(rolledVideo.rollId);
      success('Short validé !', 'Cette vidéo ne sera plus proposée');
      
      // Remove from rolled videos
      setRolledVideos(prev => ({
        ...prev,
        [channel.id]: prev[channel.id].filter(video => video.id !== rolledVideo.id)
      }));

      // Refresh channel stats
      loadChannels();
      
    } catch (err) {
      error('Erreur de validation', 'Impossible de valider cette vidéo');
      
      // Reset validating state on error
      setRolledVideos(prev => ({
        ...prev,
        [channel.id]: prev[channel.id].map(video => 
          video.id === rolledVideo.id 
            ? { ...video, isValidating: false }
            : video
        )
      }));
    }
  };

  const handleIgnore = async (channel: ChannelWithStats, rolledVideo: RolledVideo) => {
    try {
      // Set validating state for this specific video (reuse the same state)
      setRolledVideos(prev => ({
        ...prev,
        [channel.id]: prev[channel.id].map(video => 
          video.id === rolledVideo.id 
            ? { ...video, isValidating: true }
            : video
        )
      }));

      // Delete the roll from database without validating
      await ShortsService.deleteShortsRoll(rolledVideo.rollId);
      info('Short ignoré', 'Cette vidéo pourra être générée à nouveau');
      
      // Remove from rolled videos
      setRolledVideos(prev => ({
        ...prev,
        [channel.id]: prev[channel.id].filter(video => video.id !== rolledVideo.id)
      }));

      // Refresh channel stats
      loadChannels();
      
    } catch (err) {
      error('Erreur', 'Impossible d\'ignorer cette vidéo');
      
      // Reset validating state on error
      setRolledVideos(prev => ({
        ...prev,
        [channel.id]: prev[channel.id].map(video => 
          video.id === rolledVideo.id 
            ? { ...video, isValidating: false }
            : video
        )
      }));
    }
  };

  const openVideoInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const navigateToAddChannel = () => {
    window.location.href = '/add-channel';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FloatingNav />
        <div className="text-center">
          <SpinLoader />
          <p className="mt-4 text-gray-600">Chargement des chaînes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <FloatingNav />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <VideoPlay color="#FF0000" size={48} className="text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Générateur de Shorts
          </h1>
          <p className="text-gray-600">
            Générez et validez des YouTube Shorts depuis vos chaînes enregistrées
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <Youtube color="#FF0000" size={24} className="text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Chaînes enregistrées</p>
                <p className="text-2xl font-bold text-gray-900">{channels.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <Play color="#10B981" size={24} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Shorts validés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {channels.reduce((sum, ch) => sum + ch.validated_rolls, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <Chart color="#F59E0B" size={24} className="text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {channels.reduce((sum, ch) => sum + ch.pending_rolls, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Channels List */}
        {channels.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Youtube color="#9CA3AF" size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune chaîne enregistrée
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter des chaînes YouTube pour générer des Shorts
            </p>
            <Button 
              onClick={navigateToAddChannel}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium transition-colors"
            >
              Ajouter une chaîne
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {channels.map((channel) => {
              const isRolling = rollingStates[channel.id];
              const channelRolledVideos = rolledVideos[channel.id] || [];
              
              return (
                <div key={channel.id} className="bg-white rounded-xl shadow-sm border p-6">
                  {/* Channel Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <User color="#FF0000" size={20} className="text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{channel.username}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <TrendUp color="#6B7280" size={14} className="text-gray-500" />
                          {formatSubscriberCount(channel.subscriber_count)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Channel Badges */}
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTagColor(channel.tag)}`}>
                        {channel.tag}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getChannelTypeColor(channel.type)}`}>
                        {channel.type}
                      </span>
                    </div>
                  </div>

                  {/* Channel Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="font-semibold text-gray-900">{channel.total_rolls}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Validés</p>
                      <p className="font-semibold text-green-600">{channel.validated_rolls}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">En attente</p>
                      <p className="font-semibold text-yellow-600">{channel.pending_rolls}</p>
                    </div>
                  </div>

                  {/* Domain Badge (if type = Only) */}
                  {channel.domain && (
                    <div className="mb-4">
                      <Badge className="bg-purple-100 text-purple-800">
                        {channel.domain}
                      </Badge>
                    </div>
                  )}

                  {/* Rolled Videos Display */}
                  {channelRolledVideos.length > 0 && (
                    <div className="mb-4 space-y-3">
                      <h4 className="font-medium text-gray-900">Shorts générés ({channelRolledVideos.length}):</h4>
                      {channelRolledVideos.map((rolledVideo) => (
                        <div key={rolledVideo.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-blue-900">Short:</span>
                            <Button
                              onClick={() => openVideoInNewTab(rolledVideo.videoUrl)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Ouvrir dans un nouvel onglet"
                            >
                              <LinkIcon color="#2563EB" size={16} className="text-blue-600" />
                            </Button>
                          </div>
                          <div className="text-sm text-blue-800 bg-blue-100 p-2 rounded font-mono break-all mb-3">
                            {rolledVideo.videoUrl}
                          </div>
                          
                          {/* Action buttons for each video */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleValidate(channel, rolledVideo)}
                              disabled={rolledVideo.isValidating}
                              className="flex-1 py-2 px-3 text-sm font-medium rounded bg-green-600 hover:bg-green-700 text-white transition-all flex items-center justify-center gap-2"
                              title="Valider ce Short"
                            >
                              {rolledVideo.isValidating ? (
                                <>
                                  <SpinLoader />
                                  <span>Validation...</span>
                                </>
                              ) : (
                                <>
                                  <TickCircle color="currentColor" size={16} className="flex-shrink-0" />
                                  <span>Valider</span>
                                </>
                              )}
                            </Button>
                            
                            <Button
                              onClick={() => handleIgnore(channel, rolledVideo)}
                              disabled={rolledVideo.isValidating}
                              className="flex-1 py-2 px-3 text-sm font-medium rounded bg-gray-600 hover:bg-gray-700 text-white transition-all flex items-center justify-center gap-2"
                              title="Ignorer ce Short"
                            >
                              {rolledVideo.isValidating ? (
                                <>
                                  <SpinLoader />
                                  <span>Suppression...</span>
                                </>
                              ) : (
                                <>
                                  <CloseCircle color="currentColor" size={16} className="flex-shrink-0" />
                                  <span>Ignorer</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Roll Button */}
                  <div className="mb-4">
                    <Button
                      onClick={() => handleRoll(channel)}
                      disabled={isRolling}
                      className={`
                        w-full py-3 px-4 font-medium rounded-lg transition-all flex items-center justify-center gap-2
                        ${isRolling 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                        }
                      `}
                      title="Générer un nouveau Short"
                    >
                      {isRolling ? (
                        <>
                          <SpinLoader />
                          <span>Génération...</span>
                        </>
                      ) : (
                        <>
                          <Refresh color="currentColor" size={18} className="flex-shrink-0" />
                          <span>Générer un Short</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Channel URL Link */}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => openVideoInNewTab(channel.youtube_url)}
                      className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2"
                      title="Voir la chaîne YouTube"
                    >
                      <LinkIcon color="#6B7280" size={14} className="text-gray-500" />
                      Voir la chaîne
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RollShortsPage;