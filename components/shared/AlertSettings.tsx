'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertSettings as AlertSettingsType, AlertCondition } from '@/types/alert';
import { AlertService } from '@/lib/services/AlertService';

interface AlertSettingsProps {
  className?: string;
  onSettingsChange?: (settings: AlertSettingsType) => void;
}

export function AlertSettings({ className = '', onSettingsChange }: AlertSettingsProps) {
  const [settings, setSettings] = useState<AlertSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load current settings
    const loadSettings = () => {
      try {
        const currentSettings = AlertService.getAlertSettings();
        setSettings(currentSettings);
      } catch (error) {
        console.error('Failed to load alert settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleToggleAlerts = () => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      enabled: !settings.enabled
    };
    
    setSettings(updatedSettings);
  };

  const handleConditionToggle = (conditionId: string) => {
    if (!settings) return;

    const updatedConditions = settings.conditions.map(condition =>
      condition.id === conditionId
        ? { ...condition, enabled: !condition.enabled }
        : condition
    );

    const updatedSettings = {
      ...settings,
      conditions: updatedConditions
    };

    setSettings(updatedSettings);
  };

  const handleThresholdChange = (conditionId: string, threshold: number) => {
    if (!settings) return;

    const updatedConditions = settings.conditions.map(condition =>
      condition.id === conditionId
        ? { ...condition, threshold, userConfigured: true }
        : condition
    );

    const updatedSettings = {
      ...settings,
      conditions: updatedConditions
    };

    setSettings(updatedSettings);
  };

  const handleNotificationPreferenceChange = (key: string, value: boolean | string) => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      notificationPreferences: {
        ...settings.notificationPreferences,
        [key]: value
      }
    };

    setSettings(updatedSettings);
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      AlertService.saveAlertSettings(settings);
      onSettingsChange?.(settings);
      
      // Show success feedback (you could add a toast notification here)
      console.log('Alert settings saved successfully');
    } catch (error) {
      console.error('Failed to save alert settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getConditionDisplayName = (condition: AlertCondition): string => {
    const names: Record<string, string> = {
      'waste-rate-high': '高無駄率警告',
      'unused-services': '未使用サービス検出',
      'budget-exceeded': '予算超過アラート',
      'duplicate-category': '重複カテゴリ警告',
      'high-value-service': '高額サービス通知'
    };
    
    return names[condition.id] || condition.type;
  };

  const getThresholdUnit = (condition: AlertCondition): string => {
    switch (condition.type) {
      case 'waste_rate':
        return '%';
      case 'budget_exceeded':
      case 'high_value_service':
        return '円';
      case 'unused_service':
      case 'duplicate_category':
        return '個';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-gray-500">アラート設定の読み込みに失敗しました。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            アラート通知
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.enabled}
                onChange={handleToggleAlerts}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {settings.enabled 
              ? 'アラート通知が有効になっています。診断結果に基づいて最適化の提案を表示します。'
              : 'アラート通知が無効になっています。通知を有効にすると、サブスクリプションの最適化提案を受け取れます。'
            }
          </p>
        </CardContent>
      </Card>

      {/* Alert Conditions */}
      {settings.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>アラート条件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.conditions.map((condition) => (
              <div key={condition.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={condition.enabled}
                        onChange={() => handleConditionToggle(condition.id)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className="font-medium">{getConditionDisplayName(condition)}</span>
                  </div>
                  
                  {condition.enabled && (
                    <div className="mt-2 ml-12 flex items-center space-x-2">
                      <span className="text-sm text-gray-600">しきい値:</span>
                      <input
                        type="number"
                        min="0"
                        max={condition.type === 'waste_rate' ? 100 : undefined}
                        value={condition.threshold}
                        onChange={(e) => handleThresholdChange(condition.id, Number(e.target.value))}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">{getThresholdUnit(condition)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences */}
      {settings.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>通知設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">アプリ内通知</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notificationPreferences.showInApp}
                  onChange={(e) => handleNotificationPreferenceChange('showInApp', e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">ブラウザ通知</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notificationPreferences.showBrowser}
                  onChange={(e) => handleNotificationPreferenceChange('showBrowser', e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">通知頻度</span>
              <select
                value={settings.notificationPreferences.frequency}
                onChange={(e) => handleNotificationPreferenceChange('frequency', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="immediate">即座</option>
                <option value="daily">1日1回</option>
                <option value="weekly">週1回</option>
                <option value="monthly">月1回</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? '保存中...' : '設定を保存'}
        </Button>
      </div>
    </div>
  );
}

export default AlertSettings;