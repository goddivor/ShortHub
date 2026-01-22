// src/components/image-search/TraceMoeResults.tsx
import React, { useState } from 'react';
import { Play, VideoPlay, Timer, TickCircle, ExportSquare, InfoCircle } from 'iconsax-react';
import type { TraceMoeResponse, TraceMoeResult } from '@/types/image-search';
import { formatTimestamp, formatSimilarity } from '@/lib/image-search-api';

interface TraceMoeResultsProps {
  results: TraceMoeResponse;
}

interface ResultCardProps {
  result: TraceMoeResult;
  index: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, index }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);

  const similarityColor =
    result.similarity >= 0.9
      ? 'text-green-600 bg-green-50'
      : result.similarity >= 0.7
        ? 'text-yellow-600 bg-yellow-50'
        : 'text-red-600 bg-red-50';

  const handleOpenAnilist = () => {
    window.open(`https://anilist.co/anime/${result.anilist}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Preview */}
      <div className="relative aspect-video bg-gray-900">
        {showVideo && result.video ? (
          <video
            src={result.video}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            {!imageError ? (
              <img
                src={result.image}
                alt={`Result ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <VideoPlay size={48} color="#6B7280" />
              </div>
            )}
          </>
        )}

        {/* Rank badge */}
        <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-bold">
          #{index + 1}
        </div>

        {/* Similarity badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold ${similarityColor}`}>
          <div className="flex items-center gap-1">
            <TickCircle size={14} color="currentColor" />
            {formatSimilarity(result.similarity)}
          </div>
        </div>

        {/* Play video button */}
        {result.video && (
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="absolute bottom-3 right-3 bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-colors"
            title={showVideo ? 'Voir image' : 'Voir clip vidéo'}
          >
            <Play size={18} color="#374151" variant={showVideo ? 'Outline' : 'Bold'} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Filename */}
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-3">
          {result.filename || 'Titre inconnu'}
        </h3>

        {/* Details */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Episode */}
          {result.episode !== null && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs">
              <VideoPlay size={12} color="#7C3AED" />
              <span>Épisode {result.episode}</span>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
            <Timer size={12} color="#2563EB" />
            <span>{formatTimestamp(result.from)} - {formatTimestamp(result.to)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleOpenAnilist}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <ExportSquare size={14} color="#ffffff" />
            Voir sur AniList
          </button>
        </div>
      </div>
    </div>
  );
};

const TraceMoeResults: React.FC<TraceMoeResultsProps> = ({ results }) => {
  if (!results.result || results.result.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <InfoCircle size={32} color="#9CA3AF" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          L'image ne correspond à aucun anime connu dans la base de données trace.moe.
          Essayez avec une autre zone de l'image.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {results.result.length} résultat{results.result.length > 1 ? 's' : ''} trouvé{results.result.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {results.frameCount} frames analysées
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.result.slice(0, 9).map((result, index) => (
          <ResultCard key={`${result.anilist}-${index}`} result={result} index={index} />
        ))}
      </div>

      {/* Info about trace.moe */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
        <div className="flex items-start gap-3">
          <InfoCircle size={20} color="#7C3AED" />
          <div>
            <p className="text-sm font-medium text-purple-900">À propos de trace.moe</p>
            <p className="text-xs text-purple-700 mt-1">
              trace.moe est un moteur de recherche d'anime qui permet d'identifier la source
              d'une capture d'écran d'anime. Les résultats sont triés par similarité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraceMoeResults;
