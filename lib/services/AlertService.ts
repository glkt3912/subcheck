// SubCheck Alert Service
// Analyzes diagnosis results and generates appropriate alerts for users

import { 
  AlertNotification, 
  AlertCondition, 
  AlertSettings,
  DEFAULT_ALERT_CONDITIONS,
  ALERT_TEMPLATES
} from '@/types/alert';
import { DiagnosisResult, UserSubscription } from '@/types';
import { SUBSCRIPTION_DATA } from '@/lib/data/subscriptions';

/**
 * Alert Service for analyzing subscription usage and generating notifications
 */
export class AlertService {
  private static readonly STORAGE_KEY_SETTINGS = 'alertSettings';
  private static readonly STORAGE_KEY_HISTORY = 'alertHistory';

  /**
   * Analyze diagnosis result and generate appropriate alerts
   */
  static generateAlerts(diagnosisResult: DiagnosisResult, previousResult?: DiagnosisResult): AlertNotification[] {
    const settings = this.getAlertSettings();
    if (!settings.enabled) return [];

    const alerts: AlertNotification[] = [];
    
    for (const condition of settings.conditions) {
      if (!condition.enabled) continue;

      const alert = this.checkCondition(condition, diagnosisResult, previousResult);
      if (alert) {
        alerts.push(alert);
      }
    }

    // Sort alerts by priority (higher = more important)
    return alerts.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check a specific alert condition against diagnosis result
   */
  private static checkCondition(
    condition: AlertCondition, 
    result: DiagnosisResult, 
    previousResult?: DiagnosisResult
  ): AlertNotification | null {
    switch (condition.type) {
      case 'waste_rate':
        return this.checkWasteRate(condition, result);
      
      case 'unused_service':
        return this.checkUnusedServices(condition, result);
      
      case 'budget_exceeded':
        return this.checkBudgetExceeded(condition, result);
      
      case 'duplicate_category':
        return this.checkDuplicateCategories(condition, result);
      
      case 'high_value_service':
        return this.checkHighValueServices(condition, result);
      
      case 'usage_decline':
        return this.checkUsageDecline(condition, result, previousResult);
      
      default:
        return null;
    }
  }

  /**
   * Check for high waste rate
   */
  private static checkWasteRate(condition: AlertCondition, result: DiagnosisResult): AlertNotification | null {
    if (result.wasteRate < condition.threshold) return null;

    const template = ALERT_TEMPLATES.waste_rate;
    
    return {
      id: `waste-rate-${Date.now()}`,
      conditionId: condition.id,
      type: 'waste_rate',
      severity: result.wasteRate > 80 ? 'critical' : 'warning',
      title: template.titleTemplate.replace('{threshold}', condition.threshold.toString()),
      message: template.messageTemplate
        .replace('{wasteRate}', result.wasteRate.toString())
        .replace('{yearlyWaste}', result.totals.unusedYearly.toLocaleString()),
      actions: template.suggestedActions,
      suggestedSavings: {
        monthly: Math.round(result.totals.unusedYearly / 12),
        yearly: result.totals.unusedYearly
      },
      createdAt: new Date(),
      acknowledged: false,
      autoHide: false,
      priority: result.wasteRate > 80 ? 10 : 7
    };
  }

  /**
   * Check for unused services
   */
  private static checkUnusedServices(condition: AlertCondition, result: DiagnosisResult): AlertNotification | null {
    const unusedServices = result.subscriptions.filter(sub => sub.usageFrequency === 'unused');
    
    if (unusedServices.length < condition.threshold) return null;

    const template = ALERT_TEMPLATES.unused_service;
    const serviceNames = unusedServices
      .map(sub => {
        const subData = SUBSCRIPTION_DATA.find(s => s.id === sub.subscriptionId);
        return subData?.name || sub.subscriptionId;
      })
      .join('、');

    const potentialSavings = unusedServices.reduce((total, sub) => {
      const subData = SUBSCRIPTION_DATA.find(s => s.id === sub.subscriptionId);
      return total + (subData?.monthlyPrice || sub.customPrice || 0);
    }, 0);

    return {
      id: `unused-services-${Date.now()}`,
      conditionId: condition.id,
      type: 'unused_service',
      severity: 'critical',
      title: template.titleTemplate.replace('{count}', unusedServices.length.toString()),
      message: template.messageTemplate
        .replace('{services}', serviceNames),
      actions: template.suggestedActions,
      suggestedSavings: {
        monthly: potentialSavings,
        yearly: potentialSavings * 12
      },
      affectedServices: unusedServices.map(sub => sub.subscriptionId),
      createdAt: new Date(),
      acknowledged: false,
      autoHide: false,
      priority: 9
    };
  }

  /**
   * Check for budget exceeded
   */
  private static checkBudgetExceeded(condition: AlertCondition, result: DiagnosisResult): AlertNotification | null {
    if (result.totals.monthly <= condition.threshold) return null;

    const template = ALERT_TEMPLATES.budget_exceeded;
    const percentage = Math.round((result.totals.monthly / condition.threshold) * 100);

    return {
      id: `budget-exceeded-${Date.now()}`,
      conditionId: condition.id,
      type: 'budget_exceeded',
      severity: percentage > 150 ? 'critical' : 'warning',
      title: template.titleTemplate.replace('{percentage}', (percentage - 100).toString()),
      message: template.messageTemplate
        .replace('{budget}', condition.threshold.toLocaleString())
        .replace('{actual}', result.totals.monthly.toLocaleString()),
      actions: template.suggestedActions,
      suggestedSavings: {
        monthly: result.totals.monthly - condition.threshold,
        yearly: (result.totals.monthly - condition.threshold) * 12
      },
      createdAt: new Date(),
      acknowledged: false,
      autoHide: false,
      priority: percentage > 150 ? 8 : 6
    };
  }

  /**
   * Check for duplicate categories
   */
  private static checkDuplicateCategories(condition: AlertCondition, result: DiagnosisResult): AlertNotification | null {
    const categoryGroups = new Map<string, UserSubscription[]>();
    
    // Group subscriptions by category
    result.subscriptions.forEach(sub => {
      const subData = SUBSCRIPTION_DATA.find(s => s.id === sub.subscriptionId);
      if (subData) {
        const category = subData.category;
        if (!categoryGroups.has(category)) {
          categoryGroups.set(category, []);
        }
        categoryGroups.get(category)!.push(sub);
      }
    });

    // Find categories with duplicates
    const duplicateCategories = Array.from(categoryGroups.entries())
      .filter(([, subs]) => subs.length >= condition.threshold);

    if (duplicateCategories.length === 0) return null;

    // Focus on the category with the most duplicates
    const [category, services] = duplicateCategories
      .sort((a, b) => b[1].length - a[1].length)[0];

    const template = ALERT_TEMPLATES.duplicate_category;

    return {
      id: `duplicate-category-${Date.now()}`,
      conditionId: condition.id,
      type: 'duplicate_category',
      severity: 'info',
      title: template.titleTemplate.replace('{category}', this.getCategoryDisplayName(category)),
      message: template.messageTemplate
        .replace('{category}', this.getCategoryDisplayName(category))
        .replace('{count}', services.length.toString()),
      actions: template.suggestedActions,
      affectedServices: services.map(sub => sub.subscriptionId),
      createdAt: new Date(),
      acknowledged: false,
      autoHide: true,
      priority: 3
    };
  }

  /**
   * Check for high value services
   */
  private static checkHighValueServices(condition: AlertCondition, result: DiagnosisResult): AlertNotification | null {
    const highValueServices = result.subscriptions.filter(sub => {
      const subData = SUBSCRIPTION_DATA.find(s => s.id === sub.subscriptionId);
      const monthlyPrice = subData?.monthlyPrice || sub.customPrice || 0;
      return monthlyPrice >= condition.threshold;
    });

    if (highValueServices.length === 0) return null;

    // Focus on the most expensive service
    const mostExpensive = highValueServices
      .sort((a, b) => {
        const priceA = SUBSCRIPTION_DATA.find(s => s.id === a.subscriptionId)?.monthlyPrice || a.customPrice || 0;
        const priceB = SUBSCRIPTION_DATA.find(s => s.id === b.subscriptionId)?.monthlyPrice || b.customPrice || 0;
        return priceB - priceA;
      })[0];

    const subData = SUBSCRIPTION_DATA.find(s => s.id === mostExpensive.subscriptionId);
    const serviceName = subData?.name || mostExpensive.customName || mostExpensive.subscriptionId;
    const monthlyPrice = subData?.monthlyPrice || mostExpensive.customPrice || 0;

    const template = ALERT_TEMPLATES.high_value_service;

    return {
      id: `high-value-${Date.now()}`,
      conditionId: condition.id,
      type: 'high_value_service',
      severity: 'info',
      title: template.titleTemplate,
      message: template.messageTemplate
        .replace('{service}', serviceName)
        .replace('{amount}', monthlyPrice.toLocaleString()),
      actions: template.suggestedActions,
      affectedServices: [mostExpensive.subscriptionId],
      createdAt: new Date(),
      acknowledged: false,
      autoHide: true,
      priority: 4
    };
  }

  /**
   * Check for usage decline (requires previous result)
   */
  private static checkUsageDecline(
    condition: AlertCondition, 
    result: DiagnosisResult, 
    previousResult?: DiagnosisResult
  ): AlertNotification | null {
    if (!previousResult) return null;

    // Compare usage frequencies between current and previous results
    const declinedServices: { service: UserSubscription; previousFreq: string; currentFreq: string }[] = [];

    result.subscriptions.forEach(currentSub => {
      const previousSub = previousResult.subscriptions.find(
        prev => prev.subscriptionId === currentSub.subscriptionId
      );

      if (previousSub && this.isFrequencyDecline(previousSub.usageFrequency, currentSub.usageFrequency)) {
        declinedServices.push({
          service: currentSub,
          previousFreq: previousSub.usageFrequency,
          currentFreq: currentSub.usageFrequency
        });
      }
    });

    if (declinedServices.length === 0) return null;

    // Focus on the first declined service
    const { service } = declinedServices[0];
    const subData = SUBSCRIPTION_DATA.find(s => s.id === service.subscriptionId);
    const serviceName = subData?.name || service.subscriptionId;

    const template = ALERT_TEMPLATES.usage_decline;

    return {
      id: `usage-decline-${Date.now()}`,
      conditionId: condition.id,
      type: 'usage_decline',
      severity: 'warning',
      title: template.titleTemplate,
      message: template.messageTemplate.replace('{service}', serviceName),
      actions: template.suggestedActions,
      affectedServices: [service.subscriptionId],
      createdAt: new Date(),
      acknowledged: false,
      autoHide: false,
      priority: 5
    };
  }

  /**
   * Get alert settings from localStorage
   */
  static getAlertSettings(): AlertSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_SETTINGS);
      if (stored) {
        const settings = JSON.parse(stored);
        // Ensure all default conditions are present
        const mergedConditions = this.mergeWithDefaultConditions(settings.conditions || []);
        return {
          ...settings,
          conditions: mergedConditions
        };
      }
    } catch (error) {
      console.warn('Failed to load alert settings:', error);
    }

    // Return default settings
    return {
      enabled: true,
      conditions: [...DEFAULT_ALERT_CONDITIONS],
      notificationPreferences: {
        showInApp: true,
        showBrowser: false,
        frequency: 'immediate'
      },
      lastUpdated: new Date()
    };
  }

  /**
   * Save alert settings to localStorage
   */
  static saveAlertSettings(settings: AlertSettings): void {
    try {
      settings.lastUpdated = new Date();
      localStorage.setItem(this.STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save alert settings:', error);
    }
  }

  /**
   * Acknowledge an alert (mark as read)
   */
  static acknowledgeAlert(alertId: string, actionTaken?: string): void {
    // This could be expanded to save acknowledgment history if needed
    console.log(`Alert ${alertId} acknowledged with action: ${actionTaken}`);
  }

  /**
   * Merge user conditions with default conditions
   */
  private static mergeWithDefaultConditions(userConditions: AlertCondition[]): AlertCondition[] {
    const merged = [...DEFAULT_ALERT_CONDITIONS];
    
    userConditions.forEach(userCondition => {
      const index = merged.findIndex(def => def.id === userCondition.id);
      if (index >= 0) {
        merged[index] = userCondition;
      } else {
        merged.push(userCondition);
      }
    });

    return merged;
  }

  /**
   * Check if usage frequency represents a decline
   */
  private static isFrequencyDecline(previous: string, current: string): boolean {
    const frequencies = ['daily', 'weekly', 'monthly', 'unused'];
    const previousIndex = frequencies.indexOf(previous);
    const currentIndex = frequencies.indexOf(current);
    
    return currentIndex > previousIndex; // Higher index = less frequent usage
  }

  /**
   * Get display name for subscription category
   */
  private static getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      'VIDEO': '動画配信',
      'MUSIC': '音楽配信',
      'GAMING': 'ゲーム',
      'READING': '電子書籍',
      'UTILITY': 'ユーティリティ',
      'AI': 'AI・生成ツール'
    };
    
    return categoryNames[category] || category;
  }
}