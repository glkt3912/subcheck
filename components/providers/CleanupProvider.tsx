'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAutoCleanup, useStorageMonitor, useCleanupNotifications } from '@/lib/hooks/useAutoCleanup';
import { CleanupPresets } from '@/lib/utils/dataCleanup';

interface CleanupContextType {
  isCleanupEnabled: boolean;
  storageUsage: number;
  lastCleanup: Date | null;
  toggleAutoCleanup: () => void;
  triggerManualCleanup: () => Promise<void>;
}

const CleanupContext = createContext<CleanupContextType | undefined>(undefined);

interface CleanupProviderProps {
  children: React.ReactNode;
  autoCleanupEnabled?: boolean;
  storageThreshold?: number;
}

export default function CleanupProvider({ 
  children, 
  autoCleanupEnabled = true,
  storageThreshold = 80 
}: CleanupProviderProps) {
  const [isCleanupEnabled, setIsCleanupEnabled] = useState(autoCleanupEnabled);
  const [storageUsage, setStorageUsage] = useState(0);

  const { showCleanupNotification, requestNotificationPermission } = useCleanupNotifications();

  // Auto cleanup hook
  const { triggerCleanup, lastCleanup } = useAutoCleanup({
    enabled: isCleanupEnabled,
    intervalHours: 24,
    config: CleanupPresets.conservative,
    onCleanupComplete: (results) => {
      console.log('Auto cleanup completed:', results);
      showCleanupNotification(results);
      updateStorageUsage();
    },
    onError: (error) => {
      console.error('Auto cleanup error:', error);
    }
  });

  // Storage monitoring hook
  const { getStorageStats } = useStorageMonitor({
    threshold: storageThreshold,
    onThresholdExceeded: () => {
      console.warn('Storage threshold exceeded, consider manual cleanup');
      // Could trigger automatic cleanup here if desired
    },
    checkInterval: 300000 // Check every 5 minutes
  });

  const updateStorageUsage = () => {
    try {
      const stats = getStorageStats();
      setStorageUsage(stats.percentage);
    } catch (error) {
      console.error('Failed to update storage usage:', error);
    }
  };

  useEffect(() => {
    // Initial storage usage check
    updateStorageUsage();

    // Request notification permission
    requestNotificationPermission();

    // Set up periodic storage usage updates
    const interval = setInterval(updateStorageUsage, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const toggleAutoCleanup = () => {
    setIsCleanupEnabled(prev => !prev);
    localStorage.setItem('subcheck_auto_cleanup_enabled', (!isCleanupEnabled).toString());
  };

  const triggerManualCleanup = async () => {
    try {
      const results = await triggerCleanup();
      showCleanupNotification(results);
      updateStorageUsage();
    } catch (error) {
      console.error('Manual cleanup failed:', error);
      throw error;
    }
  };

  const contextValue: CleanupContextType = {
    isCleanupEnabled,
    storageUsage,
    lastCleanup,
    toggleAutoCleanup,
    triggerManualCleanup
  };

  return (
    <CleanupContext.Provider value={contextValue}>
      {children}
      {/* Optional: Storage usage warning */}
      {storageUsage > 90 && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <div>
              <div className="font-semibold">ストレージ容量不足</div>
              <div className="text-sm">使用率: {storageUsage.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}
    </CleanupContext.Provider>
  );
}

export function useCleanup(): CleanupContextType {
  const context = useContext(CleanupContext);
  if (context === undefined) {
    throw new Error('useCleanup must be used within a CleanupProvider');
  }
  return context;
}