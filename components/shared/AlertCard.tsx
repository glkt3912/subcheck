'use client';

import { useState } from 'react';
import { AlertNotification, AlertAction } from '@/types/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { AlertService } from '@/lib/services/AlertService';

interface AlertCardProps {
  alert: AlertNotification;
  onDismiss?: (alertId: string, actionTaken?: string) => void;
  className?: string;
  expanded?: boolean;
}

export function AlertCard({ alert, onDismiss, className = '', expanded = false }: AlertCardProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(expanded);

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
        // This would open settings/configuration
        console.log('Configure action triggered for:', action.handler);
        // In a real app, this might open a modal or navigate to settings
        break;
      
      case 'dismiss':
      default:
        // Just dismiss
        break;
    }

    // Mark alert as acknowledged
    AlertService.acknowledgeAlert(alert.id, action.type);
    
    // Hide the card if it's a dismiss action
    if (action.type === 'dismiss') {
      setIsVisible(false);
    }
    
    // Call onDismiss callback if provided
    onDismiss?.(alert.id, action.type);
  };

  const getSeverityStyles = (severity: AlertNotification['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-l-red-500',
          headerBg: 'bg-red-50',
          icon: '🚨',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          contentBg: 'bg-white',
          messageColor: 'text-red-700'
        };
      
      case 'warning':
        return {
          border: 'border-l-yellow-500',
          headerBg: 'bg-yellow-50',
          icon: '⚠️',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          contentBg: 'bg-white',
          messageColor: 'text-yellow-700'
        };
      
      case 'info':
      default:
        return {
          border: 'border-l-blue-500',
          headerBg: 'bg-blue-50',
          icon: 'ℹ️',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          contentBg: 'bg-white',
          messageColor: 'text-blue-700'
        };
    }
  };

  const styles = getSeverityStyles(alert.severity);

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className={`border-l-4 ${styles.border} shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className={`${styles.headerBg} pb-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`text-xl ${styles.iconColor}`}>{styles.icon}</span>
            <CardTitle className={`text-lg ${styles.titleColor}`}>
              {alert.title}
            </CardTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Priority Indicator */}
            {alert.priority > 7 && (
              <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                緊急
              </span>
            )}
            
            {/* Timestamp */}
            <span className="text-xs text-gray-500">
              {formatTimestamp(alert.createdAt)}
            </span>
            
            {/* Close Button */}
            <button
              onClick={() => handleAction({ type: 'dismiss', label: '閉じる' })}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="アラートを閉じる"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`${styles.contentBg} pt-3`}>
        {/* Main Message */}
        <p className={`text-sm ${styles.messageColor} mb-3`}>
          {alert.message}
        </p>

        {/* Potential Savings - Prominent Display */}
        {alert.suggestedSavings && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-green-600">💰</span>
              <span className="text-sm font-semibold text-green-800">節約可能額</span>
            </div>
            <div className="text-sm text-green-700">
              <span className="font-medium">月額: ¥{alert.suggestedSavings.monthly.toLocaleString()}</span>
              <span className="mx-2">•</span>
              <span className="font-medium">年額: ¥{alert.suggestedSavings.yearly.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Extended Details (Expandable) */}
        {alert.details && (
          <div className="mb-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>{isExpanded ? '詳細を隠す' : '詳細を表示'}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isExpanded && (
              <div className={`mt-2 text-sm ${styles.messageColor} bg-gray-50 p-3 rounded-md`}>
                {alert.details}
              </div>
            )}
          </div>
        )}

        {/* Affected Services */}
        {alert.affectedServices && alert.affectedServices.length > 0 && (
          <div className="mb-3 text-xs text-gray-600">
            <span className="font-medium">関連サービス: </span>
            {alert.affectedServices.join(', ')}
          </div>
        )}

        {/* Action Buttons */}
        {alert.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {alert.actions.map((action, index) => (
              <Button
                key={index}
                onClick={() => handleAction(action)}
                size="sm"
                variant={action.type === 'dismiss' ? 'outline' : 'default'}
                className={`text-sm ${
                  action.type === 'dismiss'
                    ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    : ''
                }`}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AlertCard;