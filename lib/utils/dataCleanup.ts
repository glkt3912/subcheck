// Data cleanup utilities for SubCheck application

export interface CleanupConfig {
  maxAgeHours?: number;
  keepMinimumItems?: number;
  preserveTypes?: string[];
}

export interface CleanupResult {
  itemsRemoved: number;
  storageFreed: number; // bytes
  errors: string[];
  summary: string;
}

/**
 * Data cleanup utility class for managing localStorage and session data
 */
export class DataCleanupService {
  private static readonly DEFAULT_CONFIG: CleanupConfig = {
    maxAgeHours: 720, // 30 days
    keepMinimumItems: 5,
    preserveTypes: ['user_preferences', 'app_settings']
  };

  /**
   * Clean up old diagnosis sessions
   */
  static async cleanupDiagnosisSessions(config: CleanupConfig = {}): Promise<CleanupResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const result: CleanupResult = {
      itemsRemoved: 0,
      storageFreed: 0,
      errors: [],
      summary: ''
    };

    try {
      const diagnosisKeys = this.findDiagnosisKeys();
      const now = new Date().getTime();
      const maxAge = finalConfig.maxAgeHours! * 60 * 60 * 1000;

      for (const key of diagnosisKeys) {
        try {
          const item = localStorage.getItem(key);
          if (!item) continue;

          const data = JSON.parse(item);
          const itemAge = now - new Date(data.lastUpdated || data.createdAt || 0).getTime();

          if (itemAge > maxAge) {
            const size = new Blob([item]).size;
            localStorage.removeItem(key);
            result.itemsRemoved++;
            result.storageFreed += size;
          }
        } catch (error) {
          result.errors.push(`Failed to process key ${key}: ${error}`);
        }
      }

      result.summary = `Removed ${result.itemsRemoved} old diagnosis sessions, freed ${this.formatBytes(result.storageFreed)}`;
    } catch (error) {
      result.errors.push(`Cleanup failed: ${error}`);
    }

