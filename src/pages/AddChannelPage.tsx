/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/AddChannelPage.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/forms/Input';
import { CustomSelect } from '@/components/forms/custom-select';
import Button from '@/components/Button';
import FloatingNav from '@/components/FloatingNav';
import { useToast } from '@/context/toast-context';
import { 
  ChannelService, 
  type CreateChannelInput, 
  type TagType, 
  type ChannelType,
  type Channel,
  getTagOptions,
  getTypeOptions,
  formatSubscriberCount,
  getTagColor,
  getChannelTypeColor
} from '@/lib/supabase';
import { extractChannelData } from '@/lib/youtube-api';
import { 
  Youtube, 
  User, 
  TrendUp, 
  Add, 
  Trash, 
  Edit, 
  Save2, 
  CloseCircle,
  Link as LinkIcon
} from 'iconsax-react';
import SpinLoader from '@/components/SpinLoader';

interface EditingChannel extends Partial<CreateChannelInput> {
  id?: string;
  isNew?: boolean;
  isExtracting?: boolean;
  isSaving?: boolean;
}

const AddChannelPage: React.FC = () => {
  const { success, error, info } = useToast();
  
  // State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [editingChannels, setEditingChannels] = useState<Record<string, EditingChannel>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load channels on mount
  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setIsLoading(true);
      const channelsData = await ChannelService.getChannels();
      setChannels(channelsData);
    } catch (err) {
      error('Erreur de chargement', 'Impossible de charger les chaînes');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new row
  const addNewChannel = () => {
    const newId = `new-${Date.now()}`;
    setEditingChannels(prev => ({
      ...prev,
      [newId]: {
        id: newId,
        isNew: true,
        youtube_url: '',
        username: '',
        subscriber_count: 0,
        tag: undefined,
        type: undefined,
        domain: '',
      }
    }));
  };

  // Start editing existing channel
  const startEditing = (channel: Channel) => {
    setEditingChannels(prev => ({
      ...prev,
      [channel.id]: {
        id: channel.id,
        isNew: false,
        youtube_url: channel.youtube_url,
        username: channel.username,
        subscriber_count: channel.subscriber_count,
        tag: channel.tag,
        type: channel.type,
        domain: channel.domain || '',
      }
    }));
  };

  // Cancel editing
  const cancelEditing = (id: string) => {
    setEditingChannels(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  // Update editing channel data
  const updateEditingChannel = (id: string, updates: Partial<EditingChannel>) => {
    setEditingChannels(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updates
      }
    }));
  };

  // Extract channel data from YouTube URL
  const handleUrlExtraction = async (id: string, url: string) => {
    if (!url || url.length < 10) return;

    updateEditingChannel(id, { isExtracting: true });
    
    try {
      info('Extraction des données...', 'Récupération des informations de la chaîne');
      
      const data = await extractChannelData(url);
      
      updateEditingChannel(id, {
        username: data.username,
        subscriber_count: data.subscriber_count,
        isExtracting: false
      });
      
      success('Données extraites !', `${data.username} • ${formatSubscriberCount(data.subscriber_count)} abonnés`);
    } catch (err) {
      updateEditingChannel(id, { isExtracting: false });
      error('Erreur d\'extraction', err instanceof Error ? err.message : 'Impossible de récupérer les données');
    }
  };

  // Save channel
  const saveChannel = async (id: string) => {
    const editingChannel = editingChannels[id];
    if (!editingChannel) return;

    // Validation
    if (!editingChannel.youtube_url || !editingChannel.username || !editingChannel.tag || !editingChannel.type) {
      error('Données incomplètes', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingChannel.type === 'Only' && !editingChannel.domain) {
      error('Domaine requis', 'Veuillez spécifier un domaine pour le type "Only"');
      return;
    }

    updateEditingChannel(id, { isSaving: true });

    try {
      const channelData: CreateChannelInput = {
        youtube_url: editingChannel.youtube_url!,
        username: editingChannel.username!,
        subscriber_count: editingChannel.subscriber_count || 0,
        tag: editingChannel.tag!,
        type: editingChannel.type!,
        domain: editingChannel.domain || undefined,
      };

      if (editingChannel.isNew) {
        await ChannelService.createChannel(channelData);
        success('Chaîne ajoutée !', 'La nouvelle chaîne a été enregistrée');
      } else {
        await ChannelService.updateChannel(editingChannel.id!, channelData);
        success('Chaîne mise à jour !', 'Les modifications ont été sauvegardées');
      }

      // Remove from editing state and reload
      cancelEditing(id);
      loadChannels();
      
    } catch (err) {
      error('Erreur de sauvegarde', 'Impossible d\'enregistrer la chaîne');
    } finally {
      updateEditingChannel(id, { isSaving: false });
    }
  };

  // Delete channel
  const deleteChannel = async (channel: Channel) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la chaîne "${channel.username}" ?`)) {
      return;
    }

    try {
      await ChannelService.deleteChannel(channel.id);
      success('Chaîne supprimée', 'La chaîne a été supprimée avec succès');
      loadChannels();
    } catch (err) {
      error('Erreur de suppression', 'Impossible de supprimer la chaîne');
    }
  };

  // Render table row for existing channel
  const renderChannelRow = (channel: Channel) => {
    const isEditing = editingChannels[channel.id];

    if (isEditing) {
      return renderEditingRow(channel.id, isEditing);
    }

    return (
      <tr key={channel.id} className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Youtube color="#FF0000" size={16} className="text-red-600" />
            <a 
              href={channel.youtube_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              <LinkIcon color="#2563EB" size={14} className="text-blue-600" />
            </a>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <User color="#6B7280" size={16} className="text-gray-500" />
            <span className="font-medium text-gray-900">{channel.username}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <TrendUp color="#6B7280" size={14} className="text-gray-500" />
            {formatSubscriberCount(channel.subscriber_count)}
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getTagColor(channel.tag)}`}>
            {channel.tag}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getChannelTypeColor(channel.type)}`}>
            {channel.type}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-600">
            {channel.domain || '-'}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => startEditing(channel)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit color="#2563EB" size={16} className="text-blue-600" />
            </Button>
            <Button
              onClick={() => deleteChannel(channel)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash color="#EF4444" size={16} className="text-red-600" />
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  // Render editing row
  const renderEditingRow = (id: string, editingChannel: EditingChannel) => {
    return (
      <tr key={id} className="bg-blue-50 border border-blue-200">
        <td className="px-6 py-4">
          <Input
            placeholder="https://youtube.com/@channel"
            value={editingChannel.youtube_url || ''}
            onChange={(e) => {
              updateEditingChannel(id, { youtube_url: e.target.value });
              // Auto-extract on URL change with debounce
              clearTimeout((window as any)[`extract-${id}`]);
              (window as any)[`extract-${id}`] = setTimeout(() => {
                handleUrlExtraction(id, e.target.value);
              }, 1000);
            }}
            className="text-sm"
          />
        </td>
        <td className="px-6 py-4">
          <div className="relative">
            <Input
              placeholder="@username"
              value={editingChannel.username || ''}
              onChange={(e) => updateEditingChannel(id, { username: e.target.value })}
              disabled={editingChannel.isExtracting}
              className="text-sm"
            />
            {editingChannel.isExtracting && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <SpinLoader />
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-600">
            {editingChannel.subscriber_count ? formatSubscriberCount(editingChannel.subscriber_count) : '-'}
          </span>
        </td>
        <td className="px-6 py-4">
          <CustomSelect
            options={getTagOptions()}
            value={editingChannel.tag || null}
            onChange={(value) => updateEditingChannel(id, { tag: value as TagType })}
            placeholder="Tag"
          />
        </td>
        <td className="px-6 py-4">
          <CustomSelect
            options={getTypeOptions()}
            value={editingChannel.type || null}
            onChange={(value) => updateEditingChannel(id, { type: value as ChannelType })}
            placeholder="Type"
          />
        </td>
        <td className="px-6 py-4">
          {editingChannel.type === 'Only' ? (
            <Input
              placeholder="Gaming, Tech, Music..."
              value={editingChannel.domain || ''}
              onChange={(e) => updateEditingChannel(id, { domain: e.target.value })}
              className="text-sm"
            />
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => saveChannel(id)}
              disabled={editingChannel.isSaving || editingChannel.isExtracting}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Sauvegarder"
            >
              {editingChannel.isSaving ? (
                <SpinLoader />
              ) : (
                <Save2 color="#10B981" size={16} className="text-green-600" />
              )}
            </Button>
            <Button
              onClick={() => cancelEditing(id)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Annuler"
            >
              <CloseCircle color="#6B7280" size={16} className="text-gray-600" />
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SpinLoader />
          <p className="mt-4 text-gray-600">Chargement des chaînes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion des Chaînes
            </h1>
            <p className="text-gray-600">
              Ajoutez et gérez vos chaînes YouTube pour le traitement des Shorts
            </p>
          </div>
          
          <Button
            onClick={addNewChannel}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Add color="white" size={20} className="text-white" />
            Ajouter une chaîne
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonnés
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tag
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domaine
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Existing channels */}
                {channels.map(renderChannelRow)}
                
                {/* New editing rows */}
                {Object.entries(editingChannels)
                  .filter(([_, channel]) => channel.isNew)
                  .map(([id, channel]) => renderEditingRow(id, channel))
                }
                
                {/* Empty state */}
                {channels.length === 0 && Object.keys(editingChannels).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Youtube color="#9CA3AF" size={48} className="text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Aucune chaîne enregistrée
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Commencez par ajouter votre première chaîne YouTube
                        </p>
                        <Button
                          onClick={addNewChannel}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Add color="white" size={20} className="text-white" />
                          Ajouter une chaîne
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Card */}
        {channels.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {channels.length}
                </div>
                <div className="text-sm text-gray-600">Chaînes totales</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {channels.reduce((sum, ch) => sum + ch.subscriber_count, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Abonnés cumulés</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {channels.filter(ch => ch.type === 'Mix').length}
                </div>
                <div className="text-sm text-gray-600">Chaînes Mix</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {channels.filter(ch => ch.type === 'Only').length}
                </div>
                <div className="text-sm text-gray-600">Chaînes Spécialisées</div>
              </div>
            </div>
          </div>
        )}

        {/* Tag Distribution */}
        {channels.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Tag</h3>
            <div className="flex flex-wrap gap-3">
              {getTagOptions().map(tag => {
                const count = channels.filter(ch => ch.tag === tag.value).length;
                if (count === 0) return null;
                
                return (
                  <div key={tag.value} className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag.value as TagType)}`}>
                      {tag.value}
                    </span>
                    <span className="text-sm text-gray-600">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
              <Youtube color="#3B82F6" size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Guide d'utilisation</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Cliquez sur "Ajouter une chaîne" pour créer une nouvelle entrée</li>
                <li>• Collez l'URL YouTube et les données seront extraites automatiquement</li>
                <li>• Sélectionnez le tag de langue (VF, VOSTFR, VA, VOSTA, VO)</li>
                <li>• Choisissez le type: Mix (contenu varié) ou Only (domaine spécifique)</li>
                <li>• Pour le type "Only", spécifiez le domaine (Gaming, Tech, Music, etc.)</li>
                <li>• Utilisez les boutons d'action pour modifier ou supprimer une chaîne</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddChannelPage;