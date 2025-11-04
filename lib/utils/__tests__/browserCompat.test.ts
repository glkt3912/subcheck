import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  BrowserFeatureDetector, 
  StorageFallback, 
  CompatibilityManager 
} from '../browserCompat';

// Mock window and document
const mockWindow = {
  localStorage: {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  },
  sessionStorage: {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  },
  navigator: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  document: {
    createElement: vi.fn(() => ({
      style: {},
      appendChild: vi.fn(),
      remove: vi.fn()
    })),
    head: {
      appendChild: vi.fn()
    },
    body: {
      insertBefore: vi.fn(),
      firstChild: null
    },
    cookie: ''
  }
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

Object.defineProperty(global, 'document', {
  value: mockWindow.document,
  writable: true
});

Object.defineProperty(global, 'navigator', {
  value: mockWindow.navigator,
  writable: true
});

// Mock CSS object for compatibility tests
Object.defineProperty(global, 'CSS', {
  value: {
    supports: vi.fn(() => true)
  },
  writable: true
});

describe('BrowserFeatureDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset navigator userAgent to default
    mockWindow.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    global.navigator = mockWindow.navigator;
  });

  describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage works', () => {
      mockWindow.localStorage.setItem.mockImplementation(() => {});
      mockWindow.localStorage.removeItem.mockImplementation(() => {});
      
      const result = BrowserFeatureDetector.isLocalStorageAvailable();
      expect(result).toBe(true);
    });

    it('should return false when localStorage throws error', () => {
      mockWindow.localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });
      
      const result = BrowserFeatureDetector.isLocalStorageAvailable();
      expect(result).toBe(false);
    });
  });

  describe('isSessionStorageAvailable', () => {
    it('should return true when sessionStorage works', () => {
      mockWindow.sessionStorage.setItem.mockImplementation(() => {});
      mockWindow.sessionStorage.removeItem.mockImplementation(() => {});
      
      const result = BrowserFeatureDetector.isSessionStorageAvailable();
      expect(result).toBe(true);
    });

    it('should return false when sessionStorage throws error', () => {
      mockWindow.sessionStorage.setItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });
      
      const result = BrowserFeatureDetector.isSessionStorageAvailable();
      expect(result).toBe(false);
    });
  });

  describe('isModernBrowserSupported', () => {
    it('should return true for modern browser features', () => {
      // These should already exist in modern Node.js test environment
      expect(typeof Symbol).toBe('function');
      expect(typeof Promise).toBe('function');
      expect(typeof Map).toBe('function');
      expect(typeof Set).toBe('function');
      expect(typeof Array.prototype.includes).toBe('function');
      expect(typeof Object.assign).toBe('function');
      
      const result = BrowserFeatureDetector.isModernBrowserSupported();
      expect(result).toBe(true);
    });
  });

  describe('getBrowserInfo', () => {
    it('should detect Chrome browser', () => {
      mockWindow.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      
      const result = BrowserFeatureDetector.getBrowserInfo();
      expect(result.name).toBe('Chrome');
      expect(result.version).toBe('91');
      expect(result.isSupported).toBe(true);
    });

    it('should detect Firefox browser', () => {
      mockWindow.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
      
      const result = BrowserFeatureDetector.getBrowserInfo();
      expect(result.name).toBe('Firefox');
      expect(result.version).toBe('89');
      expect(result.isSupported).toBe(true);
    });

    it('should detect Internet Explorer as unsupported', () => {
      mockWindow.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko';
      
      const result = BrowserFeatureDetector.getBrowserInfo();
      expect(result.name).toBe('Internet Explorer');
      expect(result.isSupported).toBe(false);
    });

    it('should detect old Chrome as unsupported', () => {
      mockWindow.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36';
      
      const result = BrowserFeatureDetector.getBrowserInfo();
      expect(result.name).toBe('Chrome');
      expect(result.version).toBe('50');
      expect(result.isSupported).toBe(false);
    });
  });
});

