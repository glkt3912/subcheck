import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataCleanupService, CleanupPresets } from '../dataCleanup';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('DataCleanupService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('cleanupDiagnosisSessions', () => {
    it('should remove old diagnosis sessions', async () => {
      // Setup old sessions
      const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
      const recentDate = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago

      localStorage.setItem('subcheck_diagnosis_old', JSON.stringify({
        lastUpdated: oldDate.toISOString(),
        selectedServices: ['service1']
      }));

      localStorage.setItem('subcheck_diagnosis_recent', JSON.stringify({
        lastUpdated: recentDate.toISOString(),
        selectedServices: ['service2']
      }));

      const result = await DataCleanupService.cleanupDiagnosisSessions({
        maxAgeHours: 720 // 30 days
      });

      expect(result.itemsRemoved).toBe(1);
      expect(localStorage.getItem('subcheck_diagnosis_old')).toBeNull();
      expect(localStorage.getItem('subcheck_diagnosis_recent')).not.toBeNull();
    });

    it('should handle corrupted session data gracefully', async () => {
      localStorage.setItem('subcheck_diagnosis_corrupted', 'invalid json');

      const result = await DataCleanupService.cleanupDiagnosisSessions();

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Failed to process key');
    });
  });

  describe('cleanupOrphanedCustomSubscriptions', () => {
    it('should remove unreferenced custom subscriptions', async () => {
      // Setup custom subscriptions
      const customSubscriptions = [
        { id: 'custom1', name: 'Custom Service 1', monthlyPrice: 1000 },
        { id: 'custom2', name: 'Custom Service 2', monthlyPrice: 2000 }
      ];

      localStorage.setItem('subcheck_custom_subscriptions', JSON.stringify(customSubscriptions));

      // Setup active session that only references custom1
      localStorage.setItem('subcheck_diagnosis_session', JSON.stringify({
        selectedServices: ['custom1'],
        lastUpdated: new Date().toISOString()
      }));

      const result = await DataCleanupService.cleanupOrphanedCustomSubscriptions();

      expect(result.itemsRemoved).toBe(1);
      
      const remainingSubscriptions = JSON.parse(
        localStorage.getItem('subcheck_custom_subscriptions') || '[]'
      );
      expect(remainingSubscriptions).toHaveLength(1);
      expect(remainingSubscriptions[0].id).toBe('custom1');
    });

    it('should handle missing custom subscriptions', async () => {
      const result = await DataCleanupService.cleanupOrphanedCustomSubscriptions();

      expect(result.itemsRemoved).toBe(0);
      expect(result.summary).toContain('No custom subscriptions found');
    });
  });

  describe('cleanupCorruptedData', () => {
    it('should remove corrupted JSON data', async () => {
      localStorage.setItem('subcheck_corrupted', 'invalid json');
      localStorage.setItem('subcheck_valid', JSON.stringify({ valid: true }));

      const result = await DataCleanupService.cleanupCorruptedData();

      expect(result.itemsRemoved).toBe(1);
      expect(localStorage.getItem('subcheck_corrupted')).toBeNull();
      expect(localStorage.getItem('subcheck_valid')).not.toBeNull();
    });

    it('should validate data structure', async () => {
      // Invalid diagnosis session structure
      localStorage.setItem('subcheck_diagnosis_session', JSON.stringify({
        invalidField: 'test'
      }));

      const result = await DataCleanupService.cleanupCorruptedData();

      expect(result.itemsRemoved).toBe(1);
      expect(localStorage.getItem('subcheck_diagnosis_session')).toBeNull();
    });
  });

  describe('getStorageStats', () => {
    it('should calculate storage statistics', () => {
      localStorage.setItem('subcheck_item1', 'test data 1');
      localStorage.setItem('subcheck_item2', 'test data 2');
      localStorage.setItem('other_item', 'other data');

      const stats = DataCleanupService.getStorageStats();

      expect(stats.itemCount).toBe(3);
      expect(stats.subcheckItemCount).toBe(2);
      expect(stats.used).toBeGreaterThan(0);
      expect(stats.percentage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('performFullCleanup', () => {
    it('should run all cleanup operations', async () => {
      // Setup test data
      const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
      localStorage.setItem('subcheck_diagnosis_old', JSON.stringify({
        lastUpdated: oldDate.toISOString()
      }));
      localStorage.setItem('subcheck_corrupted', 'invalid json');

      const results = await DataCleanupService.performFullCleanup();

      expect(results).toHaveLength(3); // Three cleanup operations
      expect(results.some(r => r.itemsRemoved > 0)).toBe(true);
    });
  });

  describe('emergencyCleanup', () => {
    it('should remove all SubCheck data', () => {
      localStorage.setItem('subcheck_item1', 'data1');
      localStorage.setItem('subcheck_item2', 'data2');
      localStorage.setItem('other_item', 'other');

      const result = DataCleanupService.emergencyCleanup();

      expect(result.itemsRemoved).toBe(2);
      expect(localStorage.getItem('subcheck_item1')).toBeNull();
      expect(localStorage.getItem('subcheck_item2')).toBeNull();
      expect(localStorage.getItem('other_item')).not.toBeNull();
    });
  });

  describe('CleanupPresets', () => {
    it('should have valid preset configurations', () => {
      expect(CleanupPresets.conservative.maxAgeHours).toBe(168); // 7 days
      expect(CleanupPresets.aggressive.maxAgeHours).toBe(24); // 1 day
      expect(CleanupPresets.development.maxAgeHours).toBe(1); // 1 hour

      expect(CleanupPresets.conservative.keepMinimumItems).toBeGreaterThan(
        CleanupPresets.aggressive.keepMinimumItems
      );
    });
  });
});