// SubCheck Local Storage Management
// Handles data persistence and retrieval

import type { UserSubscription, DiagnosisResult } from '@/types';
// Storage utility functions with enhanced fallback support
import { enhancedStorage } from './StorageWithFallback';

const STORAGE_KEYS = {
  SELECTED_SUBSCRIPTIONS: 'selectedSubscriptions',
  USER_SUBSCRIPTIONS: 'userSubscriptions',
  DIAGNOSIS_RESULT: 'diagnosisResult',
  DIAGNOSIS_HISTORY: 'diagnosisHistory'
} as const;

// Check if localStorage is available (legacy compatibility)
function isStorageAvailable(): boolean {
  return enhancedStorage.getStorageStatus().available.localStorage;
}

// Selected Subscriptions Management
export function saveSelectedSubscriptions(subscriptionIds: string[]): void {
  const success = enhancedStorage.saveSelectedSubscriptions(subscriptionIds);
  if (!success) {
    console.warn('Failed to save selected subscriptions with fallback');
  }
}

export function getSelectedSubscriptions(): string[] {
  return enhancedStorage.getSelectedSubscriptions();
}

// User Subscriptions Management
export function saveUserSubscriptions(userSubscriptions: UserSubscription[]): void {
  const success = enhancedStorage.saveUserSubscriptions(userSubscriptions);
  if (!success) {
    console.warn('Failed to save user subscriptions with fallback');
  }
}

export function getUserSubscriptions(): UserSubscription[] {
  return enhancedStorage.getUserSubscriptions();
}

// Diagnosis Result Management
export function saveDiagnosisResult(result: DiagnosisResult): void {
  const success = enhancedStorage.saveDiagnosisResult(result);
  if (!success) {
    console.warn('Failed to save diagnosis result with fallback');
  }
  
  // Also save to history (keeping legacy localStorage for history)
  try {
    const history = getDiagnosisHistory();
    const newHistory = [result, ...history.slice(0, 9)]; // Keep last 10 results
    if (isStorageAvailable()) {
      localStorage.setItem(STORAGE_KEYS.DIAGNOSIS_HISTORY, JSON.stringify(newHistory));
    }
  } catch (error) {
    console.warn('Failed to save diagnosis history:', error);
  }
}

export function getDiagnosisResult(): DiagnosisResult | null {
  return enhancedStorage.getDiagnosisResult();
}

// Diagnosis History Management
export function getDiagnosisHistory(): DiagnosisResult[] {
  if (!isStorageAvailable()) return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DIAGNOSIS_HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to get diagnosis history:', error);
    return [];
  }
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

// All storage operations are now function-based for simplicity and consistency