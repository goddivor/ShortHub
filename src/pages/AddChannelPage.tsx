/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/AddChannelPage.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/forms/Input';
import { CustomSelect } from '@/components/forms/custom-select';
// import Button from '@/components/Button';
import { useToast } from '@/context/toast-context';
import { ChannelService, type CreateChannelInput, type TagType, type ChannelType } from '@/lib/supabase';
import { Youtube, User, TrendUp } from 'iconsax-react';
import SpinLoader from '@/components/SpinLoader';

// Mock YouTube API function - replace with real implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const extractChannelData = async (url: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock data extraction
  const mockData = {
    username: '@TechReviewChannel',
    subscriber_count: 125000,
  };
  
  return mockData;
};

const AddChannelPage: React.FC = () => {
  const { success, error, info } = useToast();
  
  // Form state
  const [formData, setFormData] = useState<Partial<CreateChannelInput>>({
    youtube_url: '',
    username: '',
    subscriber_count: 0,
    tag: undefined,
    type: undefined,
    domain: '',
  });
  
  // UI state
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<{ username: string; subscriber_count: number } | null>(null);
  const [showDomainField, setShowDomainField] = useState(false);

  // Tag options
  const tagOptions = [
    { value: 'VF', label: 'VF (Version Française)' },
    { value: 'VOSTFR', label: 'VOSTFR (Version Originale Sous-titrée Français)' },
    { value: 'VA', label: 'VA (Version Anglaise)' },
    { value: 'VOSTA', label: 'VOSTA (Version Originale Sous-titrée Anglais)' },
  ];

  // Type options
  const typeOptions = [
    { value: 'Mix', label: 'Mix (Contenu varié)' },
    { value: 'Only', label: 'Only (Domaine spécifique)' },
  ];

  // Domain options (when type = "Only")
  const domainOptions = [
    { value: 'Gaming', label: 'Gaming' },
    { value: 'Tech', label: 'Tech & Reviews' },
    { value: 'Music', label: 'Music' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Education', label: 'Education' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Lifestyle', label: 'Lifestyle' },
    { value: 'Comedy', label: 'Comedy' },
    { value: 'News', label: 'News & Politics' },
    { value: 'Science', label: 'Science' },
  ];

  // Extract channel data when URL changes
  useEffect(() => {
    const extractData = async () => {
      if (!formData.youtube_url || formData.youtube_url.length < 10) {
        setExtractedData(null);
        return;
      }

      try {
        setIsExtracting(true);
        info('Extraction des données de la chaîne...', 'Veuillez patienter');
        
        const data = await extractChannelData(formData.youtube_url);
        setExtractedData(data);
        
        // Update form with extracted data
        setFormData(prev => ({
          ...prev,
          username: data.username,
          subscriber_count: data.subscriber_count,
        }));
        
        success('Données extraites !', `Chaîne: ${data.username} • ${(data.subscriber_count / 1000).toFixed(0)}K abonnés`);
      } catch (err) {
        error('Erreur d\'extraction', 'Impossible de récupérer les données de la chaîne');
        setExtractedData(null);
      } finally {
        setIsExtracting(false);
      }
    };

    const timeoutId = setTimeout(extractData, 800); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.youtube_url, info, success, error]);

  // Show/hide domain field based on type
  useEffect(() => {
    setShowDomainField(formData.type === 'Only');
    if (formData.type === 'Mix') {
      setFormData(prev => ({ ...prev, domain: '' }));
    }
  }, [formData.type]);

  // Auto-save when all required fields are filled
  useEffect(() => {
    const autoSave = async () => {
      const requiredFields = ['youtube_url', 'username', 'tag', 'type'];
      const isComplete = requiredFields.every(field => formData[field as keyof CreateChannelInput]);
      const isDomainRequired = formData.type === 'Only' && !formData.domain;
      
      if (!isComplete || isDomainRequired || formData.subscriber_count === 0) {
        return;
      }

      try {
        setIsAutoSaving(true);
        
        await ChannelService.createChannel({
          youtube_url: formData.youtube_url!,
          username: formData.username!,
          subscriber_count: formData.subscriber_count!,
          tag: formData.tag!,
          type: formData.type!,
          domain: formData.domain || undefined,
        });

        success('Chaîne enregistrée !', 'Les données ont été automatiquement sauvegardées');
        
        // Reset form
        setFormData({
          youtube_url: '',
          username: '',
          subscriber_count: 0,
          tag: undefined,
          type: undefined,
          domain: '',
        });
        setExtractedData(null);
        
      } catch (err) {
        error('Erreur de sauvegarde', 'Impossible d\'enregistrer la chaîne');
      } finally {
        setIsAutoSaving(false);
      }
    };

    const timeoutId = setTimeout(autoSave, 500); // Small delay to prevent rapid saves
    return () => clearTimeout(timeoutId);
  }, [formData, success, error]);

  const formatSubscriberCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M abonnés`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K abonnés`;
    }
    return `${count} abonnés`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Youtube color="#FF0000" size={48} className="text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ajouter une Chaîne
          </h1>
          <p className="text-gray-600">
            Ajoutez une nouvelle chaîne YouTube pour le traitement des Shorts
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form className="space-y-6">
            {/* YouTube URL Input */}
            <div>
              <Input
                label="Lien de la chaîne YouTube"
                placeholder="https://www.youtube.com/@channel-name"
                value={formData.youtube_url}
                onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                onClear={() => setFormData(prev => ({ ...prev, youtube_url: '' }))}
              />
              {isExtracting && (
                <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                  <SpinLoader />
                  <span>Extraction des données en cours...</span>
                </div>
              )}
            </div>

            {/* Extracted Data Display */}
            {extractedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <User color="#10B981" size={20} className="text-green-600" />
                  <span className="font-medium text-green-800">Données extraites</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">Nom d'utilisateur:</span>
                    <div className="text-green-900">{extractedData.username}</div>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Abonnés:</span>
                    <div className="text-green-900 flex items-center gap-1">
                      <TrendUp color="#10B981" size={16} className="text-green-600" />
                      {formatSubscriberCount(extractedData.subscriber_count)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Username (Auto-filled) */}
            <div>
              <Input
                label="Nom d'utilisateur"
                placeholder="@channel-name"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                disabled={!!extractedData}
              />
            </div>

            {/* Tag Selection */}
            <div>
              <CustomSelect
                label="Tag de langue"
                options={tagOptions}
                value={formData.tag || null}
                onChange={(value) => setFormData(prev => ({ ...prev, tag: value as TagType }))}
                placeholder="Sélectionner un tag..."
              />
            </div>

            {/* Type Selection */}
            <div>
              <CustomSelect
                label="Type de contenu"
                options={typeOptions}
                value={formData.type || null}
                onChange={(value) => setFormData(prev => ({ ...prev, type: value as ChannelType }))}
                placeholder="Sélectionner un type..."
              />
            </div>

            {/* Domain Selection (Only if type = "Only") */}
            {showDomainField && (
              <div className="animate-in slide-in-from-top duration-300">
                <CustomSelect
                  label="Domaine spécifique"
                  options={domainOptions}
                  value={formData.domain || null}
                  onChange={(value) => setFormData(prev => ({ ...prev, domain: value || '' }))}
                  placeholder="Sélectionner un domaine..."
                />
              </div>
            )}

            {/* Auto-save Status */}
            {isAutoSaving && (
              <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <SpinLoader />
                <span className="text-sm text-blue-700 font-medium">
                  Sauvegarde automatique en cours...
                </span>
              </div>
            )}

            {/* Form Status Indicator */}
            <div className="border-t pt-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Statut:</span>
                {!formData.youtube_url ? (
                  <span className="text-orange-600 ml-2">Ajoutez un lien YouTube</span>
                ) : isExtracting ? (
                  <span className="text-blue-600 ml-2">Extraction en cours...</span>
                ) : !extractedData ? (
                  <span className="text-red-600 ml-2">Erreur d'extraction</span>
                ) : !formData.tag || !formData.type ? (
                  <span className="text-orange-600 ml-2">Complétez les informations</span>
                ) : formData.type === 'Only' && !formData.domain ? (
                  <span className="text-orange-600 ml-2">Sélectionnez un domaine</span>
                ) : isAutoSaving ? (
                  <span className="text-blue-600 ml-2">Sauvegarde en cours...</span>
                ) : (
                  <span className="text-green-600 ml-2">Prêt pour la sauvegarde automatique</span>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Youtube color="#3B82F6" size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Sauvegarde automatique</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Les données sont automatiquement sauvegardées dès que tous les champs requis sont complétés. 
                Aucun bouton "Soumettre" n'est nécessaire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddChannelPage;