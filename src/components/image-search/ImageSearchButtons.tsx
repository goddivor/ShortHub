// src/components/image-search/ImageSearchButtons.tsx
import React from 'react';
import { Camera } from 'iconsax-react';
import type { SearchProvider } from '@/types/image-search';

interface ImageSearchButtonsProps {
  onStartCapture: (provider: SearchProvider) => void;
  isSearching: boolean;
  isSelecting: boolean;
  isCapturing: boolean;
  disabled?: boolean;
}

const ImageSearchButtons: React.FC<ImageSearchButtonsProps> = ({
  onStartCapture,
  isSearching,
  isSelecting,
  isCapturing,
  disabled = false,
}) => {
  const isDisabled = disabled || isSearching || isSelecting || isCapturing;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Camera size={16} color="#6B7280" />
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Recherche par capture d'écran
        </p>
      </div>

      <div className="flex items-center justify-center gap-6">
        {/* trace.moe Button */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => onStartCapture('tracemoe')}
            disabled={isDisabled}
            className={`
              w-16 h-16 rounded-full overflow-hidden border-3 transition-all duration-200
              ${isDisabled
                ? 'opacity-50 cursor-not-allowed border-gray-300'
                : 'border-purple-400 hover:border-purple-600 hover:scale-110 hover:shadow-lg hover:shadow-purple-200'
              }
            `}
            title="Capturer l'écran et rechercher dans les animes"
          >
            <img
              src="/trace.jpeg"
              alt="trace.moe"
              className="w-full h-full object-cover"
            />
          </button>
          <span className={`text-xs font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
            trace.moe
          </span>
        </div>

        {/* Google Vision Button */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => onStartCapture('google')}
            disabled={isDisabled}
            className={`
              w-16 h-16 rounded-full overflow-hidden border-3 transition-all duration-200 bg-white
              ${isDisabled
                ? 'opacity-50 cursor-not-allowed border-gray-300'
                : 'border-blue-400 hover:border-blue-600 hover:scale-110 hover:shadow-lg hover:shadow-blue-200'
              }
            `}
            title="Capturer l'écran et rechercher sur le web"
          >
            <img
              src="/GV.png"
              alt="Google Vision"
              className="w-full h-full object-contain p-2"
            />
          </button>
          <span className={`text-xs font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
            Google Vision
          </span>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-center">
        {isCapturing ? 'Sélectionnez l\'onglet à capturer...' : 'Cliquez pour capturer votre écran'}
      </p>
    </div>
  );
};

export default ImageSearchButtons;
