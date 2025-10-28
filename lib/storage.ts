// SubCheck Local Storage Management
// Handles data persistence and retrieval

import type { UserSubscription, DiagnosisResult } from '@/types';

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
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_SUBSCRIPTIONS, JSON.stringify(subscriptionIds));
  } catch (error) {
    console.warn('Failed to save selected subscriptions:', error);
  }
}

export function getSelectedSubscriptions(): string[] {
  if (!isStorageAvailable()) return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_SUBSCRIPTIONS);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Failed to load selected subscriptions:', error);
    return [];
  }
}

// User Subscriptions Management
export function saveUserSubscriptions(userSubscriptions: UserSubscription[]): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_SUBSCRIPTIONS, JSON.stringify(userSubscriptions));
  } catch (error) {
    console.warn('Failed to save user subscriptions:', error);
  }
}

export function getUserSubscriptions(): UserSubscription[] {
  if (!isStorageAvailable()) return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_SUBSCRIPTIONS);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Failed to load user subscriptions:', error);
    return [];
  }
}

// Diagnosis Result Management
export function saveDiagnosisResult(result: DiagnosisResult): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.DIAGNOSIS_RESULT, JSON.stringify(result));
    
    // Also save to history
    const history = getDiagnosisHistory();
    const newHistory = [result, ...history.slice(0, 9)]; // Keep last 10 results
    localStorage.setItem(STORAGE_KEYS.DIAGNOSIS_HISTORY, JSON.stringify(newHistory));
  } catch (error) {
    console.warn('Failed to save diagnosis result:', error);
  }
}

export function getDiagnosisResult(): DiagnosisResult | null {
  if (!isStorageAvailable()) return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DIAGNOSIS_RESULT);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load diagnosis result:', error);
    return null;
  }
}

// Diagnosis History Management
export function getDiagnosisHistory(): DiagnosisResult[] {
  if (!isStorageAvailable()) return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DIAGNOSIS_HISTORY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Failed to load diagnosis history:', error);
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