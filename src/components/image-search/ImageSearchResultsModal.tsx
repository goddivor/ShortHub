// src/components/image-search/ImageSearchResultsModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { CloseCircle, SearchNormal, Image } from 'iconsax-react';
import type {
  SearchProvider,
  TraceMoeResponse,
  GoogleVisionResponse,
} from '@/types/image-search';
import TraceMoeResults from './TraceMoeResults';
import GoogleVisionResults from './GoogleVisionResults';
import SpinLoader from '@/components/SpinLoader';

interface ImageSearchResultsModalProps {
  isOpen: boolean;
  results: TraceMoeResponse | GoogleVisionResponse | null;
  provider: SearchProvider | null;
  capturedImage: string | null;
  isSearching: boolean;
  error: string | null;
  onClose: () => void;
}

const ImageSearchResultsModal: React.FC<ImageSearchResultsModalProps> = ({
  isOpen,
  results,
  provider,
  capturedImage,
  isSearching,
  error,
  onClose,
}) => {
  if (!isOpen && !isSearching) return null;

  const getProviderInfo = () => {
    switch (provider) {
      case 'tracemoe':
        return {
          title: 'Résultats trace.moe',
          subtitle: 'Recherche dans les animes',
          bgGradient: 'from-purple-600 to-pink-600',
          bgLight: 'bg-purple-50',
        };
      case 'google':
        return {
          title: 'Résultats Google Vision',
          subtitle: 'Recherche sur le web',
          bgGradient: 'from-blue-600 to-cyan-600',
          bgLight: 'bg-blue-50',
        };
      default:
        return {
          title: 'Résultats de recherche',
          subtitle: '',
          bgGradient: 'from-gray-600 to-gray-700',
          bgLight: 'bg-gray-50',
        };
    }
  };

  const providerInfo = getProviderInfo();

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${providerInfo.bgGradient} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <SearchNormal size={24} color="#ffffff" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {providerInfo.title}
                </h2>
                <p className="text-sm text-white/80">{providerInfo.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <CloseCircle size={24} color="#ffffff" />
            </button>
          </div>
        </div>

        {/* Captured image preview */}
        {capturedImage && (
          <div className={`${providerInfo.bgLight} px-6 py-3 border-b border-gray-200`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Image size={16} color="#6B7280" />
                <span>Image recherchée:</span>
              </div>
              <div className="w-20 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20">
              <SpinLoader />
              <p className="mt-4 text-gray-600 font-medium">
                Recherche en cours...
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Analyse de l'image avec {provider === 'tracemoe' ? 'trace.moe' : 'Google Vision'}
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <CloseCircle size={32} color="#EF4444" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Erreur lors de la recherche
              </h3>
              <p className="text-sm text-red-600 text-center max-w-md">
                {error}
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          ) : results ? (
            <>
              {provider === 'tracemoe' && (
                <TraceMoeResults results={results as TraceMoeResponse} />
              )}
              {provider === 'google' && (
                <GoogleVisionResults results={results as GoogleVisionResponse} />
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        {!isSearching && !error && results && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Résultats fournis par {provider === 'tracemoe' ? 'trace.moe' : 'Google Cloud Vision API'}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Use portal to render at body level, bypassing stacking context issues
  return createPortal(modalContent, document.body);
};

export default ImageSearchResultsModal;
