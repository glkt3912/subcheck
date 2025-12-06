"use client";

import { useState, useEffect, useCallback } from "react";
import { DiagnosisResult } from "@/types";
import { indexedDBService, PendingDiagnosisData } from "@/lib/storage/IndexedDBService";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState<PendingDiagnosisData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load pending sync data from IndexedDB
  const loadPendingData = useCallback(async () => {
    try {
      const data = await indexedDBService.getPendingDiagnosisData();
      setPendingSync(data);
    } catch (error) {
      console.error("[OfflineSync] Failed to load pending data:", error);
    }
  }, []);

  // Sync pending data with server
  const syncPendingData = useCallback(async () => {
    if (!isOnline || isSyncing || pendingSync.length === 0) {
      return;
    }

    setIsSyncing(true);

    try {
      for (const item of pendingSync) {
        if (item.synced) continue;

        try {
          // Simulate API call to sync diagnosis result
          // In a real app, this would be an actual API endpoint
          console.log("[OfflineSync] Syncing data:", item.id);

          // For now, just mark as synced after a delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mark as synced in IndexedDB
          await indexedDBService.markAsSynced(item.id);

          console.log("[OfflineSync] Data synced successfully:", item.id);
        } catch (error) {
          console.error("[OfflineSync] Failed to sync item:", item.id, error);
        }
      }

      // Reload pending data after sync
      await loadPendingData();
    } catch (error) {
      console.error("[OfflineSync] Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, pendingSync, loadPendingData]);

  // Initialize online status
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        // Trigger sync when coming back online
        syncPendingData();
      };

      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Load pending data from localStorage
      loadPendingData();

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [loadPendingData, syncPendingData]);

  // Add data to offline queue
  const queueForSync = useCallback(
    async (diagnosisResult: DiagnosisResult) => {
      try {
        await indexedDBService.addPendingDiagnosisData(diagnosisResult);
        await loadPendingData();

        // If online, try to sync immediately
        if (isOnline) {
          syncPendingData();
        }

        return `diagnosis-${Date.now()}`;
      } catch (error) {
        console.error("[OfflineSync] Failed to queue for sync:", error);
        throw error;
      }
    },
    [isOnline, loadPendingData, syncPendingData]
  );

  // Get offline capability status
  const getOfflineCapabilities = useCallback(() => {
    return {
      canWorkOffline: true,
      hasServiceWorker: "serviceWorker" in navigator,
      hasCachedData: pendingSync.length > 0,
      pendingCount: pendingSync.filter((item) => !item.synced).length,
    };
  }, [pendingSync]);

  // Manual sync trigger
  const triggerSync = useCallback(() => {
    if (isOnline && !isSyncing) {
      syncPendingData();
    }
  }, [isOnline, isSyncing, syncPendingData]);

  // Clear all pending data (for testing or reset)
  const clearPendingData = useCallback(async () => {
    try {
      await indexedDBService.clearAll();
      setPendingSync([]);
    } catch (error) {
      console.error("[OfflineSync] Failed to clear pending data:", error);
    }
  }, []);

  return {
    isOnline,
    pendingSync: pendingSync.filter((item) => !item.synced),
    isSyncing,
    queueForSync,
    triggerSync,
    clearPendingData,
    getOfflineCapabilities,
  };
}
