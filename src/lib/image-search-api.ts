// src/lib/image-search-api.ts
import type { TraceMoeResponse, GoogleVisionResponse } from '@/types/image-search';
import { getAuthToken } from './apollo-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Maximum size for trace.moe API (in bytes) - they accept up to 1MB
const TRACE_MOE_MAX_SIZE = 900 * 1024; // 900KB to be safe

/**
 * Compress image to fit within size limit
 * Returns a Blob for efficient upload
 */
async function compressImageToBlob(base64Image: string, maxSizeBytes: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Start with smaller dimensions for trace.moe (it doesn't need high res)
      const MAX_DIMENSION = 640;
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      // Scale down if larger than max dimension
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Try different quality levels until we're under the limit
      const tryGetBlob = (quality: number): Promise<Blob | null> => {
        return new Promise((res) => {
          canvas.toBlob((blob) => res(blob), 'image/jpeg', quality);
        });
      };

      const compress = async () => {
        let quality = 0.7;
        let blob = await tryGetBlob(quality);

        while (blob && blob.size > maxSizeBytes && quality > 0.2) {
          quality -= 0.1;
          blob = await tryGetBlob(quality);
        }

        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to compress image'));
        }
      };

      compress();
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = base64Image;
  });
}

/**
 * Search anime scene using trace.moe API
 * This API is CORS-friendly and doesn't require authentication
 * Uses FormData for more efficient upload
 */
export async function searchTraceMoe(base64Image: string): Promise<TraceMoeResponse> {
  // Always compress to ensure we're under the limit
  const imageBlob = await compressImageToBlob(base64Image, TRACE_MOE_MAX_SIZE);

  // Use FormData for efficient binary upload
  const formData = new FormData();
  formData.append('image', imageBlob, 'image.jpg');

  const response = await fetch('https://api.trace.moe/search', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`trace.moe API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Search using Google Vision API via server proxy
 * Server handles API key security
 */
export async function searchGoogleVision(base64Image: string): Promise<GoogleVisionResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_URL}/api/image-search/google-vision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      image: base64Image,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
    throw new Error(errorData.message || `Google Vision API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch image from YouTube and convert to base64
 * Uses server proxy to avoid CORS issues
 */
export async function fetchYouTubeThumbnail(videoId: string): Promise<string> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_URL}/api/image-search/youtube-thumbnail/${videoId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch thumbnail: ${response.status}`);
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Crop image using Canvas API
 */
export function cropImage(
  imageElement: HTMLImageElement,
  cropArea: { x: number; y: number; width: number; height: number },
  displayWidth: number,
  displayHeight: number
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Calculate scale factors
  const scaleX = imageElement.naturalWidth / displayWidth;
  const scaleY = imageElement.naturalHeight / displayHeight;

  // Set canvas size to cropped area
  canvas.width = cropArea.width * scaleX;
  canvas.height = cropArea.height * scaleY;

  // Draw cropped portion
  ctx.drawImage(
    imageElement,
    cropArea.x * scaleX,
    cropArea.y * scaleY,
    cropArea.width * scaleX,
    cropArea.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Format timestamp from seconds to MM:SS format
 */
export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format similarity percentage
 */
export function formatSimilarity(similarity: number): string {
  return `${(similarity * 100).toFixed(1)}%`;
}

/**
 * Capture screenshot using Screen Capture API
 * Returns a base64 image of the captured screen/window/tab
 */
export async function captureScreenshot(): Promise<string> {
  try {
    // Request screen capture
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser', // Prefer browser tab
      },
      audio: false,
    });

    // Get video track
    const videoTrack = stream.getVideoTracks()[0];

    // Create video element to capture frame
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;

    // Wait for video to be ready
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });

    // Small delay to ensure frame is rendered
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Capture frame to canvas
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    ctx.drawImage(video, 0, 0);

    // Stop the stream
    videoTrack.stop();
    stream.getTracks().forEach(track => track.stop());

    // Return base64 image
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Capture d\'écran annulée par l\'utilisateur');
    }
    throw new Error(`Erreur de capture: ${error.message}`);
  }
}
