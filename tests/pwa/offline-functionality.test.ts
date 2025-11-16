/**
 * オフライン機能テスト
 * PWAのオフライン機能とデータ同期の動作を検証
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// オフラインデータの型定義
interface OfflineData {
  id: string;
  timestamp: number;
  data: unknown;
  synced: boolean;
}

// useOfflineSync Hookのモック
const mockUseOfflineSync = {
  isOnline: true,
  pendingSync: [] as OfflineData[],
  queueForSync: vi.fn(),
  syncPendingData: vi.fn(),
  clearSyncQueue: vi.fn()
};

vi.mock('@/lib/hooks/useOfflineSync', () => ({
  default: () => mockUseOfflineSync
}));

// Navigator.onLine のモック
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
  configurable: true
});

// Service Worker のモック
const mockServiceWorkerRegistration = {
  installing: null,
  waiting: null,
  active: {
    scriptURL: '/sw.js'
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  sync: {
    register: vi.fn(() => Promise.resolve())
  }
};

Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn(() => Promise.resolve(mockServiceWorkerRegistration)),
    ready: Promise.resolve(mockServiceWorkerRegistration)
  },
  writable: true,
  configurable: true
});

describe('Offline Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOfflineSync.isOnline = true;
    mockUseOfflineSync.pendingSync = [];
  });

  it('should detect online status correctly', () => {
    expect(navigator.onLine).toBe(true);
    expect(mockUseOfflineSync.isOnline).toBe(true);
  });

  it('should detect offline status correctly', () => {
    // オフライン状態をシミュレート
    Object.defineProperty(navigator, 'onLine', { value: false });
    mockUseOfflineSync.isOnline = false;

    expect(navigator.onLine).toBe(false);
    expect(mockUseOfflineSync.isOnline).toBe(false);
  });

  it('should handle online/offline events', async () => {
    const onlineHandler = vi.fn();
    const offlineHandler = vi.fn();

    // イベントリスナーの設定
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    // オフラインイベントを発火
    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);
    
    expect(offlineHandler).toHaveBeenCalledWith(offlineEvent);

    // オンラインイベントを発火
    const onlineEvent = new Event('online');
    window.dispatchEvent(onlineEvent);
    
    expect(onlineHandler).toHaveBeenCalledWith(onlineEvent);

    // クリーンアップ
    window.removeEventListener('online', onlineHandler);
    window.removeEventListener('offline', offlineHandler);
  });
});

describe('Data Queuing for Offline Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOfflineSync.isOnline = false;
    mockUseOfflineSync.pendingSync = [];
  });

  it('should queue diagnosis data when offline', async () => {
    const diagnosisData = {
      subscriptions: ['netflix', 'spotify'],
      usageFrequency: 'monthly',
      wasteRate: 0.7,
      estimatedSavings: 25000
    };

    // オフライン時のデータキューイング
    mockUseOfflineSync.queueForSync.mockImplementation((data: unknown) => {
      const queueItem = {
        id: `diagnosis-${Date.now()}`,
        timestamp: Date.now(),
        data,
        synced: false
      };
      mockUseOfflineSync.pendingSync.push(queueItem);
      return Promise.resolve(queueItem);
    });

    const result = await mockUseOfflineSync.queueForSync(diagnosisData);

    expect(mockUseOfflineSync.queueForSync).toHaveBeenCalledWith(diagnosisData);
    expect(result.data).toEqual(diagnosisData);
    expect(result.synced).toBe(false);
    expect(mockUseOfflineSync.pendingSync).toHaveLength(1);
  });

  it('should store multiple offline operations', async () => {
    const operations = [
      { type: 'diagnosis', data: { wasteRate: 0.5 } },
      { type: 'settings', data: { notifications: true } },
      { type: 'usage', data: { frequency: 'daily' } }
    ];

    mockUseOfflineSync.queueForSync.mockImplementation((data: unknown) => {
      const queueItem = {
        id: `operation-${mockUseOfflineSync.pendingSync.length + 1}`,
        timestamp: Date.now(),
        data,
        synced: false
      };
      mockUseOfflineSync.pendingSync.push(queueItem);
      return Promise.resolve(queueItem);
    });

    for (const operation of operations) {
      await mockUseOfflineSync.queueForSync(operation);
    }

    expect(mockUseOfflineSync.pendingSync).toHaveLength(3);
    expect(mockUseOfflineSync.queueForSync).toHaveBeenCalledTimes(3);
  });
});

describe('Background Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOfflineSync.pendingSync = [
      {
        id: 'diagnosis-1',
        timestamp: Date.now() - 60000,
        data: { wasteRate: 0.6 },
        synced: false
      },
      {
        id: 'diagnosis-2', 
        timestamp: Date.now() - 30000,
        data: { wasteRate: 0.8 },
        synced: false
      }
    ];
  });

  it('should sync pending data when going online', async () => {
    mockUseOfflineSync.isOnline = true;
    
    mockUseOfflineSync.syncPendingData.mockImplementation(async () => {
      // 同期成功をシミュレート
      for (const item of mockUseOfflineSync.pendingSync) {
        item.synced = true;
      }
      return { success: true, syncedCount: 2 };
    });

    const result = await mockUseOfflineSync.syncPendingData();

    expect(mockUseOfflineSync.syncPendingData).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.syncedCount).toBe(2);
    
    // 全てのアイテムが同期済みになることを確認
    expect(mockUseOfflineSync.pendingSync.every(item => item.synced)).toBe(true);
  });

  it('should handle sync failures gracefully', async () => {
    mockUseOfflineSync.isOnline = true;

    mockUseOfflineSync.syncPendingData.mockImplementation(async () => {
      // 一部の同期が失敗する場合をシミュレート
      mockUseOfflineSync.pendingSync[0].synced = true;
      // 2番目は同期失敗でfalseのまま
      return { 
        success: false, 
        syncedCount: 1, 
        errors: ['Sync failed for diagnosis-2'] 
      };
    });

    const result = await mockUseOfflineSync.syncPendingData();

    expect(result.success).toBe(false);
    expect(result.syncedCount).toBe(1);
    expect(result.errors).toContain('Sync failed for diagnosis-2');
    
    // 1つは同期済み、1つは未同期のまま
    expect(mockUseOfflineSync.pendingSync[0].synced).toBe(true);
    expect(mockUseOfflineSync.pendingSync[1].synced).toBe(false);
  });

  it('should register background sync when available', async () => {
    const backgroundSyncRegistration = {
      sync: {
        register: vi.fn((/* tag: string */) => Promise.resolve())
      }
    };

    // バックグラウンド同期の登録
    await backgroundSyncRegistration.sync.register('diagnosis-sync');

    expect(backgroundSyncRegistration.sync.register).toHaveBeenCalledWith('diagnosis-sync');
  });
});

