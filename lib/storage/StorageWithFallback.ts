// Enhanced Storage Service with Fallback Mechanisms
// Provides robust data persistence with multiple fallback strategies

import type { UserSubscription, DiagnosisResult } from '@/types';

export enum StorageType {
  LOCAL_STORAGE = 'localStorage',
  SESSION_STORAGE = 'sessionStorage',
  MEMORY = 'memory',
  COOKIE = 'cookie'
}

interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  storageType: StorageType;
}

// In-memory fallback storage
class MemoryStorage {
  private storage = new Map<string, string>();

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  get length(): number {
    return this.storage.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.storage.keys());
    return keys[index] || null;
  }
}

// Cookie fallback (for critical data only)
class CookieStorage {
  setItem(key: string, value: string, days = 30): void {
    try {
      const expires = new Date();
      expires.setDate(expires.getDate() + days);
      document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    } catch (error) {
      console.warn('Failed to set cookie:', error);
    }
  }

  getItem(key: string): string | null {
    try {
      const name = key + "=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookies = decodedCookie.split(';');
      
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(name) === 0) {
          return cookie.substring(name.length);
        }
      }
      return null;
    } catch (error) {
      console.warn('Failed to get cookie:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    } catch (error) {
      console.warn('Failed to remove cookie:', error);
    }
  }
}

class EnhancedStorageService {
  private memoryStorage = new MemoryStorage();
  private cookieStorage = new CookieStorage();
  private preferredStorageType: StorageType = StorageType.LOCAL_STORAGE;

  constructor() {
    // Detect best available storage
    this.preferredStorageType = this.detectBestStorage();
  }

  private detectBestStorage(): StorageType {
    // Try localStorage first
    if (this.isStorageTypeAvailable(StorageType.LOCAL_STORAGE)) {
      return StorageType.LOCAL_STORAGE;
    }
    
    // Fallback to sessionStorage
    if (this.isStorageTypeAvailable(StorageType.SESSION_STORAGE)) {
      return StorageType.SESSION_STORAGE;
    }
    
    // Last resort: memory storage
    return StorageType.MEMORY;
  }

  private isStorageTypeAvailable(type: StorageType): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const storage = type === StorageType.LOCAL_STORAGE ? localStorage : sessionStorage;
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private getStorageInterface(type: StorageType): Storage | MemoryStorage | CookieStorage {
    switch (type) {
      case StorageType.LOCAL_STORAGE:
        return localStorage;
      case StorageType.SESSION_STORAGE:
        return sessionStorage;
      case StorageType.MEMORY:
        return this.memoryStorage;
      case StorageType.COOKIE:
        return this.cookieStorage;
      default:
        return this.memoryStorage;
    }
  }

  // Generic storage operations with fallback
  private setItemWithFallback<T>(key: string, value: T): StorageResult<T> {
    const serialized = JSON.stringify(value);
    
    // Try preferred storage first
    try {
      const storage = this.getStorageInterface(this.preferredStorageType);
      storage.setItem(key, serialized);
      return {
        success: true,
        data: value,
        storageType: this.preferredStorageType
      };
    } catch (error) {
      console.warn(`Failed to save to ${this.preferredStorageType}:`, error);
    }

    // Try fallback storages
    const fallbackTypes = [StorageType.SESSION_STORAGE, StorageType.MEMORY, StorageType.COOKIE];
    
    for (const type of fallbackTypes) {
      if (type === this.preferredStorageType) continue;
      
      try {
        const storage = this.getStorageInterface(type);
        storage.setItem(key, serialized);
        
        console.info(`Saved to fallback storage: ${type}`);
        return {
          success: true,
          data: value,
          storageType: type
        };
      } catch (error) {
        console.warn(`Failed to save to ${type}:`, error);
      }
    }

    return {
      success: false,
      error: 'All storage methods failed',
      storageType: StorageType.MEMORY
    };
  }

  private getItemWithFallback<T>(key: string): StorageResult<T> {
    // Try all storage types to find the data
    const storageTypes = [
      this.preferredStorageType,
      StorageType.SESSION_STORAGE,
      StorageType.MEMORY,
      StorageType.COOKIE
    ];

    for (const type of [...new Set(storageTypes)]) {
      try {
        const storage = this.getStorageInterface(type);
        const stored = storage.getItem(key);
        
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          return {
            success: true,
            data: parsed,
            storageType: type
          };
        }
      } catch (error) {
        console.warn(`Failed to get from ${type}:`, error);
      }
    }

    return {
      success: false,
      error: 'Data not found in any storage',
      storageType: StorageType.MEMORY
    };
  }

  // Public API methods
  saveSelectedSubscriptions(subscriptionIds: string[]): boolean {
    const result = this.setItemWithFallback('selectedSubscriptions', subscriptionIds);
    
    if (!result.success) {
      console.error('Failed to save selected subscriptions to any storage');
      // Notify user about storage issues
      this.notifyStorageIssue();
    }
    
    return result.success;
  }

  getSelectedSubscriptions(): string[] {
    const result = this.getItemWithFallback<string[]>('selectedSubscriptions');
    return result.data || [];
  }

  saveUserSubscriptions(userSubscriptions: UserSubscription[]): boolean {
    const result = this.setItemWithFallback('userSubscriptions', userSubscriptions);
    
    if (!result.success) {
      console.error('Failed to save user subscriptions to any storage');
      this.notifyStorageIssue();
    }
    
    return result.success;
  }

  getUserSubscriptions(): UserSubscription[] {
    const result = this.getItemWithFallback<UserSubscription[]>('userSubscriptions');
    return result.data || [];
  }

  saveDiagnosisResult(diagnosisResult: DiagnosisResult): boolean {
    const result = this.setItemWithFallback('diagnosisResult', diagnosisResult);
    
    if (!result.success) {
      console.error('Failed to save diagnosis result to any storage');
      this.notifyStorageIssue();
    }
    
    return result.success;
  }

  getDiagnosisResult(): DiagnosisResult | null {
    const result = this.getItemWithFallback<DiagnosisResult>('diagnosisResult');
    return result.data || null;
  }

  // Clear all SubCheck data from all storage types
  clearAllData(): void {
    const keys = ['selectedSubscriptions', 'userSubscriptions', 'diagnosisResult', 'subcheck_custom_subscriptions'];
    const storageTypes = [StorageType.LOCAL_STORAGE, StorageType.SESSION_STORAGE, StorageType.MEMORY, StorageType.COOKIE];

    for (const type of storageTypes) {
      try {
        const storage = this.getStorageInterface(type);
        for (const key of keys) {
          storage.removeItem(key);
        }
      } catch (error) {
        console.warn(`Failed to clear ${type}:`, error);
      }
    }
  }

  // Get storage health information
  getStorageStatus() {
    const status = {
      preferred: this.preferredStorageType,
      available: {} as Record<StorageType, boolean>,
      hasFallback: false
    };

    for (const type of Object.values(StorageType)) {
      status.available[type] = this.isStorageTypeAvailable(type);
    }

    status.hasFallback = Object.values(status.available).filter(Boolean).length > 1;

    return status;
  }

  private notifyStorageIssue(): void {
    // Could integrate with toast notifications or error reporting
    console.warn('Storage operation failed. Data may not persist between sessions.');
    
    // In production, could show user notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      // Request permission and show notification about data persistence issues
    }
  }
}

// Export singleton instance
export const enhancedStorage = new EnhancedStorageService();

// Export for testing
export { EnhancedStorageService };