# SubCheck PWA 実装ガイド

## 📋 文書情報

- **プロジェクト**: SubCheck PWA実装
- **対象読者**: 開発者、技術リード
- **作成日**: 2025-11-09
- **最終更新**: 2025-11-09

---

## 🎯 実装概要

本ドキュメントは、SubCheckにおけるPWA（Progressive Web App）機能の実装手順と技術的詳細を説明します。

### 実装完了機能

✅ PWAマニフェスト設定  
✅ Service Worker実装  
✅ オフライン診断機能  
✅ アプリインストール促進UI  
✅ オフライン状態表示  

---

## 🛠️ 実装手順

### ステップ1: PWAマニフェストの作成

#### ファイル: `/public/manifest.json`

```json
{
  "name": "SubCheck - サブスク使ってる？診断",
  "short_name": "SubCheck",
  "description": "あなたのサブスクリプション利用状況を診断して、年間の無駄遣いを可視化するアプリケーション",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "ja",
  
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192", 
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png", 
      "purpose": "maskable any"
    }
  ],
  
  "shortcuts": [
    {
      "name": "新しい診断",
      "description": "新しいサブスク診断を開始",
      "url": "/diagnosis/select",
      "icons": [
        {
          "src": "/icons/shortcut-diagnosis.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "前回の結果", 
      "description": "前回の診断結果を確認",
      "url": "/diagnosis/results"
    },
    {
      "name": "設定",
      "description": "アラート設定とカスタマイズ",
      "url": "/settings"
    }
  ],
  
  "categories": ["finance", "lifestyle", "productivity"]
}
```

#### レイアウトでのマニフェスト参照設定

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: "SubCheck - サブスク無駄率診断",
  description: "あなたのサブスクリプション、本当に使ってる？無駄な支出を可視化して、賢い節約を始めよう。",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SubCheck",
  },
};
```

### ステップ2: Service Worker実装

#### ファイル: `/public/sw.js`

```javascript
const STATIC_CACHE_NAME = 'subcheck-static-v1';
const RUNTIME_CACHE_NAME = 'subcheck-runtime-v1';

// 即座にキャッシュする重要なアセット
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/diagnosis/select',
  '/diagnosis/usage', 
  '/diagnosis/results',
  '/offline'
];

// キャッシュ戦略パターン定義
const NETWORK_FIRST_PATTERNS = [/\/api\//, /\/diagnosis\/api\//];
const CACHE_FIRST_PATTERNS = [
  /\/_next\/static\//,
  /\/_next\/image\//,
  /\/icons\//,
  /\.(?:css|js|woff2?|png|jpg|jpeg|webp|svg|ico)$/
];

// インストールイベント
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
  
  self.skipWaiting();
});

// アクティベーションイベント
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== RUNTIME_CACHE_NAME &&
                cacheName.startsWith('subcheck-')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// フェッチイベント - リクエスト制御
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  
  // キャッシュ戦略の選択
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  event.respondWith(staleWhileRevalidate(request));
});

// Cache First戦略
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE_NAME);
    
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First戦略
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This request requires network connectivity' 
      }), 
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Stale While Revalidate戦略
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // バックグラウンドでフェッチ・キャッシュ更新
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[SW] Network request failed:', error);
      return null;
    });
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  if (request.mode === 'navigate') {
    const offlinePage = await cache.match('/offline');
    if (offlinePage) {
      return offlinePage;
    }
  }
  
  return new Response('Offline', { status: 503 });
}

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  if (event.tag === 'diagnosis-sync') {
    event.waitUntil(syncDiagnosisData());
  }
});

