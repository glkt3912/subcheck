// Legacy storage module for backward compatibility
// Re-exports from the current StorageService implementation

export {
  saveSelectedSubscriptions,
  getSelectedSubscriptions,
  saveUserSubscriptions,
  getUserSubscriptions,
  saveDiagnosisResult,
  getDiagnosisResult,
  getDiagnosisHistory,
  clearAllData,
  exportData,
  hasExistingData,
  getStorageInfo,
  StorageService
} from './storage/StorageService';