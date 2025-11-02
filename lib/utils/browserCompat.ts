// Browser compatibility utilities and polyfills for SubCheck

/**
 * Browser feature detection utilities
 */
export class BrowserFeatureDetector {
  
  /**
   * Check if localStorage is available and working
   */
  static isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if sessionStorage is available
   */
  static isSessionStorageAvailable(): boolean {
    try {
      const test = '__sessionStorage_test__';
      window.sessionStorage.setItem(test, test);
      window.sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if IndexedDB is available
   */
  static isIndexedDBAvailable(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  /**
   * Check if Web Workers are supported
   */
  static isWebWorkerSupported(): boolean {
    return typeof Worker !== 'undefined';
  }

  /**
   * Check if CSS Grid is supported
   */
  static isCSSGridSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const div = document.createElement('div');
    return 'grid' in div.style;
  }

  /**
   * Check if CSS Flexbox is supported
   */
  static isFlexboxSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const div = document.createElement('div');
    return 'flex' in div.style || 'webkitFlex' in div.style;
  }

  /**
   * Check if Intersection Observer is supported
   */
  static isIntersectionObserverSupported(): boolean {
    return typeof window !== 'undefined' && 'IntersectionObserver' in window;
  }

  /**
   * Check if Resize Observer is supported
   */
  static isResizeObserverSupported(): boolean {
    return typeof window !== 'undefined' && 'ResizeObserver' in window;
  }

  /**
   * Check if the browser supports modern ES features
   */
  static isModernBrowserSupported(): boolean {
    try {
      // Check for ES6+ features
      return (
        typeof Symbol !== 'undefined' &&
        typeof Promise !== 'undefined' &&
        typeof Map !== 'undefined' &&
        typeof Set !== 'undefined' &&
        !!Array.prototype.includes &&
        !!Object.assign
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if the browser is Internet Explorer
   */
  static isInternetExplorer(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent;
    return ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
  }

  /**
   * Get browser name and version
   */
  static getBrowserInfo(): { name: string; version: string; isSupported: boolean } {
    if (typeof window === 'undefined') {
      return { name: 'Unknown', version: '0', isSupported: false };
    }

    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = '0';
    let isSupported = true;

    if (ua.indexOf('Chrome') > -1) {
      name = 'Chrome';
      version = ua.match(/Chrome\/(\d+)/)?.[1] || '0';
      isSupported = parseInt(version) >= 91; // Chrome 91+ (June 2021)
    } else if (ua.indexOf('Firefox') > -1) {
      name = 'Firefox';
      version = ua.match(/Firefox\/(\d+)/)?.[1] || '0';
      isSupported = parseInt(version) >= 89; // Firefox 89+ (June 2021)
    } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
      name = 'Safari';
      version = ua.match(/Version\/(\d+)/)?.[1] || '0';
      isSupported = parseInt(version) >= 14; // Safari 14+ (September 2020)
    } else if (ua.indexOf('Edge') > -1) {
      name = 'Edge';
      version = ua.match(/Edg\/(\d+)/)?.[1] || '0';
      isSupported = parseInt(version) >= 91; // Edge 91+ (June 2021)
    } else if (this.isInternetExplorer()) {
      name = 'Internet Explorer';
      version = ua.match(/(?:MSIE |rv:)(\d+)/)?.[1] || '0';
      isSupported = false; // IE not supported
    }

    return { name, version, isSupported };
  }
}

/**
 * Storage fallback implementation for browsers without localStorage
 */
export class StorageFallback {
  private static memoryStorage: Map<string, string> = new Map();
  private static cookieStorage: { [key: string]: string } = {};

  /**
   * Memory-based storage fallback
   */
  static getMemoryStorage() {
    const storage = this.memoryStorage;
    return {
      getItem: (key: string): string | null => {
        return storage.get(key) || null;
      },
      setItem: (key: string, value: string): void => {
        storage.set(key, value);
      },
      removeItem: (key: string): void => {
        storage.delete(key);
      },
      clear: (): void => {
        storage.clear();
      },
      get length(): number {
        return storage.size;
      },
      key: (index: number): string | null => {
        const keys = Array.from(storage.keys());
        return keys[index] || null;
      }
    };
  }

  /**
   * Cookie-based storage fallback (limited capacity)
   */
  static getCookieStorage() {
    return {
      getItem: (key: string): string | null => {
        if (typeof document === 'undefined') return null;
        const name = `subcheck_${key}=`;
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
          }
        }
        return null;
      },
      setItem: (key: string, value: string): void => {
        if (typeof document === 'undefined') return;
        // Limit cookie size to 3KB to avoid browser limits
        const truncatedValue = value.length > 3000 ? value.substring(0, 3000) : value;
        const expires = new Date();
        expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
        document.cookie = `subcheck_${key}=${encodeURIComponent(truncatedValue)};expires=${expires.toUTCString()};path=/`;
      },
      removeItem: (key: string): void => {
        if (typeof document === 'undefined') return;
        document.cookie = `subcheck_${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
      },
      clear: (): void => {
        // This is a simplified clear - in practice, we'd need to enumerate all cookies
        console.warn('Cookie storage clear() not fully implemented');
      },
      get length(): number {
        return 0; // Simplified implementation
      },
      key: (index: number): string | null => {
        return null; // Simplified implementation
      }
    };
  }

  /**
   * Get the best available storage method
   */
  static getBestAvailableStorage(): Storage | typeof this.memoryStorage {
    if (BrowserFeatureDetector.isLocalStorageAvailable()) {
      return window.localStorage;
    } else if (BrowserFeatureDetector.isSessionStorageAvailable()) {
      return window.sessionStorage;
    } else {
      console.warn('Local/Session storage not available, falling back to memory storage');
      return this.getMemoryStorage();
    }
  }
}

/**
 * CSS Polyfills for older browsers
 */
export class CSSPolyfills {
  
  /**
   * Add CSS Grid fallback for older browsers
   */
  static addGridFallback(): void {
    if (typeof window === 'undefined') return;
    
    if (!BrowserFeatureDetector.isCSSGridSupported()) {
      const style = document.createElement('style');
      style.textContent = `
        /* Grid fallback using flexbox */
        .grid {
          display: flex;
          flex-wrap: wrap;
        }
        .grid-cols-1 > * { flex: 0 0 100%; }
        .grid-cols-2 > * { flex: 0 0 50%; }
        .grid-cols-3 > * { flex: 0 0 33.333%; }
        .grid-cols-4 > * { flex: 0 0 25%; }
        
        @media (max-width: 768px) {
          .md\\:grid-cols-2 > *, 
          .md\\:grid-cols-3 > *, 
          .md\\:grid-cols-4 > * { 
            flex: 0 0 100%; 
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Add CSS custom properties fallback
   */
  static addCustomPropertiesFallback(): void {
    if (typeof window === 'undefined') return;

    // Check if CSS custom properties are supported
    const supportsCustomProperties = CSS.supports('color', 'var(--test)');
    
    if (!supportsCustomProperties) {
      const style = document.createElement('style');
      style.textContent = `
        /* CSS custom properties fallback */
        .bg-primary { background-color: #3b82f6; }
        .text-primary { color: #3b82f6; }
        .border-primary { border-color: #3b82f6; }
        
        .bg-secondary { background-color: #f3f4f6; }
        .text-secondary { color: #6b7280; }
        
        .bg-success { background-color: #10b981; }
        .text-success { color: #10b981; }
        
        .bg-warning { background-color: #f59e0b; }
        .text-warning { color: #f59e0b; }
        
        .bg-danger { background-color: #ef4444; }
        .text-danger { color: #ef4444; }
      `;
      document.head.appendChild(style);
    }
  }
}

/**
 * JavaScript polyfills for missing features
 */
export class JSPolyfills {
  
  /**
   * Array.prototype.includes polyfill
   */
  static addArrayIncludesPolyfill(): void {
    if (!Array.prototype.includes) {
      Array.prototype.includes = function(searchElement: any, fromIndex?: number): boolean {
        const len = this.length;
        const start = Math.max(fromIndex || 0, fromIndex! < 0 ? len + fromIndex! : 0);
        
        for (let i = start; i < len; i++) {
          if (this[i] === searchElement) {
            return true;
          }
        }
        return false;
      };
    }
  }

  /**
   * Object.assign polyfill
   */
  static addObjectAssignPolyfill(): void {
    if (!Object.assign) {
      Object.assign = function(target: any, ...sources: any[]): any {
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
        
        const to = Object(target);
        
        for (let index = 0; index < sources.length; index++) {
          const nextSource = sources[index];
          
          if (nextSource != null) {
            for (const nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      };
    }
  }

  /**
   * Promise polyfill (basic implementation)
   */
  static addPromisePolyfill(): void {
    if (typeof Promise === 'undefined') {
      // Basic Promise polyfill - in production, use a full polyfill like es6-promise
      (window as any).Promise = class BasicPromise {
        constructor(executor: Function) {
          console.warn('Using basic Promise polyfill. Consider using a full polyfill.');
          // Simplified implementation
        }
        
        static resolve(value: any) {
          return new (this as any)((resolve: Function) => resolve(value));
        }
        
        static reject(reason: any) {
          return new (this as any)((resolve: Function, reject: Function) => reject(reason));
        }
      };
    }
  }

  /**
   * Add all necessary polyfills
   */
  static addAllPolyfills(): void {
    this.addArrayIncludesPolyfill();
    this.addObjectAssignPolyfill();
    this.addPromisePolyfill();
  }
}

/**
 * Main compatibility initialization
 */
export class CompatibilityManager {
  
  /**
   * Initialize all compatibility features
   */
  static initialize(): {
    browserInfo: ReturnType<typeof BrowserFeatureDetector.getBrowserInfo>;
    storage: Storage | ReturnType<typeof StorageFallback.getMemoryStorage>;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    // Get browser information
    const browserInfo = BrowserFeatureDetector.getBrowserInfo();
    
    if (!browserInfo.isSupported) {
      warnings.push(`ブラウザ ${browserInfo.name} ${browserInfo.version} は完全にはサポートされていません。最新バージョンへの更新をお勧めします。`);
    }

    // Initialize polyfills
    JSPolyfills.addAllPolyfills();
    CSSPolyfills.addGridFallback();
    CSSPolyfills.addCustomPropertiesFallback();

    // Set up storage
    const storage = StorageFallback.getBestAvailableStorage();
    
    if (!BrowserFeatureDetector.isLocalStorageAvailable()) {
      warnings.push('LocalStorageが利用できません。データは一時的に保存されます。');
    }

    // Check for other important features
    if (!BrowserFeatureDetector.isModernBrowserSupported()) {
      warnings.push('一部の機能が制限される可能性があります。');
    }

    if (BrowserFeatureDetector.isInternetExplorer()) {
      warnings.push('Internet Explorerはサポートされていません。Chrome、Firefox、Safari、またはEdgeをご利用ください。');
    }

    return {
      browserInfo,
      storage: null as any, // Temporarily disable for performance testing
      warnings
    };
  }

  /**
   * Show compatibility warnings to user
   */
  static showCompatibilityWarnings(warnings: string[]): void {
    if (warnings.length === 0) return;

    const warningContainer = document.createElement('div');
    warningContainer.className = 'compatibility-warnings';
    warningContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #fef2f2;
      border-bottom: 1px solid #fecaca;
      padding: 12px;
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      color: #991b1b;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      float: right;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #991b1b;
    `;
    closeButton.onclick = () => warningContainer.remove();

    const warningText = document.createElement('div');
    warningText.innerHTML = `
      <strong>⚠️ ブラウザ互換性について:</strong><br>
      ${warnings.join('<br>')}
    `;

    warningContainer.appendChild(closeButton);
    warningContainer.appendChild(warningText);
    document.body.insertBefore(warningContainer, document.body.firstChild);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (warningContainer.parentNode) {
        warningContainer.remove();
      }
    }, 10000);
  }
}