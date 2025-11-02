// SubCheck Local Storage Management
// Handles data persistence and retrieval

import type { UserSubscription, DiagnosisResult } from '@/types';
import { ErrorHandler, SafeStorage, checkStorageAvailability } from '@/lib/utils/errorHandling';

const STORAGE_KEYS = {
  SELECTED_SUBSCRIPTIONS: 'selectedSubscriptions',
  USER_SUBSCRIPTIONS: 'userSubscriptions',
  DIAGNOSIS_RESULT: 'diagnosisResult',
  DIAGNOSIS_HISTORY: 'diagnosisHistory'
} as const;

// Check if localStorage is available
function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Selected Subscriptions Management
export function saveSelectedSubscriptions(subscriptionIds: string[]): void {
  const success = SafeStorage.setItem(STORAGE_KEYS.SELECTED_SUBSCRIPTIONS, subscriptionIds);
  if (!success) {
    console.warn('Failed to save selected subscriptions, using session fallback');
    // Could implement session storage fallback here
  }
}

export function getSelectedSubscriptions(): string[] {
  return SafeStorage.getItem(STORAGE_KEYS.SELECTED_SUBSCRIPTIONS, []);
}

// User Subscriptions Management
export function saveUserSubscriptions(userSubscriptions: UserSubscription[]): void {
  const success = SafeStorage.setItem(STORAGE_KEYS.USER_SUBSCRIPTIONS, userSubscriptions);
  if (!success) {
    console.warn('Failed to save user subscriptions, diagnosis may not persist');
  }
}

export function getUserSubscriptions(): UserSubscription[] {
  return SafeStorage.getItem(STORAGE_KEYS.USER_SUBSCRIPTIONS, []);
}

// Diagnosis Result Management
export function saveDiagnosisResult(result: DiagnosisResult): void {
  const success = SafeStorage.setItem(STORAGE_KEYS.DIAGNOSIS_RESULT, result);
  if (success) {
    // Also save to history
    const history = getDiagnosisHistory();
    const newHistory = [result, ...history.slice(0, 9)]; // Keep last 10 results
    SafeStorage.setItem(STORAGE_KEYS.DIAGNOSIS_HISTORY, newHistory);
  } else {
    console.warn('Failed to save diagnosis result, results may not persist');
  }
}

export function getDiagnosisResult(): DiagnosisResult | null {
  return SafeStorage.getItem(STORAGE_KEYS.DIAGNOSIS_RESULT, null);
}

// Diagnosis History Management
export function getDiagnosisHistory(): DiagnosisResult[] {
  return SafeStorage.getItem(STORAGE_KEYS.DIAGNOSIS_HISTORY, []);
}

// Clear All Data
export function clearAllData(): void {
  if (!isStorageAvailable()) return;
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear data:', error);
  }
}

// Export Data (for backup purposes)
export function exportData(): string | null {
  if (!isStorageAvailable()) return null;
  try {
    const data = {
      selectedSubscriptions: getSelectedSubscriptions(),
      userSubscriptions: getUserSubscriptions(),
      diagnosisResult: getDiagnosisResult(),
      diagnosisHistory: getDiagnosisHistory(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.warn('Failed to export data:', error);
    return null;
  }
}

// Check if user has existing data
export function hasExistingData(): boolean {
  return getSelectedSubscriptions().length > 0 || getUserSubscriptions().length > 0;
}

// Get storage usage info
export function getStorageInfo(): {
  isAvailable: boolean;
  hasData: boolean;
  estimatedSize: number;
} {
  const isAvailable = isStorageAvailable();
  const hasData = hasExistingData();
  
  let estimatedSize = 0;
  if (isAvailable) {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          estimatedSize += new Blob([item]).size;
        }
      });
    } catch (error) {
      console.warn('Failed to calculate storage size:', error);
    }
  }
  
  return {
    isAvailable,
    hasData,
    estimatedSize
  };
}

// StorageService class for compatibility with existing code
export class StorageService {
  saveSelectedSubscriptions = saveSelectedSubscriptions;
  getSelectedSubscriptions = getSelectedSubscriptions;
  saveUserSubscriptions = saveUserSubscriptions;
  getUserSubscriptions = getUserSubscriptions;
  saveDiagnosisResult = saveDiagnosisResult;
  getDiagnosisResult = getDiagnosisResult;
  getDiagnosisHistory = getDiagnosisHistory;
  clearAllData = clearAllData;
  exportData = exportData;
  hasExistingData = hasExistingData;
  getStorageInfo = getStorageInfo;

  // Generic methods for useDiagnosisSession compatibility
  async getItem<T>(key: string): Promise<T | null> {
    if (!isStorageAvailable()) return null;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn(`Failed to load ${key}:`, error);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    if (!isStorageAvailable()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to save ${key}:`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!isStorageAvailable()) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key}:`, error);
    }
  }
}