describe('StorageFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    StorageFallback['memoryStorage'].clear();
  });

  describe('getMemoryStorage', () => {
    it('should provide working storage interface', () => {
      // Clear any existing memory storage before test
      const MemoryStorageClass = (StorageFallback as { MemoryStorage?: { instance?: { clear(): void } } }).MemoryStorage;
      if (MemoryStorageClass && MemoryStorageClass.instance) {
        MemoryStorageClass.instance.clear();
      }
      
      const storage = StorageFallback.getMemoryStorage();
      
      storage.setItem('test', 'value');
      expect(storage.getItem('test')).toBe('value');
      expect(storage.length).toBe(1);
      
      storage.removeItem('test');
      expect(storage.getItem('test')).toBeNull();
      expect(storage.length).toBe(0);
    });

    it('should handle multiple items', () => {
      // Clear any existing memory storage before test
      const MemoryStorageClass = (StorageFallback as { MemoryStorage?: { instance?: { clear(): void } } }).MemoryStorage;
      if (MemoryStorageClass && MemoryStorageClass.instance) {
        MemoryStorageClass.instance.clear();
      }
      
      const storage = StorageFallback.getMemoryStorage();
      
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      
      expect(storage.length).toBe(2);
      expect(storage.key(0)).toBe('key1');
      expect(storage.key(1)).toBe('key2');
      
      storage.clear();
      expect(storage.length).toBe(0);
    });
  });

  describe('getCookieStorage', () => {
    beforeEach(() => {
      mockWindow.document.cookie = '';
    });

    it('should set and get cookies', () => {
      const storage = StorageFallback.getCookieStorage();
      
      storage.setItem('test', 'value');
      // Mock cookie reading
      mockWindow.document.cookie = 'subcheck_test=value';
      
      const result = storage.getItem('test');
      expect(result).toBe('value');
    });

    it('should handle missing cookies', () => {
      const storage = StorageFallback.getCookieStorage();
      mockWindow.document.cookie = '';
      
      const result = storage.getItem('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getBestAvailableStorage', () => {
    it('should prefer localStorage when available', () => {
      mockWindow.localStorage.setItem.mockImplementation(() => {});
      mockWindow.localStorage.removeItem.mockImplementation(() => {});
      
      const storage = StorageFallback.getBestAvailableStorage();
      expect(storage).toBe(mockWindow.localStorage);
    });

    it('should fallback to sessionStorage when localStorage fails', () => {
      mockWindow.localStorage.setItem.mockImplementation(() => {
        throw new Error('LocalStorage not available');
      });
      mockWindow.sessionStorage.setItem.mockImplementation(() => {});
      mockWindow.sessionStorage.removeItem.mockImplementation(() => {});
      
      const storage = StorageFallback.getBestAvailableStorage();
      expect(storage).toBe(mockWindow.sessionStorage);
    });

    it('should fallback to memory storage when both fail', () => {
      mockWindow.localStorage.setItem.mockImplementation(() => {
        throw new Error('LocalStorage not available');
      });
      mockWindow.sessionStorage.setItem.mockImplementation(() => {
        throw new Error('SessionStorage not available');
      });
      
      const storage = StorageFallback.getBestAvailableStorage();
      expect(storage).not.toBe(mockWindow.localStorage);
      expect(storage).not.toBe(mockWindow.sessionStorage);
    });
  });
});

describe('CompatibilityManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DOM mocks
    mockWindow.document.createElement.mockReturnValue({
      style: {},
      appendChild: vi.fn(),
      remove: vi.fn(),
      className: '',
      innerHTML: '',
      onclick: null
    });
  });

  describe('initialize', () => {
    it('should return browser info and storage', () => {
      mockWindow.localStorage.setItem.mockImplementation(() => {});
      mockWindow.localStorage.removeItem.mockImplementation(() => {});
      
      const result = CompatibilityManager.initialize();
      
      expect(result).toHaveProperty('browserInfo');
      expect(result).toHaveProperty('storage');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should generate warnings for unsupported browsers', () => {
      mockWindow.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko';
      
      const result = CompatibilityManager.initialize();
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('Internet Explorer'))).toBe(true);
    });
  });

  describe('showCompatibilityWarnings', () => {
    it('should not show warnings when array is empty', () => {
      const createElementSpy = vi.spyOn(mockWindow.document, 'createElement');
      
      CompatibilityManager.showCompatibilityWarnings([]);
      
      expect(createElementSpy).not.toHaveBeenCalled();
    });

    it('should create warning element when warnings exist', () => {
      const warnings = ['Test warning'];
      const mockElement = {
        className: '',
        style: { cssText: '' },
        appendChild: vi.fn(),
        remove: vi.fn(),
        innerHTML: ''
      };
      
      mockWindow.document.createElement.mockReturnValue(mockElement);
      mockWindow.document.body.insertBefore.mockImplementation(() => {});
      
      CompatibilityManager.showCompatibilityWarnings(warnings);
      
      expect(mockWindow.document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.appendChild).toHaveBeenCalled();
    });
  });
});