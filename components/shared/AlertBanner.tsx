'use client';

import { useState } from 'react';
import { AlertNotification, AlertAction } from '@/types/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { AlertService } from '@/lib/services/AlertService';

interface AlertBannerProps {
  alert: AlertNotification;
  onDismiss?: (alertId: string, actionTaken?: string) => void;
  className?: string;
}

export function AlertBanner({ alert, onDismiss, className = '' }: AlertBannerProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleAction = (action: AlertAction) => {
    switch (action.type) {
      case 'navigate':
        if (action.url) {
          router.push(action.url);
        }
        break;
      
      case 'external':
        if (action.url) {
          window.open(action.url, '_blank');
        }
        break;
      
      case 'configure':
        // This would open settings/configuration modal
        console.log('Configure action triggered for:', action.handler);
        break;
      
      case 'dismiss':
      default:
        // Just dismiss
        break;
    }

    // Mark alert as acknowledged
    AlertService.acknowledgeAlert(alert.id, action.type);
    
    // Hide the banner
    setIsVisible(false);
    
    // Call onDismiss callback if provided
    onDismiss?.(alert.id, action.type);
  };

  const getSeverityStyles = (severity: AlertNotification['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          container: 'border-red-200 bg-red-50',
          icon: '🚨',
          iconBg: 'bg-red-100 text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      
      case 'warning':
        return {
          container: 'border-yellow-200 bg-yellow-50',
          icon: '⚠️',
          iconBg: 'bg-yellow-100 text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      
      case 'info':
      default:
        return {
          container: 'border-blue-200 bg-blue-50',
          icon: 'ℹ️',
          iconBg: 'bg-blue-100 text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const styles = getSeverityStyles(alert.severity);

  return (
    <Card className={`border-2 ${styles.container} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Alert Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center text-lg`}>
            {styles.icon}
          </div>

          {/* Alert Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`text-sm font-semibold ${styles.title}`}>
                  {alert.title}
                </h3>
                <p className={`mt-1 text-sm ${styles.message}`}>
                  {alert.message}
                </p>
                
                {/* Potential Savings Display */}
                {alert.suggestedSavings && (
                  <div className="mt-2 text-xs text-gray-600">
                    💰 節約可能額: 月額¥{alert.suggestedSavings.monthly.toLocaleString()} / 
                    年額¥{alert.suggestedSavings.yearly.toLocaleString()}
                  </div>
                )}

                {/* Extended Details */}
                {alert.details && (
                  <div className={`mt-2 text-xs ${styles.message} opacity-80`}>
                    {alert.details}
                  </div>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => handleAction({ type: 'dismiss', label: '閉じる' })}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="アラートを閉じる"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Action Buttons */}
            {alert.actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {alert.actions.slice(0, 2).map((action, index) => ( // Limit to 2 actions for banner
                  <Button
                    key={index}
                    onClick={() => handleAction(action)}
                    size="sm"
                    className={`text-xs ${
                      action.type === 'dismiss' 
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        : styles.button
                    }`}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AlertBanner;