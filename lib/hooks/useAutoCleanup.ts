'use client';

import { useEffect, useRef, useState } from 'react';
import { DataCleanupService, CleanupConfig } from '@/lib/utils/dataCleanup';

import { CleanupResult } from '@/lib/utils/dataCleanup';

interface AutoCleanupOptions {
  enabled?: boolean;
  intervalHours?: number;
  config?: CleanupConfig;
  onCleanupComplete?: (results: CleanupResult[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for automatic data cleanup in the background
 */
export function useAutoCleanup(options: AutoCleanupOptions = {}) {
  const {
    enabled = true,
    intervalHours = 24,
    config = {},
    onCleanupComplete,
    onError
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Check if cleanup is needed
    const checkAndCleanup = async () => {
      try {
        const lastCleanupTime = localStorage.getItem('subcheck_last_auto_cleanup');
        const now = new Date();
        
        if (lastCleanupTime) {
          const lastCleanup = new Date(lastCleanupTime);
          const hoursSinceLastCleanup = (now.getTime() - lastCleanup.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceLastCleanup < intervalHours) {
            console.log(`Auto cleanup skipped. ${hoursSinceLastCleanup.toFixed(1)} hours since last cleanup.`);
            return;
          }
        }

        console.log('Starting automatic cleanup...');
        const results = await DataCleanupService.performFullCleanup(config);
        
        // Update last cleanup time
        localStorage.setItem('subcheck_last_auto_cleanup', now.toISOString());
        setLastCleanup(now);

        console.log('Automatic cleanup completed:', results);
        onCleanupComplete?.(results);

      } catch (error) {
        console.error('Automatic cleanup failed:', error);
        onError?.(error as Error);
      }
    };

    // Initial check
    checkAndCleanup();

    // Set up interval
    const interval = intervalHours * 60 * 60 * 1000;
    intervalRef.current = setInterval(checkAndCleanup, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intervalHours, config, onCleanupComplete, onError]);

  // Manual trigger function
  const triggerCleanup = async () => {
    try {
      const results = await DataCleanupService.performFullCleanup(config);
      const now = new Date();
      localStorage.setItem('subcheck_last_auto_cleanup', now.toISOString());
      setLastCleanup(now);
      onCleanupComplete?.(results);
      return results;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  };

  return {
    triggerCleanup,
    lastCleanup
  };
}

/**
 * Hook for monitoring storage usage and triggering cleanup when needed
 */
export function useStorageMonitor(options: {
  threshold?: number; // percentage
  onThresholdExceeded?: () => void;
  checkInterval?: number; // milliseconds
} = {}) {
  const {
    threshold = 80,
    onThresholdExceeded,
    checkInterval = 60000 // 1 minute
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkStorage = () => {
      try {
        const stats = DataCleanupService.getStorageStats();
        
        if (stats.percentage >= threshold) {
          console.warn(`Storage usage high: ${stats.percentage.toFixed(1)}%`);
          onThresholdExceeded?.();
        }
      } catch (error) {
        console.error('Storage monitoring failed:', error);
      }
    };

    // Initial check
    checkStorage();

    // Set up monitoring interval
    intervalRef.current = setInterval(checkStorage, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [threshold, onThresholdExceeded, checkInterval]);

  return {
    getStorageStats: () => DataCleanupService.getStorageStats()
  };
}

/**
 * Hook for cleanup notifications
 */
export function useCleanupNotifications() {
  const showCleanupNotification = (results: CleanupResult[]) => {
    const totalItemsRemoved = results.reduce((sum, result) => sum + result.itemsRemoved, 0);
    const totalSpaceFreed = results.reduce((sum, result) => sum + result.storageFreed, 0);

    if (totalItemsRemoved > 0) {
      const message = `クリーンアップ完了: ${totalItemsRemoved}個のアイテムを削除し、${formatBytes(totalSpaceFreed)}の容量を解放しました。`;
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('SubCheck データクリーンアップ', {
          body: message,
          icon: '/favicon.ico'
        });
      } else {
        // Fallback to console log
        console.log(message);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return {
    showCleanupNotification,
    requestNotificationPermission
  };
}

// Utility function
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}