    return result;
  }

  /**
   * Clean up orphaned custom subscriptions
   */
  static async cleanupOrphanedCustomSubscriptions(): Promise<CleanupResult> {
    const result: CleanupResult = {
      itemsRemoved: 0,
      storageFreed: 0,
      errors: [],
      summary: ''
    };

    try {
      const customSubscriptionsKey = 'subcheck_custom_subscriptions';
      const customSubscriptionsData = localStorage.getItem(customSubscriptionsKey);
      
      if (!customSubscriptionsData) {
        result.summary = 'No custom subscriptions found';
        return result;
      }

      const customSubscriptions = JSON.parse(customSubscriptionsData);
      const referencedIds = this.getReferencedSubscriptionIds();
      
      const cleanedSubscriptions = customSubscriptions.filter((sub: any) => {
        const isReferenced = referencedIds.has(sub.id);
        if (!isReferenced) {
          result.itemsRemoved++;
          result.storageFreed += new Blob([JSON.stringify(sub)]).size;
        }
        return isReferenced;
      });

      if (result.itemsRemoved > 0) {
        localStorage.setItem(customSubscriptionsKey, JSON.stringify(cleanedSubscriptions));
        result.summary = `Removed ${result.itemsRemoved} orphaned custom subscriptions`;
      } else {
        result.summary = 'No orphaned custom subscriptions found';
      }

    } catch (error) {
      result.errors.push(`Custom subscription cleanup failed: ${error}`);
    }

    return result;
  }

  /**
   * Clean up incomplete or corrupted data
   */
  static async cleanupCorruptedData(): Promise<CleanupResult> {
    const result: CleanupResult = {
      itemsRemoved: 0,
      storageFreed: 0,
      errors: [],
      summary: ''
    };

    try {
      // Collect all keys that start with 'subcheck_'
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (storageKey && storageKey.startsWith('subcheck_')) {
          keys.push(storageKey);
        }
      }
      
      for (const key of keys) {
        try {
          const item = localStorage.getItem(key);
          if (!item) continue;

          // Try to parse JSON
          const data = JSON.parse(item);
          
          // Validate data structure based on key type
          if (!this.validateDataStructure(key, data)) {
            const size = new Blob([item]).size;
            localStorage.removeItem(key);
            result.itemsRemoved++;
            result.storageFreed += size;
          }
        } catch (error) {
          // Invalid JSON - remove it
          const item = localStorage.getItem(key);
          const size = item ? new Blob([item]).size : 0;
          localStorage.removeItem(key);
          result.itemsRemoved++;
          result.storageFreed += size;
          result.errors.push(`Removed corrupted item ${key}: ${error}`);
        }
      }

      result.summary = `Removed ${result.itemsRemoved} corrupted data items`;
    } catch (error) {
      result.errors.push(`Corrupted data cleanup failed: ${error}`);
    }

    return result;
  }

  /**
   * Get storage usage statistics
   */
  static getStorageStats(): {
    used: number;
    available: number;
    percentage: number;
    itemCount: number;
    subcheckItemCount: number;
  } {
    let used = 0;
    let itemCount = 0;
    let subcheckItemCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const item = localStorage.getItem(key);
        if (item) {
          used += new Blob([key + item]).size;
          itemCount++;
          if (key.startsWith('subcheck_')) {
            subcheckItemCount++;
          }
        }
      }
    }

    // Estimate available storage (usually 5-10MB for localStorage)
    const estimatedLimit = 10 * 1024 * 1024; // 10MB
    const available = Math.max(0, estimatedLimit - used);
    const percentage = (used / estimatedLimit) * 100;

    return {
      used,
      available,
      percentage: Math.min(100, percentage),
      itemCount,
      subcheckItemCount
    };
  }

  /**
   * Perform comprehensive cleanup
   */
  static async performFullCleanup(config: CleanupConfig = {}): Promise<CleanupResult[]> {
    const results: CleanupResult[] = [];

    // Run all cleanup operations
    results.push(await this.cleanupDiagnosisSessions(config));
    results.push(await this.cleanupOrphanedCustomSubscriptions());
    results.push(await this.cleanupCorruptedData());

    return results;
  }

  /**
   * Schedule automatic cleanup
   */
  static scheduleCleanup(intervalHours: number = 24): void {
    const interval = intervalHours * 60 * 60 * 1000;
    
    setInterval(async () => {
      try {
        const results = await this.performFullCleanup();
        console.log('Automatic cleanup completed:', results);
      } catch (error) {
        console.error('Automatic cleanup failed:', error);
      }
    }, interval);
  }

  /**
   * Emergency cleanup - remove all SubCheck data
   */
  static emergencyCleanup(): CleanupResult {
    const result: CleanupResult = {
      itemsRemoved: 0,
      storageFreed: 0,
      errors: [],
      summary: ''
    };

    try {
      // Collect all keys that start with 'subcheck_'
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('subcheck_')) {
          keys.push(key);
        }
      }
      
      for (const key of keys) {
        try {
          const item = localStorage.getItem(key);
          const size = item ? new Blob([item]).size : 0;
          localStorage.removeItem(key);
          result.itemsRemoved++;
          result.storageFreed += size;
        } catch (error) {
          result.errors.push(`Failed to remove ${key}: ${error}`);
        }
      }

      result.summary = `Emergency cleanup: removed ${result.itemsRemoved} items, freed ${this.formatBytes(result.storageFreed)}`;
    } catch (error) {
      result.errors.push(`Emergency cleanup failed: ${error}`);
    }

    return result;
  }

  // Private helper methods

  private static findDiagnosisKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('subcheck_diagnosis_') ||
        key.startsWith('subcheck_session_') ||
        key.startsWith('subcheck_result_')
      )) {
        keys.push(key);
      }
    }
    return keys;
  }

  private static getReferencedSubscriptionIds(): Set<string> {
    const referencedIds = new Set<string>();
    
    try {
      // Check active diagnosis sessions
      const sessionKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('subcheck_diagnosis_') || key.startsWith('subcheck_session_'))) {
          sessionKeys.push(key);
        }
      }

      for (const key of sessionKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.selectedServices) {
            data.selectedServices.forEach((id: string) => referencedIds.add(id));
          }
          if (data.userSubscriptions) {
            data.userSubscriptions.forEach((sub: any) => referencedIds.add(sub.subscriptionId));
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }
    } catch (error) {
      console.warn('Failed to get referenced subscription IDs:', error);
    }

    return referencedIds;
  }

  private static validateDataStructure(key: string, data: any): boolean {
    try {
      if (key.includes('diagnosis_session')) {
        return data && 
               typeof data.currentStep === 'string' &&
               Array.isArray(data.selectedServices) &&
               typeof data.lastUpdated === 'string';
      }

      if (key.includes('custom_subscriptions')) {
        return Array.isArray(data) &&
               data.every((item: any) => 
                 typeof item.id === 'string' &&
                 typeof item.name === 'string' &&
                 typeof item.monthlyPrice === 'number'
               );
      }

      if (key.includes('user_subscriptions')) {
        return Array.isArray(data) &&
               data.every((item: any) =>
                 typeof item.subscriptionId === 'string' &&
                 typeof item.usageFrequency === 'string'
               );
      }

      // Default validation - ensure it's a valid object
      return data !== null && typeof data === 'object';
    } catch (error) {
      return false;
    }
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Hook for using data cleanup in React components
 */
export function useDataCleanup() {
  const performCleanup = async (config?: CleanupConfig) => {
    return await DataCleanupService.performFullCleanup(config);
  };

  const getStorageStats = () => {
    return DataCleanupService.getStorageStats();
  };

  const emergencyCleanup = () => {
    return DataCleanupService.emergencyCleanup();
  };

  return {
    performCleanup,
    getStorageStats,
    emergencyCleanup
  };
}

/**
 * Cleanup configuration presets
 */
export const CleanupPresets = {
  conservative: {
    maxAgeHours: 168, // 7 days
    keepMinimumItems: 10,
    preserveTypes: ['user_preferences', 'app_settings', 'custom_subscriptions']
  },
  
  aggressive: {
    maxAgeHours: 24, // 1 day
    keepMinimumItems: 3,
    preserveTypes: ['user_preferences']
  },
  
  development: {
    maxAgeHours: 1, // 1 hour
    keepMinimumItems: 1,
    preserveTypes: []
  }
};