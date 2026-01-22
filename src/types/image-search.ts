// src/types/image-search.ts

// trace.moe API Types
export interface TraceMoeResult {
  anilist: number;
  filename: string;
  episode: number | null;
  from: number;
  to: number;
  similarity: number;
  video: string;
  image: string;
}

export interface TraceMoeResponse {
  frameCount: number;
  error: string;
  result: TraceMoeResult[];
}

// Google Vision API Types
export interface GoogleVisionWebEntity {
  entityId: string;
  score: number;
  description: string;
}

export interface GoogleVisionMatchingImage {
  url: string;
  score?: number;
}

export interface GoogleVisionPageWithMatchingImage {
  url: string;
  pageTitle: string;
}

export interface GoogleVisionWebDetection {
  webEntities: GoogleVisionWebEntity[];
  fullMatchingImages: GoogleVisionMatchingImage[];
  partialMatchingImages: GoogleVisionMatchingImage[];
  pagesWithMatchingImages: GoogleVisionPageWithMatchingImage[];
  visuallySimilarImages: GoogleVisionMatchingImage[];
}

export interface GoogleVisionResponse {
  webDetection: GoogleVisionWebDetection;
}

// Common Types
export type SearchProvider = 'tracemoe' | 'google';

export interface ImageSearchState {
  isSelecting: boolean;
  isSearching: boolean;
  provider: SearchProvider | null;
  results: TraceMoeResponse | GoogleVisionResponse | null;
  error: string | null;
  capturedImage: string | null;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
