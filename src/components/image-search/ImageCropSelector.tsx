// src/components/image-search/ImageCropSelector.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseCircle, TickCircle } from 'iconsax-react';
import type { CropArea } from '@/types/image-search';
import { cropImage } from '@/lib/image-search-api';

interface ImageCropSelectorProps {
  imageUrl: string;
  onCropComplete: (base64Image: string) => void;
  onCancel: () => void;
  isActive: boolean;
}

const ImageCropSelector: React.FC<ImageCropSelectorProps> = ({
  imageUrl,
  onCropComplete,
  onCancel,
  isActive,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset state when deactivated
  useEffect(() => {
    if (!isActive) {
      setCropArea(null);
      setIsDrawing(false);
    }
  }, [isActive]);

  const getRelativePosition = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(e.clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(e.clientY - rect.top, rect.height)),
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isActive) return;
    e.preventDefault();

    const pos = getRelativePosition(e);
    setStartPos(pos);
    setCropArea({ x: pos.x, y: pos.y, width: 0, height: 0 });
    setIsDrawing(true);
  }, [isActive, getRelativePosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDrawing || !isActive) return;

    const currentPos = getRelativePosition(e);
    const newCropArea: CropArea = {
      x: Math.min(startPos.x, currentPos.x),
      y: Math.min(startPos.y, currentPos.y),
      width: Math.abs(currentPos.x - startPos.x),
      height: Math.abs(currentPos.y - startPos.y),
    };
    setCropArea(newCropArea);
  }, [isDrawing, isActive, startPos, getRelativePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    if (isActive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isActive, handleMouseMove, handleMouseUp]);

  const handleConfirm = useCallback(() => {
    if (!cropArea || !imageRef.current || !containerRef.current) return;

    // Ensure minimum selection size
    if (cropArea.width < 20 || cropArea.height < 20) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const croppedImage = cropImage(
      imageRef.current,
      cropArea,
      rect.width,
      rect.height
    );

    onCropComplete(croppedImage);
  }, [cropArea, onCropComplete]);

  const isValidSelection = cropArea && cropArea.width >= 20 && cropArea.height >= 20;

  if (!isActive) return null;

  const selectorContent = (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
      {/* Instructions */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg z-10">
        <p className="text-sm font-medium text-gray-700">
          Dessinez un rectangle sur l'image pour sélectionner la zone à rechercher
        </p>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative max-w-4xl max-h-[80vh] cursor-crosshair select-none"
        onMouseDown={handleMouseDown}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Select area"
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
          crossOrigin="anonymous"
          onLoad={() => setImageLoaded(true)}
          draggable={false}
        />

        {/* Overlay dimming outside selection */}
        {imageLoaded && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Top dim */}
            {cropArea && cropArea.height > 0 && (
              <div
                className="absolute bg-black/50"
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  height: cropArea.y,
                }}
              />
            )}
            {/* Bottom dim */}
            {cropArea && cropArea.height > 0 && (
              <div
                className="absolute bg-black/50"
                style={{
                  top: cropArea.y + cropArea.height,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
            )}
            {/* Left dim */}
            {cropArea && cropArea.width > 0 && (
              <div
                className="absolute bg-black/50"
                style={{
                  top: cropArea.y,
                  left: 0,
                  width: cropArea.x,
                  height: cropArea.height,
                }}
              />
            )}
            {/* Right dim */}
            {cropArea && cropArea.width > 0 && (
              <div
                className="absolute bg-black/50"
                style={{
                  top: cropArea.y,
                  left: cropArea.x + cropArea.width,
                  right: 0,
                  height: cropArea.height,
                }}
              />
            )}
          </div>
        )}

        {/* Selection rectangle */}
        {cropArea && cropArea.width > 0 && cropArea.height > 0 && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
            style={{
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height,
            }}
          >
            {/* Corner handles */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />

            {/* Size indicator */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {Math.round(cropArea.width)} x {Math.round(cropArea.height)}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-lg"
        >
          <CloseCircle size={20} color="#ffffff" />
          Annuler
        </button>

        <button
          onClick={handleConfirm}
          disabled={!isValidSelection}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-lg ${
            isValidSelection
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <TickCircle size={20} color="#ffffff" />
          Rechercher
        </button>
      </div>
    </div>
  );

  // Use portal to render at body level, bypassing stacking context issues
  return createPortal(selectorContent, document.body);
};

export default ImageCropSelector;
