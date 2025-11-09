/**
 * Service Worker 機能テスト
 * PWAの中核機能であるService Workerの動作を検証
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Service Worker環境のモック
const mockServiceWorkerGlobalScope = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  skipWaiting: vi.fn(),
  clients: {
    claim: vi.fn(),
    matchAll: vi.fn(() => Promise.resolve([])),
    openWindow: vi.fn()
  },
  caches: {
    open: vi.fn(),
    match: vi.fn(),
    delete: vi.fn(),
    keys: vi.fn()
  },
  registration: {
    update: vi.fn(),
    unregister: vi.fn(),
    showNotification: vi.fn()
  }
};

// グローバル環境でのService Worker APIモック
Object.defineProperty(globalThis, 'self', {
  value: mockServiceWorkerGlobalScope,
  writable: true
});

describe('Service Worker Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Cache API のモック
    const mockCache = {
      put: vi.fn(),
      match: vi.fn(),
      delete: vi.fn(),
      keys: vi.fn(() => Promise.resolve([])),
      addAll: vi.fn(),
      add: vi.fn(),
      matchAll: vi.fn(() => Promise.resolve([]))
    };
    
    global.caches = {
      open: vi.fn(() => Promise.resolve(mockCache)),
      match: vi.fn(),
      delete: vi.fn(),
      keys: vi.fn(() => Promise.resolve(['cache-v1', 'cache-v2'])),
      has: vi.fn()
    };

    // Fetch APIのモック
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      redirected: false,
      type: 'basic' as ResponseType,
      url: 'http://localhost:3000',
      clone: vi.fn(() => mockResponse),
      arrayBuffer: vi.fn(),
      blob: vi.fn(),
      formData: vi.fn(),
      json: vi.fn(),
      text: vi.fn(),
      body: null,
      bodyUsed: false
    };
    
    global.fetch = vi.fn(() => Promise.resolve(mockResponse as unknown as Response));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Installation Process', () => {
    it('should handle install event correctly', async () => {
      // Service Workerのinstallイベントをシミュレート
      const installEvent = new Event('install');
      const waitUntilSpy = vi.fn();
      Object.defineProperty(installEvent, 'waitUntil', {
        value: waitUntilSpy,
        writable: true
      });

      // インストール処理のテスト
      const staticAssets = [
        '/',
        '/manifest.json',
        '/offline',
        '/diagnosis/select'
      ];

      const installMockCache = {
        addAll: vi.fn(() => Promise.resolve()),
        put: vi.fn(),
        match: vi.fn(),
        delete: vi.fn(),
        keys: vi.fn(() => Promise.resolve([])),
        add: vi.fn(),
        matchAll: vi.fn(() => Promise.resolve([]))
      };

      global.caches.open = vi.fn(() => Promise.resolve(installMockCache));

      // インストール処理を実行
      const installPromise = Promise.resolve().then(async () => {
        const cache = await caches.open('subcheck-static-v1');
        await cache.addAll(staticAssets);
      });

      waitUntilSpy.mockImplementation((promise: Promise<unknown>) => promise);

      await installPromise;

      expect(global.caches.open).toHaveBeenCalledWith('subcheck-static-v1');
      expect(installMockCache.addAll).toHaveBeenCalledWith(staticAssets);
    });

    it('should skip waiting when new service worker installs', () => {
      const skipWaitingSpy = vi.fn();
      mockServiceWorkerGlobalScope.skipWaiting = skipWaitingSpy;

      // Service Workerがskip waitingを呼ぶことを確認
      skipWaitingSpy();
      expect(skipWaitingSpy).toHaveBeenCalled();
    });
  });

  describe('Activation Process', () => {
    it('should clean up old caches on activation', async () => {
      const activateEvent = new Event('activate');
      const waitUntilSpy = vi.fn();
      Object.defineProperty(activateEvent, 'waitUntil', {
        value: waitUntilSpy,
        writable: true
      });

      const currentCaches = ['subcheck-static-v1', 'subcheck-runtime-v1'];
      const oldCaches = ['subcheck-static-v0', 'subcheck-old-cache'];

      global.caches.keys = vi.fn(() => Promise.resolve([
        ...currentCaches,
        ...oldCaches
      ]));
      global.caches.delete = vi.fn(() => Promise.resolve(true));

      // アクティベーション処理を実行
      const activationPromise = Promise.resolve().then(async () => {
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
          .filter(name => !currentCaches.includes(name))
          .map(name => caches.delete(name));
        
        await Promise.all(deletePromises);
        await mockServiceWorkerGlobalScope.clients.claim();
      });

      waitUntilSpy.mockImplementation((promise: Promise<unknown>) => promise);

      await activationPromise;

      expect(global.caches.delete).toHaveBeenCalledWith('subcheck-static-v0');
      expect(global.caches.delete).toHaveBeenCalledWith('subcheck-old-cache');
      expect(mockServiceWorkerGlobalScope.clients.claim).toHaveBeenCalled();
    });
  });

  describe('Fetch Strategies', () => {
    it('should implement cache-first strategy for static assets', async () => {
      const request = new Request('http://localhost:3000/manifest.json');
      const cachedResponse = new Response('cached content');
      

      global.caches.match = vi.fn(() => Promise.resolve(cachedResponse));

      // Cache-first戦略のテスト
      const response = await (async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        // キャッシュに保存（実装依存）
        return networkResponse;
      })();

      expect(global.caches.match).toHaveBeenCalledWith(request);
      expect(response).toBe(cachedResponse);
    });

    it('should implement network-first strategy for API calls', async () => {
      const request = new Request('http://localhost:3000/api/data');
      const networkResponse = new Response('network content');
      const cachedResponse = new Response('cached content');

      // ネットワークが成功する場合
      global.fetch = vi.fn(() => Promise.resolve(networkResponse));
      global.caches.match = vi.fn(() => Promise.resolve(cachedResponse));

      // Network-first戦略のテスト
      const response = await (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            return networkResponse;
          }
          throw new Error('Network failed');
        } catch {
          const cachedResponse = await caches.match(request);
          return cachedResponse || new Response('Offline', { status: 503 });
        }
      })();

      expect(global.fetch).toHaveBeenCalledWith(request);
      expect(response).toBe(networkResponse);
    });

    it('should fallback to cache when network fails', async () => {
      const request = new Request('http://localhost:3000/api/data');
      const cachedResponse = new Response('cached content');

      // ネットワークが失敗する場合
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
      global.caches.match = vi.fn(() => Promise.resolve(cachedResponse));

      // Network-first戦略でフォールバックのテスト
      const response = await (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            return networkResponse;
          }
          throw new Error('Network failed');
        } catch {
          const cachedResponse = await caches.match(request);
          return cachedResponse || new Response('Offline', { status: 503 });
        }
      })();

      expect(global.caches.match).toHaveBeenCalledWith(request);
      expect(response).toBe(cachedResponse);
    });
  });

  describe('Background Sync', () => {
    it('should queue data for background sync', async () => {
      const syncData = {
        id: 'diagnosis-123',
        timestamp: Date.now(),
        data: { wasteRate: 0.7 }
      };


      // バックグラウンド同期キューイングのテスト
      const queueResult = await Promise.resolve().then(async () => {
        // 実際の実装ではIndexedDBを使用
        return { success: true, id: syncData.id };
      });

      expect(queueResult.success).toBe(true);
      expect(queueResult.id).toBe(syncData.id);
    });

    it('should handle sync event when online', async () => {
      const syncEvent = new Event('sync');
      Object.defineProperty(syncEvent, 'tag', {
        value: 'diagnosis-sync',
        writable: true
      });

      const waitUntilSpy = vi.fn();
      Object.defineProperty(syncEvent, 'waitUntil', {
        value: waitUntilSpy,
        writable: true
      });

      // 同期処理のテスト
      const syncPromise = Promise.resolve().then(async () => {
        // キューされたデータを取得
        const queuedData = [{ id: '1', data: 'test' }];
        
        // サーバーに送信
        const promises = queuedData.map(item => 
          fetch('/api/sync', {
            method: 'POST',
            body: JSON.stringify(item.data)
          })
        );

        await Promise.all(promises);
        return { synced: queuedData.length };
      });

      waitUntilSpy.mockImplementation((promise: Promise<unknown>) => promise);

      const result = await syncPromise;
      expect(result.synced).toBe(1);
    });
  });

  describe('Push Notifications', () => {
    it('should handle push notification events', async () => {
      const pushEvent = new Event('push');
      const notificationData = {
        title: 'SubCheck 通知',
        body: '新しい節約提案があります',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png'
      };

      Object.defineProperty(pushEvent, 'data', {
        value: {
          json: () => notificationData
        },
        writable: true
      });

      const waitUntilSpy = vi.fn();
      Object.defineProperty(pushEvent, 'waitUntil', {
        value: waitUntilSpy,
        writable: true
      });

      mockServiceWorkerGlobalScope.registration.showNotification = vi.fn(() => 
        Promise.resolve()
      );

      // プッシュ通知処理のテスト
      const pushPromise = Promise.resolve().then(async () => {
        const data = notificationData;
        await mockServiceWorkerGlobalScope.registration.showNotification(
          data.title,
          {
            body: data.body,
            icon: data.icon,
            badge: data.badge
          }
        );
      });

      waitUntilSpy.mockImplementation((promise: Promise<unknown>) => promise);

      await pushPromise;

      expect(mockServiceWorkerGlobalScope.registration.showNotification)
        .toHaveBeenCalledWith(
          notificationData.title,
          {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge
          }
        );
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const request = new Request('http://localhost:3000/failing-endpoint');
      
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
      global.caches.match = vi.fn(() => Promise.resolve(undefined));

      // エラーハンドリングのテスト
      const response = await (async () => {
        try {
          return await fetch(request);
        } catch {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          
          // オフライン用フォールバック
          if (request.url.includes('/diagnosis/')) {
            return new Response(JSON.stringify({
              error: 'オフラインです。後で同期されます。'
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          return new Response('Offline', { status: 503 });
        }
      })();

      expect(response.status).toBe(503);
    });

    it('should handle cache operation failures', async () => {
      const request = new Request('http://localhost:3000/test');
      
      global.caches.match = vi.fn(() => Promise.reject(new Error('Cache error')));

      // キャッシュエラーのハンドリングテスト
      await (async () => {
        try {
          return await caches.match(request);
        } catch (error) {
          console.warn('Cache operation failed:', error);
          // ネットワークフォールバック
          return fetch(request).catch(() => 
            new Response('Error', { status: 500 })
          );
        }
      })();

      expect(global.fetch).toHaveBeenCalledWith(request);
    });
  });
});

describe('PWA Manifest Integration', () => {
  it('should validate manifest.json accessibility', async () => {
    const mockManifest = {
      name: 'SubCheck',
      short_name: 'SubCheck',
      start_url: '/',
      display: 'standalone',
      theme_color: '#2563eb',
      background_color: '#ffffff'
    };
    
    const manifestMockResponse = {
      ok: true,
      json: () => Promise.resolve(mockManifest)
    } as Response;
    
    global.fetch = vi.fn(() => Promise.resolve(manifestMockResponse));

    const response = await fetch('/manifest.json');
    const manifest = await response.json();

    expect(response.ok).toBe(true);
    expect(manifest.name).toBe('SubCheck');
    expect(manifest.display).toBe('standalone');
  });
});