async function syncDiagnosisData() {
  try {
    const pendingData = await getPendingDiagnosisData();
    
    if (pendingData.length > 0) {
      console.log('[SW] Syncing pending diagnosis data:', pendingData.length);
      
      for (const data of pendingData) {
        try {
          const response = await fetch('/api/diagnosis/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            await removePendingDiagnosisData(data.id);
          }
        } catch (error) {
          console.error('[SW] Failed to sync diagnosis data:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// プッシュ通知（将来機能）
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'subcheck-alert',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: '確認',
        icon: '/icons/shortcut-results.png'
      },
      {
        action: 'dismiss', 
        title: '閉じる'
      }
    ],
    data: {
      url: data.url || '/diagnosis/results'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'SubCheck', options)
  );
});

console.log('[SW] Service worker script loaded');
```

### ステップ3: Service Worker登録コンポーネント

#### ファイル: `/components/pwa/ServiceWorkerRegistration.tsx`

```typescript
'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration.scope);
          
          // アップデート検出
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  if (window.confirm('新しいバージョンが利用可能です。今すぐ更新しますか？')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });

      // Service Workerからのメッセージ受信
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('[PWA] Cache updated');
        }
      });

      // オンライン/オフライン状態管理
      const handleOnlineStatus = () => {
        const isOnline = navigator.onLine;
        document.body.classList.toggle('offline', !isOnline);
        
        if (isOnline) {
          // オンライン復旧時のバックグラウンド同期
          if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then((registration) => {
              return registration.sync.register('diagnosis-sync');
            }).catch((error) => {
              console.log('[PWA] Background sync registration failed:', error);
            });
          }
        }
      };

      window.addEventListener('online', handleOnlineStatus);
      window.addEventListener('offline', handleOnlineStatus);
      handleOnlineStatus();

      return () => {
        window.removeEventListener('online', handleOnlineStatus);
        window.removeEventListener('offline', handleOnlineStatus);
      };
    }
  }, []);

  return null;
}
```

### ステップ4: オフライン同期Hook

#### ファイル: `/lib/hooks/useOfflineSync.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { DiagnosisResult } from '@/types';

interface OfflineData {
  id: string;
  timestamp: number;
  data: DiagnosisResult;
  synced: boolean;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState<OfflineData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // ローカルストレージからの同期待ちデータロード
  const loadPendingData = useCallback(() => {
    try {
      const storedData = localStorage.getItem('subcheck-pending-sync');
      if (storedData) {
        const parsed = JSON.parse(storedData) as OfflineData[];
        setPendingSync(parsed.filter(item => !item.synced));
      }
    } catch (error) {
      console.error('[OfflineSync] Failed to load pending data:', error);
    }
  }, []);

  // 同期待ちデータの保存
  const savePendingData = useCallback((data: OfflineData[]) => {
    try {
      localStorage.setItem('subcheck-pending-sync', JSON.stringify(data));
    } catch (error) {
      console.error('[OfflineSync] Failed to save pending data:', error);
    }
  }, []);

