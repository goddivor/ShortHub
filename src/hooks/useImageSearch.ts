// src/hooks/useImageSearch.ts
import { useState, useCallback } from 'react';
import type {
  SearchProvider,
  TraceMoeResponse,
  GoogleVisionResponse,
  ImageSearchState,
} from '@/types/image-search';
import { searchTraceMoe, searchGoogleVision, captureScreenshot } from '@/lib/image-search-api';

interface ExtendedImageSearchState extends ImageSearchState {
  isCapturing: boolean;
  screenshotImage: string | null;
}

const initialState: ExtendedImageSearchState = {
  isSelecting: false,
  isSearching: false,
  isCapturing: false,
  provider: null,
  results: null,
  error: null,
  capturedImage: null,
  screenshotImage: null,
};

export interface UseImageSearchReturn extends ExtendedImageSearchState {
  startCapture: (provider: SearchProvider) => Promise<void>;
  cancelSelection: () => void;
  performSearch: (base64Image: string) => Promise<void>;
  clearResults: () => void;
  reset: () => void;
}

export function useImageSearch(): UseImageSearchReturn {
  const [state, setState] = useState<ExtendedImageSearchState>(initialState);

  const startCapture = useCallback(async (provider: SearchProvider) => {
    setState({
      ...initialState,
      isCapturing: true,
      provider,
    });

    try {
      const screenshot = await captureScreenshot();
      setState((prev) => ({
        ...prev,
        isCapturing: false,
        isSelecting: true,
        screenshotImage: screenshot,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isCapturing: false,
        error: error instanceof Error ? error.message : 'Erreur de capture',
      }));
    }
  }, []);

  const cancelSelection = useCallback(() => {
    setState(initialState);
  }, []);

  const performSearch = useCallback(async (base64Image: string) => {
    setState((prev) => ({
      ...prev,
      isSelecting: false,
      isSearching: true,
      capturedImage: base64Image,
      error: null,
    }));

    try {
      let results: TraceMoeResponse | GoogleVisionResponse;

      if (state.provider === 'tracemoe') {
        results = await searchTraceMoe(base64Image);
      } else if (state.provider === 'google') {
        results = await searchGoogleVision(base64Image);
      } else {
        throw new Error('Provider non sélectionné');
      }

      setState((prev) => ({
        ...prev,
        isSearching: false,
        results,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSearching: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la recherche',
      }));
    }
  }, [state.provider]);

  const clearResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      results: null,
      error: null,
      capturedImage: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    startCapture,
    cancelSelection,
    performSearch,
    clearResults,
    reset,
  };
}

export default useImageSearch;
