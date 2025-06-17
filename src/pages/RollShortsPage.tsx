/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/RollShortsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useToast } from '@/context/toast-context';
import { 
  ChannelService, 
  ShortsService, 
  type ChannelWithStats, 
  type TagType,
  formatSubscriberCount,
  getTagColor,
  getChannelTypeColor,
  getTagOptions,
  getTypeOptions
} from '@/lib/supabase';
import { getChannelShorts } from '@/lib/youtube-api';
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
  rollId: string;
}

type SortField = 'username' | 'subscriber_count' | 'total_rolls' | 'validated_rolls' | 'pending_rolls' | 'tag' | 'type';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  tag: string | null;
  type: string | null;
  search: string;
  hasActivity: boolean | null; // Filter for channels with/without activity
}

const RollShortsPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error, info, warning } = useToast();
  
  // State management
  const [channels, setChannels] = useState<ChannelWithStats[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<ChannelWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rollingStates, setRollingStates] = useState<Record<string, boolean>>({});
  const [rolledVideos, setRolledVideos] = useState<Record<string, RolledVideo[]>>({});

  // Filter and sort states
  const [filters, setFilters] = useState<FilterState>({
    tag: null,
    type: null,
    search: '',
    hasActivity: null
  });
  const [sortField, setSortField] = useState<SortField>('pending_rolls');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Load channels on component mount
  useEffect(() => {
    loadChannels();
  }, []);

  // Apply filters and sorting when data or filters change
  useEffect(() => {
    applyFiltersAndSort();
  }, [channels, filters, sortField, sortDirection]);

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

  const applyFiltersAndSort = () => {
    let filtered = [...channels];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(channel => 
        channel.username.toLowerCase().includes(searchTerm) ||
        channel.youtube_url.toLowerCase().includes(searchTerm) ||
        (channel.domain && channel.domain.toLowerCase().includes(searchTerm))
      );
    }

    // Apply tag filter
    if (filters.tag) {
      filtered = filtered.filter(channel => channel.tag === filters.tag);
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(channel => channel.type === filters.type);
    }

    // Apply activity filter
    if (filters.hasActivity !== null) {
      filtered = filtered.filter(channel => {
        const hasActivity = channel.total_rolls > 0;
        return filters.hasActivity ? hasActivity : !hasActivity;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle different data types
      if (['subscriber_count', 'total_rolls', 'validated_rolls', 'pending_rolls'].includes(sortField)) {
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
      tag: null,
      type: null,
      search: '',
      hasActivity: null
    });
  };

  // OPTIMIZED: Load all pending rolls with a single query
  const loadPendingRolls = async (channelsData: ChannelWithStats[]) => {
    try {
      // Get all unvalidated shorts in a single query
      const shortsByChannel = await ShortsService.getUnvalidatedShortsByChannel();
      
      // Transform the data to match our component state structure
      const newRolledVideos: Record<string, RolledVideo[]> = {};
      
      // Initialize empty arrays for all channels
      for (const channel of channelsData) {
        const channelShorts = shortsByChannel[channel.id] || [];
        newRolledVideos[channel.id] = channelShorts.map(roll => ({
          id: `${channel.id}-${roll.id}`,
          channelId: channel.id,
          videoUrl: roll.video_url,
          isValidating: false,
          rollId: roll.id
        }));
      }
      
      setRolledVideos(newRolledVideos);
    } catch (err) {
      console.error('Error loading pending rolls:', err);
      error('Erreur de chargement', 'Impossible de charger les shorts en attente');
    }
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
  const totalValidated = filteredChannels.reduce((sum, ch) => sum + ch.validated_rolls, 0);
  const totalPending = filteredChannels.reduce((sum, ch) => sum + ch.pending_rolls, 0);
  const totalSubscribers = filteredChannels.reduce((sum, ch) => sum + ch.subscriber_count, 0);

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
              
              {(filters.tag || filters.type || filters.search || filters.hasActivity !== null) && (
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
                  label="Filtrer par tag"
                  options={[{ value: '', label: 'Tous les tags' }, ...getTagOptions()]}
                  value={filters.tag || ''}
                  onChange={(value) => setFilters(prev => ({ ...prev, tag: value || null }))}
                  placeholder="Sélectionner un tag"
                />
              </div>
              
              <div>
                <CustomSelect
                  label="Filtrer par type"
                  options={[{ value: '', label: 'Tous les types' }, ...getTypeOptions()]}
                  value={filters.type || ''}
                  onChange={(value) => setFilters(prev => ({ ...prev, type: value || null }))}
                  placeholder="Sélectionner un type"
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
              onClick={() => handleSort('subscriber_count')}
              className={getSortButtonClass('subscriber_count')}
            >
              <span>Abonnés</span>
              {renderSortIcon('subscriber_count')}
            </Button>
            
            <Button
              onClick={() => handleSort('pending_rolls')}
              className={getSortButtonClass('pending_rolls')}
            >
              <span>En attente</span>
              {renderSortIcon('pending_rolls')}
            </Button>
            
            <Button
              onClick={() => handleSort('validated_rolls')}
              className={getSortButtonClass('validated_rolls')}
            >
              <span>Validés</span>
              {renderSortIcon('validated_rolls')}
            </Button>
            
            <Button
              onClick={() => handleSort('total_rolls')}
              className={getSortButtonClass('total_rolls')}
            >
              <span>Total rolls</span>
              {renderSortIcon('total_rolls')}
            </Button>
            
            <Button
              onClick={() => handleSort('tag')}
              className={getSortButtonClass('tag')}
            >
              <span>Tag</span>
              {renderSortIcon('tag')}
            </Button>
            
            <Button
              onClick={() => handleSort('type')}
              className={getSortButtonClass('type')}
            >
              <span>Type</span>
              {renderSortIcon('type')}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredChannels.length} chaîne{filteredChannels.length > 1 ? 's' : ''} trouvée{filteredChannels.length > 1 ? 's' : ''}
          {channels.length !== filteredChannels.length && ` sur ${channels.length} au total`}
        </p>
        
        <Button
          onClick={loadChannels}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          title="Actualiser"
        >
          <Refresh color="#6B7280" size={16} className="text-gray-500" />
        </Button>
      </div>

      {/* Channels Grid */}
      {filteredChannels.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          {channels.length === 0 ? (
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
                        <span>{formatSubscriberCount(channel.subscriber_count)} abonnés</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Channel Link */}
                  <Button
                    onClick={() => openVideoInNewTab(channel.youtube_url)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                    title="Voir la chaîne YouTube"
                  >
                    <LinkIcon color="#6B7280" size={16} className="text-gray-500" />
                  </Button>
                </div>

                {/* Channel Tags */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTagColor(channel.tag)}`}>
                    {channel.tag}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getChannelTypeColor(channel.type)}`}>
                    {channel.type}
                  </span>
                  {channel.domain && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {channel.domain}
                    </span>
                  )}
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

      {/* Tag Distribution (only show if there are channels) */}
      {channels.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Tag</h3>
          <div className="flex flex-wrap gap-3">
            {getTagOptions().map(tag => {
              const count = channels.filter(ch => ch.tag === tag.value).length;
              const filteredCount = filteredChannels.filter(ch => ch.tag === tag.value).length;
              
              if (count === 0) return null;
              
              return (
                <div key={tag.value} className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      tag: prev.tag === tag.value ? null : tag.value 
                    }))}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.tag === tag.value
                        ? getTagColor(tag.value as TagType)
                        : `${getTagColor(tag.value as TagType)} opacity-60 hover:opacity-100`
                    }`}
                  >
                    {tag.value}
                  </button>
                  <span className="text-sm text-gray-600">
                    ({filters.tag ? filteredCount : count})
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
                  {filteredChannels.filter(ch => ch.total_rolls > 0).length}
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