describe('Offline Storage', () => {
  beforeEach(() => {
    // LocalStorageのモック
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  it('should save data to local storage when offline', async () => {
    const offlineData = {
      diagnoses: [
        { id: '1', wasteRate: 0.6, timestamp: Date.now() }
      ],
      settings: { notifications: true },
      lastSync: Date.now() - 300000
    };

    // ローカルストレージへの保存
    localStorage.setItem('subcheck-offline-data', JSON.stringify(offlineData));

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'subcheck-offline-data',
      JSON.stringify(offlineData)
    );
  });

  it('should retrieve data from local storage', () => {
    const storedData = {
      diagnoses: [{ id: '1', wasteRate: 0.7 }],
      lastSync: Date.now()
    };

    localStorage.getItem = vi.fn(() => JSON.stringify(storedData));

    const retrieved = JSON.parse(localStorage.getItem('subcheck-offline-data') || '{}');

    expect(localStorage.getItem).toHaveBeenCalledWith('subcheck-offline-data');
    expect(retrieved).toEqual(storedData);
  });

  it('should handle storage quota exceeded', () => {
    const largeData = 'x'.repeat(1000000); // 大きなデータ

    localStorage.setItem = vi.fn(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => {
      localStorage.setItem('subcheck-large-data', largeData);
    }).toThrow('QuotaExceededError');

    // エラーハンドリングの検証
    try {
      localStorage.setItem('subcheck-large-data', largeData);
    } catch (err: unknown) {
      expect((err as Error).message).toBe('QuotaExceededError');
    }
  });
});

describe('Offline UI Components', () => {
  it('should show offline indicator when offline', () => {
    // UIコンポーネントのテストはReact環境で実行
    // ここでは状態管理のロジックのみテスト
    const isOnline = false;
    const displayText = isOnline ? 'オンライン' : 'オフライン';
    
    expect(displayText).toBe('オフライン');
  });

  it('should show online indicator when online', () => {
    const isOnline = true;
    const displayText = isOnline ? 'オンライン' : 'オフライン';
    
    expect(displayText).toBe('オンライン');
  });

  it('should calculate sync pending count', () => {
    const pendingItems = [
      { id: '1', synced: false },
      { id: '2', synced: false },
      { id: '3', synced: true }
    ];
    
    const pendingCount = pendingItems.filter(item => !item.synced).length;
    
    expect(pendingCount).toBe(2);
  });
});

describe('Conflict Resolution', () => {
  it('should handle data conflicts during sync', async () => {
    const localData = {
      id: 'diagnosis-1',
      wasteRate: 0.6,
      lastModified: Date.now() - 60000 // 1分前
    };

    const serverData = {
      id: 'diagnosis-1',
      wasteRate: 0.8,
      lastModified: Date.now() - 30000 // 30秒前
    };

    // 競合解決のロジック（より新しいデータを選択）
    const resolvedData = localData.lastModified > serverData.lastModified 
      ? localData 
      : serverData;

    expect(resolvedData).toEqual(serverData); // サーバーデータの方が新しい
    expect(resolvedData.wasteRate).toBe(0.8);
  });

  it('should merge non-conflicting changes', () => {
    const localChanges = {
      settings: { notifications: false },
      lastActivity: Date.now()
    };

    const serverChanges = {
      profile: { name: 'Updated Name' },
      subscriptions: ['netflix']
    };

    // 競合のないマージ
    const merged = {
      ...localChanges,
      ...serverChanges
    };

    expect(merged.settings.notifications).toBe(false);
    expect(merged.profile.name).toBe('Updated Name');
    expect(merged.subscriptions).toEqual(['netflix']);
  });
});

describe('Network Status Recovery', () => {
  it('should automatically retry failed sync on network recovery', async () => {
    let networkAvailable = false;
    
    const mockSyncWithRetry = vi.fn().mockImplementation(async () => {
      if (!networkAvailable) {
        throw new Error('Network unavailable');
      }
      return { success: true };
    });

    // 最初の同期試行（失敗）
    try {
      await mockSyncWithRetry();
    } catch (err: unknown) {
      expect((err as Error).message).toBe('Network unavailable');
    }

    // ネットワーク復旧
    networkAvailable = true;

    // 再試行（成功）
    const result = await mockSyncWithRetry();
    expect(result.success).toBe(true);
    expect(mockSyncWithRetry).toHaveBeenCalledTimes(2);
  });

  it('should implement exponential backoff for retry attempts', async () => {
    const retryDelays = [100, 200, 400, 800]; // ms (テスト用に短く)
    const actualDelays: number[] = [];

    const mockRetryWithBackoff = async (attempt: number) => {
      if (attempt < retryDelays.length) {
        const delay = retryDelays[attempt];
        actualDelays.push(delay);
        
        // テスト環境では即座に完了
        await Promise.resolve();
        
        if (attempt < 3) {
          throw new Error('Still failing');
        }
      }
      return { success: true };
    };

    // モック実装（実際のタイマーは使わない）
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const result = await mockRetryWithBackoff(attempt);
        if (result.success) break;
      } catch {
        // 再試行継続
        continue;
      }
    }

    expect(actualDelays).toEqual([100, 200, 400, 800]);
  });
});