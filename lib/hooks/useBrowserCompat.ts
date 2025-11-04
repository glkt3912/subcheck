'use client';

import { useState, useEffect } from 'react';
import { 
  BrowserFeatureDetector, 
  StorageFallback, 
  CompatibilityManager 
} from '@/lib/utils/browserCompat';

interface BrowserCompatInfo {
  browserInfo: {
    name: string;
    version: string;
    isSupported: boolean;
  };
  features: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    cssGrid: boolean;
    flexbox: boolean;
    intersectionObserver: boolean;
    webWorkers: boolean;
    modernJS: boolean;
  };
  storage: Storage;
  warnings: string[];
  isCompatible: boolean;
}

/**
 * Hook for browser compatibility detection and management
 */
export function useBrowserCompat(): BrowserCompatInfo {
  const [compatInfo, setCompatInfo] = useState<BrowserCompatInfo | null>(null);

  useEffect(() => {
    // Initialize compatibility on client side only
    const initializeCompat = () => {
      const initCompat = CompatibilityManager.initialize();
      
      const features = {
        localStorage: BrowserFeatureDetector.isLocalStorageAvailable(),
        sessionStorage: BrowserFeatureDetector.isSessionStorageAvailable(),
        indexedDB: BrowserFeatureDetector.isIndexedDBAvailable(),
        cssGrid: BrowserFeatureDetector.isCSSGridSupported(),
        flexbox: BrowserFeatureDetector.isFlexboxSupported(),
        intersectionObserver: BrowserFeatureDetector.isIntersectionObserverSupported(),
        webWorkers: BrowserFeatureDetector.isWebWorkerSupported(),
        modernJS: BrowserFeatureDetector.isModernBrowserSupported(),
      };

      const isCompatible = initCompat.browserInfo.isSupported && 
                          features.modernJS && 
                          (features.localStorage || features.sessionStorage);

      const newCompatInfo = {
        browserInfo: initCompat.browserInfo,
        features,
        storage: initCompat.storage,
        warnings: initCompat.warnings,
        isCompatible
      };

      setCompatInfo(newCompatInfo);

      // Show warnings if any
      if (initCompat.warnings.length > 0) {
        CompatibilityManager.showCompatibilityWarnings(initCompat.warnings);
      }
    };

    initializeCompat();
  }, []);

  return compatInfo || {
    browserInfo: { name: 'Unknown', version: '0', isSupported: false },
    features: {
      localStorage: false,
      sessionStorage: false,
      indexedDB: false,
      cssGrid: false,
      flexbox: false,
      intersectionObserver: false,
      webWorkers: false,
      modernJS: false,
    },
    storage: StorageFallback.getMemoryStorage(),
    warnings: [],
    isCompatible: false
  };
}

/**
 * Hook for safe storage access with fallbacks
 */
export function useSafeStorage() {
  const { storage, features } = useBrowserCompat();

  const safeSetItem = (key: string, value: string): boolean => {
    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Storage setItem failed:', error);
      return false;
    }
  };

  const safeGetItem = (key: string): string | null => {
    try {
      return storage.getItem(key);
    } catch (error) {
      console.warn('Storage getItem failed:', error);
      return null;
    }
  };

  const safeRemoveItem = (key: string): boolean => {
    try {
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Storage removeItem failed:', error);
      return false;
    }
  };

  const safeClear = (): boolean => {
    try {
      storage.clear();
      return true;
    } catch (error) {
      console.warn('Storage clear failed:', error);
      return false;
    }
  };

  return {
    setItem: safeSetItem,
    getItem: safeGetItem,
    removeItem: safeRemoveItem,
    clear: safeClear,
    isAvailable: features.localStorage || features.sessionStorage,
    storageType: features.localStorage ? 'localStorage' : 
                 features.sessionStorage ? 'sessionStorage' : 'memory'
  };
}

/**
 * Hook for feature detection with fallbacks
 */
export function useFeatureDetection() {
  const { features, isCompatible } = useBrowserCompat();

  // Intersection Observer with fallback
  const useIntersectionObserver = (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) => {
    useEffect(() => {
      if (features.intersectionObserver) {
        // Use native IntersectionObserver
        const observer = new IntersectionObserver(callback, options);
        return () => observer.disconnect();
      } else {
        // Fallback to scroll event
        const fallbackCallback = () => {
          // Simplified fallback - call callback for all observed elements
          const elements = document.querySelectorAll('[data-observe]');
          const entries = Array.from(elements).map(el => ({
            target: el,
            isIntersecting: true, // Simplified - assume visible
            intersectionRatio: 1,
            boundingClientRect: el.getBoundingClientRect(),
            intersectionRect: el.getBoundingClientRect(),
            rootBounds: null,
            time: Date.now()
          })) as IntersectionObserverEntry[];
          
          callback(entries, {} as IntersectionObserver);
        };

        window.addEventListener('scroll', fallbackCallback);
        window.addEventListener('resize', fallbackCallback);
        
        return () => {
          window.removeEventListener('scroll', fallbackCallback);
          window.removeEventListener('resize', fallbackCallback);
        };
      }
    }, [callback, options]);
  };

  // CSS Grid detection with flexbox fallback
  const getLayoutClasses = (gridClasses: string): string => {
    if (features.cssGrid) {
      return gridClasses;
    } else {
      // Convert grid classes to flex equivalents
      return gridClasses
        .replace(/grid/, 'flex flex-wrap')
        .replace(/grid-cols-(\d+)/, 'flex-wrap children:flex-basis-1/$1');
    }
  };

  return {
    features,
    isCompatible,
    useIntersectionObserver,
    getLayoutClasses,
    supportsWebWorkers: features.webWorkers,
    supportsModernJS: features.modernJS
  };
}

/**
 * Hook for graceful degradation
 */
export function useGracefulDegradation() {
  const { isCompatible, browserInfo, warnings } = useBrowserCompat();

  // Get recommended alternatives for unsupported browsers
  const getRecommendedBrowsers = () => [
    { name: 'Google Chrome', url: 'https://www.google.com/chrome/' },
    { name: 'Mozilla Firefox', url: 'https://www.mozilla.org/firefox/' },
    { name: 'Microsoft Edge', url: 'https://www.microsoft.com/edge' },
    { name: 'Safari', url: 'https://www.apple.com/safari/' }
  ];

  // Check if feature should be disabled
  const shouldDisableFeature = (requiredFeatures: string[]): boolean => {
    return requiredFeatures.some(feature => {
      switch (feature) {
        case 'localStorage':
          return !BrowserFeatureDetector.isLocalStorageAvailable();
        case 'webWorkers':
          return !BrowserFeatureDetector.isWebWorkerSupported();
        case 'modernJS':
          return !BrowserFeatureDetector.isModernBrowserSupported();
        default:
          return false;
      }
    });
  };

  // Get fallback component or message
  const getFallbackContent = (type: 'storage' | 'worker' | 'general') => {
    const messages = {
      storage: 'データの永続化機能が利用できません。ブラウザを更新すると入力内容が失われる可能性があります。',
      worker: 'バックグラウンド処理機能が利用できません。一部の処理が遅くなる可能性があります。',
      general: 'お使いのブラウザでは一部の機能が制限されます。最新のブラウザをご利用ください。'
    };

    return {
      message: messages[type],
      recommendations: getRecommendedBrowsers()
    };
  };

  return {
    isCompatible,
    browserInfo,
    warnings,
    shouldDisableFeature,
    getFallbackContent,
    getRecommendedBrowsers
  };
}