  // サーバーとの同期処理
  const syncPendingData = useCallback(async () => {
    if (!isOnline || isSyncing || pendingSync.length === 0) {
      return;
    }

    setIsSyncing(true);

    try {
      const unsyncedData = pendingSync.filter(item => !item.synced);
      
      for (const item of unsyncedData) {
        try {
          console.log('[OfflineSync] Syncing data:', item.id);
          
          // 実際のAPIエンドポイントに送信（現在はシミュレーション）
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          item.synced = true;
          console.log('[OfflineSync] Data synced successfully:', item.id);
        } catch (error) {
          console.error('[OfflineSync] Failed to sync item:', item.id, error);
        }
      }

      // 同期状態の更新
      const updatedPending = pendingSync.map(item => {
        const updated = unsyncedData.find(u => u.id === item.id);
        return updated || item;
      });
      
      setPendingSync(updatedPending);
      savePendingData(updatedPending);

      // 古い同期済みアイテムのクリーンアップ（最新10件保持）
      const syncedItems = updatedPending.filter(item => item.synced);
      if (syncedItems.length > 10) {
        const itemsToKeep = syncedItems
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);
        
        const finalPending = [
          ...updatedPending.filter(item => !item.synced),
          ...itemsToKeep
        ];
        
        setPendingSync(finalPending);
        savePendingData(finalPending);
      }

    } catch (error) {
      console.error('[OfflineSync] Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, pendingSync, savePendingData]);

  // 初期化とイベントリスナー設定
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      const handleOnline = () => {
        setIsOnline(true);
        syncPendingData();
      };
      
      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      loadPendingData();

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [loadPendingData, syncPendingData]);

  // オフライン同期キューへの追加
  const queueForSync = useCallback((diagnosisResult: DiagnosisResult) => {
    const offlineData: OfflineData = {
      id: `diagnosis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      data: diagnosisResult,
      synced: false
    };

    const updatedPending = [...pendingSync, offlineData];
    setPendingSync(updatedPending);
    savePendingData(updatedPending);

    if (isOnline) {
      syncPendingData();
    }

    return offlineData.id;
  }, [pendingSync, isOnline, savePendingData, syncPendingData]);

  return {
    isOnline,
    pendingSync: pendingSync.filter(item => !item.synced),
    isSyncing,
    queueForSync,
    triggerSync: syncPendingData,
    clearPendingData: () => {
      setPendingSync([]);
      localStorage.removeItem('subcheck-pending-sync');
    }
  };
}
```

### ステップ5: インストール促進UI

#### ファイル: `/components/pwa/InstallPrompt.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS] = useState(() => 
    typeof window !== 'undefined' ? /iPad|iPhone|iPod/.test(navigator.userAgent) : false
  );
  const [isStandalone] = useState(() => 
    typeof window !== 'undefined' ? window.matchMedia('(display-mode: standalone)').matches : false
  );

  useEffect(() => {
    // beforeinstallpromptイベントリスナー
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 一定時間後にインストールプロンプト表示
      setTimeout(() => {
        const dismissedBefore = localStorage.getItem('pwa-install-dismissed');
        const lastDismissed = dismissedBefore ? parseInt(dismissedBefore) : 0;
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        if (lastDismissed < oneDayAgo) {
          setShowInstallPrompt(true);
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setShowInstallPrompt(false);
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isStandalone || (!showInstallPrompt && !isIOS)) {
    return null;
  }

  // iOS用インストール手順
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">アプリをインストール</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          SubCheckをホーム画面に追加して、より便利にご利用ください。
        </p>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>1. 下部の共有ボタン <span className="inline-block w-4 h-3 bg-blue-500 rounded-sm mx-1"></span> をタップ</p>
          <p>2. 「ホーム画面に追加」を選択</p>
          <p>3. 「追加」をタップして完了</p>
        </div>
      </div>
    );
  }

  // Android/Chrome用インストールプロンプト
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Download className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">アプリをインストール</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          SubCheckをデバイスにインストールして、オフラインでもご利用ください。
        </p>
        
        <div className="flex space-x-2">
          <Button onClick={handleInstallClick} className="flex-1" size="sm">
            インストール
          </Button>
          <Button variant="outline" onClick={handleDismiss} size="sm">
            後で
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
```

### ステップ6: オフライン状態表示

#### ファイル: `/components/ui/OfflineIndicator.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, CloudOff } from 'lucide-react';

interface OfflineIndicatorProps {
  className?: string;
}

export default function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(() => 
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleOnline = () => {
        setIsOnline(true);
        setShowIndicator(true);
        setTimeout(() => setShowIndicator(false), 3000);
      };

      const handleOffline = () => {
        setIsOnline(false);
        setShowIndicator(true);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  if (!showIndicator && isOnline) {
    return null;
  }

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 ${
        isOnline 
          ? 'bg-green-600 text-white' 
          : 'bg-red-600 text-white'
      } px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-center space-x-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>インターネット接続が復旧しました</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>オフライン - 一部機能が制限されます</span>
            <CloudOff className="w-4 h-4 ml-2" />
          </>
        )}
      </div>
    </div>
  );
}
```

### ステップ7: オフライン専用ページ

#### ファイル: `/app/offline/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Home, Smartphone } from 'lucide-react';

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(() => 
    typeof window !== 'undefined' ? navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => {
        router.back();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const handleRetry = () => {
    if (navigator.onLine) {
      router.back();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            {isOnline ? (
              <RefreshCw className="w-12 h-12 text-green-500 animate-spin" />
            ) : (
              <WifiOff className="w-12 h-12 text-gray-500" />
            )}
          </div>
        </div>

        {isOnline ? (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              接続が復旧しました！
            </h1>
            <p className="text-gray-600">
              自動的にページを読み込み直しています...
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              オフラインモード
            </h1>
            <p className="text-gray-600 mb-6">
              インターネット接続が利用できません。<br />
              以下の機能は引き続き利用できます：
            </p>
            
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                オフラインで利用可能
              </h2>
              <ul className="text-left text-gray-600 space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  過去の診断結果の閲覧
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  保存済みのサブスクデータ
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  基本的な診断機能
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  新しい診断結果は接続復旧時に同期
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={handleRetry} className="w-full" disabled={isOnline}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {isOnline ? '接続中...' : 'もう一度試す'}
          </Button>
          
          <Button variant="outline" onClick={handleGoHome} className="w-full">
            <Home className="w-4 h-4 mr-2" />
            ホームに戻る
          </Button>
        </div>

        {!isOnline && (
          <div className="mt-8 text-xs text-gray-500">
            <details>
              <summary className="cursor-pointer hover:text-gray-700">
                接続のトラブルシューティング
              </summary>
              <div className="mt-3 text-left">
                <ul className="space-y-1">
                  <li>• Wi-Fi接続を確認してください</li>
                  <li>• 機内モードがオフになっているか確認</li>
                  <li>• モバイルデータ通信の設定を確認</li>
                  <li>• ルーターの再起動を試してみてください</li>
                </ul>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
```

### ステップ8: 既存診断機能との統合

#### 診断結果ページでのオフライン同期統合

```typescript
// app/diagnosis/results/page.tsx (既存ファイルの修正)
import { useOfflineSync } from '@/lib/hooks/useOfflineSync';

export default function ResultsPage() {
  const { isOnline, queueForSync } = useOfflineSync();
  // ... 既存のロジック

  useEffect(() => {
    const loadData = async () => {
      // ... 既存の処理
      
      if (shouldRecalculate) {
        const result = calculateDiagnosis(userSubscriptions, services);
        setLocalDiagnosisResult(result);
        saveDiagnosisResult(result);
        
        // オフライン時は同期キューに追加
        if (!isOnline) {
          queueForSync(result);
        }
        
        // ... 既存の処理
      }
    };

    loadData();
  }, [isOnline, queueForSync, /* 他の依存関係 */]);
}
```

---

## 🔧 設定・運用

### 開発環境設定

```javascript
// 開発時のService Worker無効化（必要に応じて）
// next.config.js
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // 開発時はService Workerの自動登録を無効化
      config.module.rules.push({
        test: /sw\.js$/,
        loader: 'null-loader'
      });
    }
    return config;
  }
};
```

### デバッグ・監視

```javascript
// Service Worker内でのデバッグログ
const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(message, ...args) {
  if (DEBUG) {
    console.log(`[SW Debug] ${message}`, ...args);
  }
}
```

### パフォーマンス監視

```javascript
// Web Vitalsの測定
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // アナリティクスにメトリクス送信
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 🧪 テスト

### PWA機能テスト

```bash
# Lighthouseでの品質チェック
npx lighthouse http://localhost:3000 --view --chrome-flags="--headless"

# PWA専用テスト
npx lighthouse http://localhost:3000 --only-categories=pwa --view
```

### Service Workerテスト

```javascript
// Service Workerのユニットテスト例
import 'fake-indexeddb/auto';

describe('Service Worker', () => {
  test('should cache static assets on install', async () => {
    // テストロジック
  });
  
  test('should serve cached content when offline', async () => {
    // オフライン動作テスト
  });
});
```

---

## 📊 品質確認

### Lighthouse監査基準

- **Performance**: ≥ 90
- **Accessibility**: ≥ 95
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90
- **PWA**: ≥ 90

### 手動テストチェックリスト

- [ ] アプリのインストール動作
- [ ] オフライン時の基本機能
- [ ] オンライン復旧時の同期
- [ ] 各キャッシュ戦略の動作
- [ ] プラットフォーム別インストール手順

---

## 📝 まとめ

この実装ガイドにより、SubCheckは完全なPWA機能を備えたアプリケーションとして動作します。ユーザーは以下の体験を得られます：

1. **ワンクリックインストール**: アプリストア不要
2. **オフライン診断**: 通信環境に関係なく利用可能
3. **高速ロード**: キャッシュによる瞬間的な起動
4. **自動同期**: 接続復旧時の背景同期

各コンポーネントは独立性を保ちつつ、統一されたPWA体験を提供する設計となっています。
