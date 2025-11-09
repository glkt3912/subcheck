'use client';

import { useState, useEffect } from 'react';
import { AlertNotification } from '@/types/alert';
// import { AlertService } from '@/lib/services/AlertService'; // Unused import
import { AlertBanner } from './AlertBanner';
import { AlertCard } from './AlertCard';

interface AlertsContainerProps {
  alerts: AlertNotification[];
  displayMode?: 'banner' | 'card' | 'both';
  maxVisible?: number;
  className?: string;
  onAlertsChange?: (alerts: AlertNotification[]) => void;
}

export function AlertsContainer({ 
  alerts: initialAlerts,
  displayMode = 'banner',
  maxVisible = 3,
  className = '',
  onAlertsChange
}: AlertsContainerProps) {
  const [alerts, setAlerts] = useState<AlertNotification[]>(initialAlerts);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Update alerts when props change
  useEffect(() => {
    setAlerts(initialAlerts);
  }, [initialAlerts]);

  // Filter visible alerts
  const visibleAlerts = alerts
    .filter(alert => !dismissedAlerts.has(alert.id))
    .slice(0, maxVisible);

  const handleAlertDismiss = (alertId: string, actionTaken?: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    
    // Notify parent component
    const remainingAlerts = alerts.filter(alert => alert.id !== alertId);
    onAlertsChange?.(remainingAlerts);
    
    // Log dismissal for analytics/debugging
    console.log(`Alert dismissed: ${alertId}, action: ${actionTaken}`);
  };

  const clearAllAlerts = () => {
    const allAlertIds = alerts.map(alert => alert.id);
    setDismissedAlerts(new Set(allAlertIds));
    onAlertsChange?.([]);
  };

  // Auto-hide alerts if specified
  useEffect(() => {
    const autoHideAlerts = alerts.filter(alert => alert.autoHide);
    
    if (autoHideAlerts.length > 0) {
      const timer = setTimeout(() => {
        const idsToHide = autoHideAlerts.map(alert => alert.id);
        setDismissedAlerts(prev => new Set([...prev, ...idsToHide]));
      }, 5000); // Auto-hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [alerts]);

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with clear all option for multiple alerts */}
      {visibleAlerts.length > 1 && (
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">
            通知 ({visibleAlerts.length}件)
          </h3>
          <button
            onClick={clearAllAlerts}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            すべて消去
          </button>
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-2">
        {visibleAlerts.map((alert, index) => {
          // Show critical alerts as banners for immediate attention
          const shouldUseBanner = (
            displayMode === 'banner' || 
            (displayMode === 'both' && alert.severity === 'critical')
          );
          
          // Show detailed view for cards
          const shouldUseCard = (
            displayMode === 'card' || 
            (displayMode === 'both' && alert.severity !== 'critical')
          );

          if (shouldUseBanner) {
            return (
              <AlertBanner
                key={alert.id}
                alert={alert}
                onDismiss={handleAlertDismiss}
                className="animate-fadeIn"
              />
            );
          }

          if (shouldUseCard) {
            return (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={handleAlertDismiss}
                expanded={index === 0 && alert.severity === 'critical'} // Auto-expand first critical alert
                className="animate-fadeIn"
              />
            );
          }

          return null;
        })}
      </div>

      {/* Show truncation indicator if there are more alerts */}
      {alerts.length > maxVisible && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            他に{alerts.length - maxVisible}件の通知があります
          </p>
        </div>
      )}
    </div>
  );
}

export default AlertsContainer;