"use client";

import { useState, useEffect, useCallback } from "react";
import { DiagnosisResult } from "@/types";

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

  // Load pending sync data from localStorage
  const loadPendingData = useCallback(() => {
    try {
      const storedData = localStorage.getItem("subcheck-pending-sync");
      if (storedData) {
        const parsed = JSON.parse(storedData) as OfflineData[];
        setPendingSync(parsed.filter((item) => !item.synced));
      }
    } catch (error) {
      console.error("[OfflineSync] Failed to load pending data:", error);
    }
  }, []);

  // Save pending data to localStorage
  const savePendingData = useCallback((data: OfflineData[]) => {
    try {
      localStorage.setItem("subcheck-pending-sync", JSON.stringify(data));
    } catch (error) {
      console.error("[OfflineSync] Failed to save pending data:", error);
    }
  }, []);

  // Sync pending data with server
  const syncPendingData = useCallback(async () => {
    if (!isOnline || isSyncing || pendingSync.length === 0) {
      return;
    }

    setIsSyncing(true);

    try {
      const unsyncedData = pendingSync.filter((item) => !item.synced);

      for (const item of unsyncedData) {
        try {
          // Simulate API call to sync diagnosis result
          // In a real app, this would be an actual API endpoint
          console.log("[OfflineSync] Syncing data:", item.id);

          // For now, just mark as synced after a delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mark as synced
          item.synced = true;

          console.log("[OfflineSync] Data synced successfully:", item.id);
        } catch (error) {
          console.error("[OfflineSync] Failed to sync item:", item.id, error);
          // Leave item as unsynced for retry
        }
      }

      // Update storage with sync status
      const updatedPending = pendingSync.map((item) => {
        const updated = unsyncedData.find((u) => u.id === item.id);
        return updated || item;
      });

      setPendingSync(updatedPending);
      savePendingData(updatedPending);

      // Clean up old synced items (keep only last 10)
      const syncedItems = updatedPending.filter((item) => item.synced);
      if (syncedItems.length > 10) {
        const itemsToKeep = syncedItems
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);

        const finalPending = [
          ...updatedPending.filter((item) => !item.synced),
          ...itemsToKeep,
        ];

        setPendingSync(finalPending);
        savePendingData(finalPending);
      }
    } catch (error) {
      console.error("[OfflineSync] Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, pendingSync, savePendingData]);

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
    (diagnosisResult: DiagnosisResult) => {
      const offlineData: OfflineData = {
        id: `diagnosis-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        timestamp: Date.now(),
        data: diagnosisResult,
        synced: false,
      };

      const updatedPending = [...pendingSync, offlineData];
      setPendingSync(updatedPending);
      savePendingData(updatedPending);

      // If online, try to sync immediately
      if (isOnline) {
        syncPendingData();
      }

      return offlineData.id;
    },
    [pendingSync, isOnline, savePendingData, syncPendingData]
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
  const clearPendingData = useCallback(() => {
    setPendingSync([]);
    try {
      localStorage.removeItem("subcheck-pending-sync");
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
