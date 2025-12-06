// IndexedDB Service for SubCheck PWA
// Handles offline data persistence and background sync queue

import type { DiagnosisResult } from '@/types';

const DB_NAME = 'subcheck-db';
const DB_VERSION = 1;

// Object Store names
const STORES = {
  PENDING_SYNC: 'pending-diagnosis-sync',
  DIAGNOSIS_HISTORY: 'diagnosis-history',
} as const;

// Pending sync data structure
export interface PendingDiagnosisData {
  id: string;
  timestamp: number;
  data: DiagnosisResult;
  synced: boolean;
  createdAt: string;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('IndexedDB is not available');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create pending-diagnosis-sync store
        if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
          const pendingStore = db.createObjectStore(STORES.PENDING_SYNC, {
            keyPath: 'id',
          });
          pendingStore.createIndex('synced', 'synced', { unique: false });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create diagnosis-history store
        if (!db.objectStoreNames.contains(STORES.DIAGNOSIS_HISTORY)) {
          const historyStore = db.createObjectStore(STORES.DIAGNOSIS_HISTORY, {
            keyPath: 'shareId',
          });
          historyStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  /**
   * Check if IndexedDB is available
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  /**
   * Add diagnosis data to sync queue (for offline operations)
   */
  async addPendingDiagnosisData(data: DiagnosisResult): Promise<void> {
    if (!this.db) await this.init();

    const pendingData: PendingDiagnosisData = {
      id: `diagnosis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      data,
      synced: false,
      createdAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.PENDING_SYNC, 'readwrite');
      const store = tx.objectStore(STORES.PENDING_SYNC);
      const request = store.add(pendingData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to add pending diagnosis data'));
    });
  }

  /**
   * Get all unsynced diagnosis data
   */
  async getPendingDiagnosisData(): Promise<PendingDiagnosisData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.PENDING_SYNC, 'readonly');
      const store = tx.objectStore(STORES.PENDING_SYNC);
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(false)); // Get all unsynced items

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error('Failed to get pending diagnosis data'));
    });
  }

  /**
   * Remove diagnosis data from sync queue after successful sync
   */
  async removePendingDiagnosisData(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.PENDING_SYNC, 'readwrite');
      const store = tx.objectStore(STORES.PENDING_SYNC);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to remove pending diagnosis data'));
    });
  }

  /**
   * Mark diagnosis data as synced
   */
  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.PENDING_SYNC, 'readwrite');
      const store = tx.objectStore(STORES.PENDING_SYNC);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(new Error('Failed to mark as synced'));
        } else {
          reject(new Error('Pending data not found'));
        }
      };

      getRequest.onerror = () => reject(new Error('Failed to get pending data'));
    });
  }

  /**
   * Save diagnosis result to history
   */
  async saveDiagnosisHistory(result: DiagnosisResult): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.DIAGNOSIS_HISTORY, 'readwrite');
      const store = tx.objectStore(STORES.DIAGNOSIS_HISTORY);

      // Convert Date to ISO string for storage
      const storableResult = {
        ...result,
        createdAt: result.createdAt instanceof Date
          ? result.createdAt.toISOString()
          : result.createdAt,
      };

      const request = store.put(storableResult);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save diagnosis history'));
    });
  }

  /**
   * Get diagnosis history (latest 10 items)
   */
  async getDiagnosisHistory(): Promise<DiagnosisResult[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.DIAGNOSIS_HISTORY, 'readonly');
      const store = tx.objectStore(STORES.DIAGNOSIS_HISTORY);
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev'); // Descending order

      const results: DiagnosisResult[] = [];
      let count = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && count < 10) {
          const data = cursor.value;
          // Convert ISO string back to Date
          results.push({
            ...data,
            createdAt: new Date(data.createdAt),
          });
          count++;
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(new Error('Failed to get diagnosis history'));
    });
  }

  /**
   * Clear all data (for testing/debugging)
   */
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(
        [STORES.PENDING_SYNC, STORES.DIAGNOSIS_HISTORY],
        'readwrite'
      );

      const pendingStore = tx.objectStore(STORES.PENDING_SYNC);
      const historyStore = tx.objectStore(STORES.DIAGNOSIS_HISTORY);

      pendingStore.clear();
      historyStore.clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to clear IndexedDB'));
    });
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const indexedDBService = new IndexedDBService();
