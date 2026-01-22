// src/components/image-search/GoogleVisionResults.tsx
import React, { useState } from 'react';
import { ExportSquare, Image, Link1, Tag, InfoCircle, Gallery, DocumentText } from 'iconsax-react';
import type { GoogleVisionResponse } from '@/types/image-search';

interface GoogleVisionResultsProps {
  results: GoogleVisionResponse;
}

type TabType = 'entities' | 'similar' | 'pages';

const GoogleVisionResults: React.FC<GoogleVisionResultsProps> = ({ results }) => {
  const [activeTab, setActiveTab] = useState<TabType>('entities');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const { webDetection } = results;

  const handleImageError = (url: string) => {
    setImageErrors((prev) => new Set(prev).add(url));
  };

  const tabs = [
    {
      id: 'entities' as TabType,
      label: 'Entités',
      icon: <Tag size={16} color="currentColor" />,
      count: webDetection?.webEntities?.length || 0,
    },
    {
      id: 'similar' as TabType,
      label: 'Images similaires',
      icon: <Gallery size={16} color="currentColor" />,
      count: (webDetection?.visuallySimilarImages?.length || 0) +
        (webDetection?.fullMatchingImages?.length || 0) +
        (webDetection?.partialMatchingImages?.length || 0),
    },
    {
      id: 'pages' as TabType,
      label: 'Pages web',
      icon: <DocumentText size={16} color="currentColor" />,
      count: webDetection?.pagesWithMatchingImages?.length || 0,
    },
  ];

  const hasAnyResults =
    (webDetection?.webEntities?.length || 0) > 0 ||
    (webDetection?.visuallySimilarImages?.length || 0) > 0 ||
    (webDetection?.fullMatchingImages?.length || 0) > 0 ||
    (webDetection?.pagesWithMatchingImages?.length || 0) > 0;

  if (!hasAnyResults) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <InfoCircle size={32} color="#9CA3AF" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Google Vision n'a pas trouvé de correspondances pour cette image.
          Essayez avec une autre zone ou une image plus distinctive.
        </p>
      </div>
    );
  }

  const renderEntities = () => {
    const entities = webDetection?.webEntities || [];
    if (entities.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Aucune entité détectée
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {entities.slice(0, 15).map((entity, index) => (
          <div
            key={entity.entityId || index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag size={16} color="#2563EB" />
              </div>
              <span className="font-medium text-gray-900">{entity.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">
                {((entity.score || 0) * 100).toFixed(0)}%
              </div>
              <button
                onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(entity.description)}`, '_blank')}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Rechercher sur Google"
              >
                <ExportSquare size={16} color="currentColor" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSimilarImages = () => {
    const allImages = [
      ...(webDetection?.fullMatchingImages || []).map((img) => ({ ...img, type: 'full' })),
      ...(webDetection?.partialMatchingImages || []).map((img) => ({ ...img, type: 'partial' })),
      ...(webDetection?.visuallySimilarImages || []).map((img) => ({ ...img, type: 'similar' })),
    ];

    if (allImages.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Aucune image similaire trouvée
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {allImages.slice(0, 20).map((image, index) => {
          const hasError = imageErrors.has(image.url);

          return (
            <div
              key={`${image.url}-${index}`}
              className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group"
            >
              {!hasError ? (
                <img
                  src={image.url}
                  alt={`Similar ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(image.url)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image size={24} color="#9CA3AF" />
                </div>
              )}

              {/* Type badge */}
              <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                image.type === 'full'
                  ? 'bg-green-500 text-white'
                  : image.type === 'partial'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-blue-500 text-white'
              }`}>
                {image.type === 'full' ? 'Exact' : image.type === 'partial' ? 'Partiel' : 'Similaire'}
              </div>

              {/* Overlay with link */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => window.open(image.url, '_blank')}
                  className="p-2 bg-white rounded-full shadow-lg"
                  title="Ouvrir l'image"
                >
                  <ExportSquare size={18} color="#374151" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPages = () => {
    const pages = webDetection?.pagesWithMatchingImages || [];
    if (pages.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Aucune page web trouvée
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {pages.slice(0, 15).map((page, index) => {
          const hostname = (() => {
            try {
              return new URL(page.url).hostname;
            } catch {
              return page.url;
            }
          })();

          return (
            <a
              key={`${page.url}-${index}`}
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Link1 size={16} color="#6B7280" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                  {page.pageTitle || hostname}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {hostname}
                </p>
              </div>
              <ExportSquare size={16} color="#9CA3AF" className="flex-shrink-0 group-hover:text-blue-600" />
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span className={`
                px-1.5 py-0.5 rounded-full text-xs
                ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === 'entities' && renderEntities()}
        {activeTab === 'similar' && renderSimilarImages()}
        {activeTab === 'pages' && renderPages()}
      </div>

      {/* Info about Google Vision */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="flex items-start gap-3">
          <InfoCircle size={20} color="#2563EB" />
          <div>
            <p className="text-sm font-medium text-blue-900">À propos de Google Vision</p>
            <p className="text-xs text-blue-700 mt-1">
              Google Vision AI analyse l'image pour identifier des entités (personnes, objets, lieux),
              trouver des images similaires sur le web, et lister les pages web contenant cette image.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleVisionResults;
