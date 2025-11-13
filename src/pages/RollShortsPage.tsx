/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/RollShortsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useToast } from '@/context/toast-context';
import { useChannels, formatSubscriberCount, getLanguageColor } from '@/hooks/useChannels';
import { useVideos, useRollVideos, useUpdateVideoStatus } from '@/hooks/useVideos';
import type { Channel, ChannelLanguage } from '@/types/graphql';
import { VideoStatus } from '@/types/graphql';
import Button from '@/components/Button';
import SpinLoader from '@/components/SpinLoader';
import { SearchInput } from '@/components/forms/search-input';
import { CustomSelect } from '@/components/forms/custom-select';
import { 
  Youtube, 
  TickCircle, 
  Refresh, 
  User, 
  TrendUp,
  Link as LinkIcon,
  VideoPlay,
  CloseCircle,
  Timer,
  Add,
  Filter,
  SearchNormal1,
  ArrowUp2,
  ArrowDown2
} from 'iconsax-react';

interface RolledVideo {
  id: string;
  channelId: string;
  videoUrl: string;
  isValidating: boolean;
  videoId: string;
  rollId: string;
}

interface ChannelWithVideoStats extends Channel {
  totalVideos?: number;
  validatedVideos?: number;
  pendingVideos?: number;
}

type SortField = 'username' | 'subscriberCount' | 'totalVideos' | 'validatedVideos' | 'pendingVideos' | 'language';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  language: string | null;
  search: string;
  hasActivity: boolean | null; // Filter for channels with/without activity
}

// Language options for the filter
const getLanguageOptions = () => [
  { value: 'FR', label: 'Français' },
  { value: 'EN', label: 'Anglais' },
  { value: 'ES', label: 'Espagnol' },
  { value: 'DE', label: 'Allemand' },
  { value: 'IT', label: 'Italien' },
  { value: 'PT', label: 'Portugais' },
  { value: 'AR', label: 'Arabe' },
  { value: 'OTHER', label: 'Autre' }
];

const RollShortsPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  // GraphQL hooks
  const { channels: allChannels, loading: isLoading, refetch: refetchChannels } = useChannels();
  const { videos: allVideos, refetch: refetchVideos } = useVideos();
  const { rollVideos } = useRollVideos();
  const { updateStatus } = useUpdateVideoStatus();

  // State management
  const [channelsWithStats, setChannelsWithStats] = useState<ChannelWithVideoStats[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<ChannelWithVideoStats[]>([]);
  const [rollingStates, setRollingStates] = useState<Record<string, boolean>>({});
  const [rolledVideos, setRolledVideos] = useState<Record<string, RolledVideo[]>>({});

  // Filter and sort states
  const [filters, setFilters] = useState<FilterState>({
    language: null,
    search: '',
    hasActivity: null
  });
  const [sortField, setSortField] = useState<SortField>('pendingVideos');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate stats for channels when channels or videos change
  useEffect(() => {
    if (!allChannels || !allVideos) {
      setChannelsWithStats([]);
      return;
    }

    const channelsWithStatsData: ChannelWithVideoStats[] = allChannels.map(channel => {
      const channelVideos = allVideos.filter(v => v.sourceChannel.id === channel.id);
      return {
        ...channel,
        totalVideos: channelVideos.length,
        validatedVideos: channelVideos.filter(v => v.status === VideoStatus.VALIDATED).length,
        pendingVideos: channelVideos.filter(v => v.status === VideoStatus.ROLLED).length
      };
    });

    setChannelsWithStats(channelsWithStatsData);
  }, [allChannels, allVideos]);

  // Apply filters and sorting when data or filters change
  useEffect(() => {
    applyFiltersAndSort();
  }, [channelsWithStats, filters, sortField, sortDirection]);

  const applyFiltersAndSort = () => {
    if (!channelsWithStats) {
      setFilteredChannels([]);
      return;
    }

    let filtered = [...channelsWithStats];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(channel =>
        channel.username.toLowerCase().includes(searchTerm) ||
        channel.youtubeUrl.toLowerCase().includes(searchTerm) ||
        (channel.channelId && channel.channelId.toLowerCase().includes(searchTerm))
      );
    }

    // Apply language filter
    if (filters.language) {
      filtered = filtered.filter(channel => channel.language === filters.language);
    }

    // Apply activity filter
    if (filters.hasActivity !== null) {
      filtered = filtered.filter(channel => {
        const hasActivity = (channel.totalVideos || 0) > 0;
        return filters.hasActivity ? hasActivity : !hasActivity;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle different data types
      if (['subscriberCount', 'totalVideos', 'validatedVideos', 'pendingVideos'].includes(sortField)) {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredChannels(filtered);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setFilters({
      language: null,
      search: '',
      hasActivity: null
    });
  };

  const handleRoll = async (channel: ChannelWithVideoStats) => {
    try {
      setRollingStates(prev => ({ ...prev, [channel.id]: true }));
      info('Génération en cours...', `Recherche d'un Short pour ${channel.username}`);

      // Create a new video using GraphQL mutation
      // The rollVideos mutation will automatically select a random Short from the channel
      const newVideos = await rollVideos({
        sourceChannelIds: [channel.id],
        count: 1
      });

      if (!newVideos || newVideos.length === 0) {
        error('Erreur de création', 'Impossible de créer la vidéo');
        return;
      }

      // Add to local state
      const createdVideo = newVideos[0];
      const newRolledVideo: RolledVideo = {
        id: `${channel.id}-${createdVideo.id}`,
        channelId: channel.id,
        videoUrl: createdVideo.sourceVideoUrl,
        isValidating: false,
        videoId: createdVideo.id,
        rollId: createdVideo.id
      };

      setRolledVideos(prev => ({
        ...prev,
        [channel.id]: [...(prev[channel.id] || []), newRolledVideo]
      }));

      // Refresh videos list
      await refetchVideos();

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

  const handleValidate = async (channel: ChannelWithVideoStats, rolledVideo: RolledVideo) => {
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

      await updateStatus({
        videoId: rolledVideo.rollId,
        status: VideoStatus.VALIDATED
      });
      success('Short validé !', 'Cette vidéo ne sera plus proposée');

      // Remove from rolled videos
      setRolledVideos(prev => ({
        ...prev,
        [channel.id]: prev[channel.id].filter(video => video.id !== rolledVideo.id)
      }));

      // Refresh data
      await refetchVideos();
      await refetchChannels();
      
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

  const handleIgnore = async (channel: ChannelWithVideoStats, rolledVideo: RolledVideo) => {
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

      // Update video status to REJECTED (or we could delete it)
      await updateStatus({
        videoId: rolledVideo.rollId,
        status: VideoStatus.REJECTED
      });
      info('Short ignoré', 'Cette vidéo a été marquée comme rejetée');

      // Remove from rolled videos
      setRolledVideos(prev => ({
        ...prev,
        [channel.id]: prev[channel.id].filter(video => video.id !== rolledVideo.id)
      }));

      // Refresh data
      await refetchVideos();
      await refetchChannels();
      
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
    navigate('/dashboard/add-channel');
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <ArrowUp2 color="#6B7280" size={14} className="text-gray-500" />
    ) : (
      <ArrowDown2 color="#6B7280" size={14} className="text-gray-500" />
    );
  };

  const getSortButtonClass = (field: SortField) => {
    return `flex items-center gap-1 text-sm font-medium transition-colors ${
      sortField === field 
        ? 'text-red-600' 
        : 'text-gray-600 hover:text-gray-900'
    }`;
  };

  // Calculate total stats
  const totalValidated = filteredChannels.reduce((sum, ch) => sum + (ch.validatedVideos || 0), 0);
  const totalPending = filteredChannels.reduce((sum, ch) => sum + (ch.pendingVideos || 0), 0);
  const totalSubscribers = filteredChannels.reduce((sum, ch) => sum + (ch.subscriberCount || 0), 0);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <SpinLoader />
          <p className="mt-4 text-gray-600">Chargement des chaînes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Générateur de Shorts
          </h1>
          <p className="text-gray-600">
            Générez et validez des YouTube Shorts depuis vos chaînes enregistrées
          </p>
        </div>
        
        <Button
          onClick={navigateToAddChannel}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium rounded-lg transition-colors flex items-center gap-2 lg:flex-shrink-0"
        >
          <Add color="white" size={20} className="text-white" />
          Ajouter une chaîne
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Youtube color="#FF0000" size={24} className="text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Chaînes filtrées</p>
              <p className="text-xl font-bold text-gray-900">{filteredChannels.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <TickCircle color="#10B981" size={24} className="text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Shorts validés</p>
              <p className="text-xl font-bold text-gray-900">{totalValidated}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Timer color="#F59E0B" size={24} className="text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-xl font-bold text-gray-900">{totalPending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <TrendUp color="#8B5CF6" size={24} className="text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Abonnés cumulés</p>
              <p className="text-xl font-bold text-gray-900">{formatSubscriberCount(totalSubscribers)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Rechercher par nom, URL ou domaine..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                showSearchIcon={true}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter color={showFilters ? "#DC2626" : "#6B7280"} size={16} className={showFilters ? "text-red-600" : "text-gray-500"} />
                Filtres
              </Button>
              
              {(filters.language || filters.search || filters.hasActivity !== null) && (
                <Button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <CloseCircle color="#6B7280" size={16} className="text-gray-500" />
                  Effacer
                </Button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <CustomSelect
                  label="Filtrer par langue"
                  options={[{ value: '', label: 'Toutes les langues' }, ...getLanguageOptions()]}
                  value={filters.language || ''}
                  onChange={(value) => setFilters(prev => ({ ...prev, language: value || null }))}
                  placeholder="Sélectionner une langue"
                />
              </div>

              <div>
                <CustomSelect
                  label="Activité"
                  options={[
                    { value: '', label: 'Toutes les chaînes' },
                    { value: 'active', label: 'Avec activity' },
                    { value: 'inactive', label: 'Sans activité' }
                  ]}
                  value={filters.hasActivity === null ? '' : (filters.hasActivity ? 'active' : 'inactive')}
                  onChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    hasActivity: value === '' ? null : value === 'active'
                  }))}
                  placeholder="Filtrer par activité"
                />
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700">Trier par:</span>

            <Button
              onClick={() => handleSort('username')}
              className={getSortButtonClass('username')}
            >
              <span>Nom</span>
              {renderSortIcon('username')}
            </Button>

            <Button
              onClick={() => handleSort('subscriberCount')}
              className={getSortButtonClass('subscriberCount')}
            >
              <span>Abonnés</span>
              {renderSortIcon('subscriberCount')}
            </Button>

            <Button
              onClick={() => handleSort('pendingVideos')}
              className={getSortButtonClass('pendingVideos')}
            >
              <span>En attente</span>
              {renderSortIcon('pendingVideos')}
            </Button>

            <Button
              onClick={() => handleSort('validatedVideos')}
              className={getSortButtonClass('validatedVideos')}
            >
              <span>Validés</span>
              {renderSortIcon('validatedVideos')}
            </Button>

            <Button
              onClick={() => handleSort('totalVideos')}
              className={getSortButtonClass('totalVideos')}
            >
              <span>Total videos</span>
              {renderSortIcon('totalVideos')}
            </Button>

            <Button
              onClick={() => handleSort('language')}
              className={getSortButtonClass('language')}
            >
              <span>Langue</span>
              {renderSortIcon('language')}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredChannels.length} chaîne{filteredChannels.length > 1 ? 's' : ''} trouvée{filteredChannels.length > 1 ? 's' : ''}
          {channelsWithStats.length !== filteredChannels.length && ` sur ${channelsWithStats.length} au total`}
        </p>

        <Button
          onClick={() => refetchChannels()}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          title="Actualiser"
        >
          <Refresh color="#6B7280" size={16} className="text-gray-500" />
        </Button>
      </div>

      {/* Channels Grid */}
      {filteredChannels.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          {!allChannels || allChannels.length === 0 ? (
            // No channels at all
            <>
              <VideoPlay color="#9CA3AF" size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune chaîne disponible
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par ajouter des chaînes YouTube pour générer des Shorts
              </p>
              <Button
                onClick={navigateToAddChannel}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Add color="white" size={20} className="text-white" />
                Ajouter votre première chaîne
              </Button>
            </>
          ) : (
            // No results for current filters
            <>
              <SearchNormal1 color="#9CA3AF" size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-600 mb-6">
                Aucune chaîne ne correspond à vos critères de recherche
              </p>
              <Button
                onClick={clearFilters}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <CloseCircle color="white" size={20} className="text-white" />
                Effacer les filtres
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredChannels.map((channel) => {
            const isRolling = rollingStates[channel.id];
            const channelRolledVideos = rolledVideos[channel.id] || [];
            
            return (
              <div key={channel.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                {/* Channel Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
                      <User color="#FF0000" size={20} className="text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate" title={channel.username}>
                        {channel.username}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <TrendUp color="#6B7280" size={14} className="text-gray-500" />
                        <span>{formatSubscriberCount(channel.subscriberCount || 0)} abonnés</span>
                      </div>
                    </div>
                  </div>

                  {/* Channel Link */}
                  <Button
                    onClick={() => openVideoInNewTab(channel.youtubeUrl)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                    title="Voir la chaîne YouTube"
                  >
                    <LinkIcon color="#6B7280" size={16} className="text-gray-500" />
                  </Button>
                </div>

                {/* Channel Tags */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLanguageColor(channel.language)}`}>
                    {channel.language}
                  </span>
                  {channel.channelId && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium font-mono">
                      {channel.channelId.substring(0, 8)}...
                    </span>
                  )}
                </div>

                {/* Channel Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-semibold text-gray-900">{channel.totalVideos || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Validés</p>
                    <p className="font-semibold text-green-600">{channel.validatedVideos || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">En attente</p>
                    <p className="font-semibold text-yellow-600">{channel.pendingVideos || 0}</p>
                  </div>
                </div>

                {/* Rolled Videos Display */}
                {channelRolledVideos.length > 0 && (
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Shorts générés</h4>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {channelRolledVideos.length}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {channelRolledVideos.map((rolledVideo) => (
                        <div key={rolledVideo.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-blue-900">YouTube Short</span>
                            <Button
                              onClick={() => openVideoInNewTab(rolledVideo.videoUrl)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Ouvrir dans un nouvel onglet"
                            >
                              <LinkIcon color="#2563EB" size={12} className="text-blue-600" />
                            </Button>
                          </div>
                          
                          <div className="text-xs text-blue-800 bg-blue-100 p-2 rounded font-mono break-all mb-3">
                            {rolledVideo.videoUrl}
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleValidate(channel, rolledVideo)}
                              disabled={rolledVideo.isValidating}
                              className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all flex items-center justify-center gap-1"
                            >
                              {rolledVideo.isValidating ? (
                                <>
                                  <SpinLoader />
                                  <span>Validation...</span>
                                </>
                              ) : (
                                <>
                                  <TickCircle color="currentColor" size={12} className="flex-shrink-0" />
                                  <span>Valider</span>
                                </>
                              )}
                            </Button>
                            
                            <Button
                              onClick={() => handleIgnore(channel, rolledVideo)}
                              disabled={rolledVideo.isValidating}
                              className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-all flex items-center justify-center gap-1"
                            >
                              {rolledVideo.isValidating ? (
                                <>
                                  <SpinLoader />
                                  <span>Suppression...</span>
                                </>
                              ) : (
                                <>
                                  <CloseCircle color="currentColor" size={12} className="flex-shrink-0" />
                                  <span>Ignorer</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Roll Button */}
                <div className="pt-4 border-t border-gray-200">
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
                  >
                    {isRolling ? (
                      <>
                        <SpinLoader />
                        <span>Génération...</span>
                      </>
                    ) : (
                      <>
                        <VideoPlay color="currentColor" size={18} className="flex-shrink-0" />
                        <span>Générer un Short</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Language Distribution (only show if there are channels) */}
      {allChannels && allChannels.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Langue</h3>
          <div className="flex flex-wrap gap-3">
            {getLanguageOptions().map(lang => {
              const count = allChannels.filter(ch => ch.language === lang.value).length;
              const filteredCount = filteredChannels.filter(ch => ch.language === lang.value).length;

              if (count === 0) return null;

              return (
                <div key={lang.value} className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      language: prev.language === lang.value ? null : lang.value
                    }))}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.language === lang.value
                        ? getLanguageColor(lang.value as ChannelLanguage)
                        : `${getLanguageColor(lang.value as ChannelLanguage)} opacity-60 hover:opacity-100`
                    }`}
                  >
                    {lang.label}
                  </button>
                  <span className="text-sm text-gray-600">
                    ({filters.language ? filteredCount : count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Summary (only show if there are channels) */}
      {filteredChannels.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance des Chaînes Filtrées</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Validation Rate */}
            <div className="text-center">
              <div className="mb-2">
                <span className="text-2xl font-bold text-green-600">
                  {totalValidated + totalPending > 0 
                    ? Math.round((totalValidated / (totalValidated + totalPending)) * 100)
                    : 0
                  }%
                </span>
              </div>
              <p className="text-sm text-gray-600">Taux de validation</p>
            </div>
            
            {/* Active Channels */}
            <div className="text-center">
              <div className="mb-2">
                <span className="text-2xl font-bold text-blue-600">
                  {filteredChannels.filter(ch => (ch.totalVideos || 0) > 0).length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Chaînes actives</p>
            </div>
            
            {/* Average per Channel */}
            <div className="text-center">
              <div className="mb-2">
                <span className="text-2xl font-bold text-purple-600">
                  {filteredChannels.length > 0 
                    ? Math.round((totalValidated + totalPending) / filteredChannels.length)
                    : 0
                  }
                </span>
              </div>
              <p className="text-sm text-gray-600">Moyenne par chaîne</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RollShortsPage;