/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/AddChannelPage.tsx
import React, { useState, useEffect } from 'react';
import Button from '@/components/Button';
import { SearchInput } from '@/components/forms/search-input';
import { CustomSelect } from '@/components/forms/custom-select';
import SpinLoader from '@/components/SpinLoader';
import { ChannelModal } from '@/components/modal/ChannelModal';
import { DeleteModal } from '@/components/modal/DeleteModal';
import { 
  ChannelService, 
  type Channel,
  type TagType,
  formatSubscriberCount,
  getTagColor,
  getChannelTypeColor,
  getTagOptions,
  getTypeOptions
} from '@/lib/supabase';
import { 
  Youtube, 
  User, 
  TrendUp, 
  Add, 
  Trash, 
  Edit, 
  Link as LinkIcon,
  SearchNormal1,
  Filter,
  CloseCircle,
  ArrowUp2,
  ArrowDown2
} from 'iconsax-react';

type SortField = 'username' | 'subscriber_count' | 'created_at' | 'tag' | 'type';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  tag: string | null;
  type: string | null;
  search: string;
}

const AddChannelPage: React.FC = () => {
  // State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [deletingChannel, setDeletingChannel] = useState<Channel | null>(null);
  
  // Filter and sort states
  const [filters, setFilters] = useState<FilterState>({
    tag: null,
    type: null,
    search: ''
  });
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Load channels on mount
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
      const channelsData = await ChannelService.getChannels();
      setChannels(channelsData);
    } catch (err) {
      console.error('Error loading channels:', err);
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

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle different data types
      if (sortField === 'subscriber_count') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
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
      search: ''
    });
  };

  const openAddModal = () => {
    setEditingChannel(null);
    setIsChannelModalOpen(true);
  };

  const openEditModal = (channel: Channel) => {
    setEditingChannel(channel);
    setIsChannelModalOpen(true);
  };

  const openDeleteModal = (channel: Channel) => {
    setDeletingChannel(channel);
    setIsDeleteModalOpen(true);
  };

  const handleModalSave = () => {
    loadChannels();
  };

  const handleDeleteComplete = () => {
    loadChannels();
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
            Gestion des Chaînes
          </h1>
          <p className="text-gray-600">
            Ajoutez et gérez vos chaînes YouTube pour le traitement des Shorts
          </p>
        </div>
        
        <Button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium rounded-lg transition-colors flex items-center gap-2 lg:flex-shrink-0"
        >
          <Add color="white" size={20} className="text-white" />
          Ajouter une chaîne
        </Button>
      </div>

      {/* Stats Cards */}
      {channels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <Youtube color="#FF0000" size={24} className="text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Chaînes totales</p>
                <p className="text-xl font-bold text-gray-900">{channels.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <TrendUp color="#10B981" size={24} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Abonnés cumulés</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatSubscriberCount(channels.reduce((sum, ch) => sum + ch.subscriber_count, 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <User color="#3B82F6" size={24} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Chaînes Mix</p>
                <p className="text-xl font-bold text-gray-900">
                  {channels.filter(ch => ch.type === 'Mix').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <Filter color="#8B5CF6" size={24} className="text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Spécialisées</p>
                <p className="text-xl font-bold text-gray-900">
                  {channels.filter(ch => ch.type === 'Only').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              
              {(filters.tag || filters.type || filters.search) && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
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
            
            <Button
              onClick={() => handleSort('created_at')}
              className={getSortButtonClass('created_at')}
            >
              <span>Date d'ajout</span>
              {renderSortIcon('created_at')}
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
      </div>

      {/* Channels Grid */}
      {filteredChannels.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          {channels.length === 0 ? (
            // No channels at all
            <>
              <Youtube color="#9CA3AF" size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune chaîne enregistrée
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par ajouter votre première chaîne YouTube pour traiter des Shorts
              </p>
              <Button
                onClick={openAddModal}
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
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* Channel Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
                    <Youtube color="#FF0000" size={20} className="text-red-600" />
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
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    onClick={() => window.open(channel.youtube_url, '_blank')}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Voir la chaîne YouTube"
                  >
                    <LinkIcon color="#6B7280" size={16} className="text-gray-500" />
                  </Button>
                  <Button
                    onClick={() => openEditModal(channel)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit color="#6B7280" size={16} className="text-gray-500" />
                  </Button>
                  <Button
                    onClick={() => openDeleteModal(channel)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash color="#6B7280" size={16} className="text-gray-500" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTagColor(channel.tag)}`}>
                  {channel.tag}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getChannelTypeColor(channel.type)}`}>
                  {channel.type}
                </span>
              </div>

              {/* Domain (if Only type) */}
              {channel.domain && (
                <div className="mb-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    {channel.domain}
                  </span>
                </div>
              )}

              {/* URL Preview */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <User color="#6B7280" size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate font-mono">
                    {channel.youtube_url}
                  </span>
                </div>
              </div>

              {/* Footer with creation date */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Ajoutée le {new Date(channel.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
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

      {/* Modals */}
      <ChannelModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        onSave={handleModalSave}
        editingChannel={editingChannel}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteComplete}
        channel={deletingChannel}
      />
    </div>
  );
};

export default AddChannelPage;