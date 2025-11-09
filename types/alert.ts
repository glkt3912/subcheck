// Alert and Notification type definitions for SubCheck

export type AlertType = 
  | 'waste_rate'           // High waste percentage detected
  | 'unused_service'       // Completely unused services found
  | 'budget_exceeded'      // Monthly/yearly budget limits exceeded
  | 'duplicate_category'   // Multiple services in same category
  | 'high_value_service'   // Expensive service added
  | 'usage_decline';       // Usage frequency decreased from previous

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertCondition {
  id: string;
  type: AlertType;
  enabled: boolean;
  threshold: number;       // Numeric threshold (percentage, amount, count, etc.)
  lastTriggered?: Date;
  userConfigured: boolean; // Whether user has customized this condition
}

export interface AlertAction {
  type: 'dismiss' | 'navigate' | 'external' | 'configure';
  label: string;
  url?: string;
  handler?: string;        // Function name for custom handlers
}

export interface AlertNotification {
  id: string;
  conditionId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  details?: string;        // Extended description for complex alerts
  actions: AlertAction[];
  suggestedSavings?: {     // Potential savings from acting on this alert
    monthly: number;
    yearly: number;
  };
  affectedServices?: string[]; // IDs of subscriptions related to this alert
  createdAt: Date;
  acknowledged: boolean;
  autoHide: boolean;       // Whether to auto-dismiss after timeout
  priority: number;        // Display order priority (higher = more important)
}

export interface AlertHistory {
  notificationId: string;
  acknowledgedAt: Date;
  actionTaken?: string;    // Which action was performed by user
}

export interface AlertSettings {
  enabled: boolean;
  conditions: AlertCondition[];
  notificationPreferences: {
    showInApp: boolean;
    showBrowser: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  };
  lastUpdated: Date;
}

// Default alert conditions
export const DEFAULT_ALERT_CONDITIONS: AlertCondition[] = [
  {
    id: 'waste-rate-high',
    type: 'waste_rate',
    enabled: true,
    threshold: 60,           // 60% waste rate
    userConfigured: false
  },
  {
    id: 'unused-services',
    type: 'unused_service',
    enabled: true,
    threshold: 1,            // 1 or more unused services
    userConfigured: false
  },
  {
    id: 'budget-exceeded',
    type: 'budget_exceeded',
    enabled: false,          // Disabled until user sets budget
    threshold: 10000,        // ¥10,000 default monthly budget
    userConfigured: false
  },
  {
    id: 'duplicate-category',
    type: 'duplicate_category',
    enabled: true,
    threshold: 2,            // 2 or more in same category
    userConfigured: false
  },
  {
    id: 'high-value-service',
    type: 'high_value_service',
    enabled: true,
    threshold: 2000,         // ¥2,000+ monthly cost
    userConfigured: false
  }
];

// Alert templates for consistent messaging
export interface AlertTemplate {
  type: AlertType;
  severity: AlertSeverity;
  titleTemplate: string;
  messageTemplate: string;
  suggestedActions: AlertAction[];
}

export const ALERT_TEMPLATES: Record<AlertType, AlertTemplate> = {
  waste_rate: {
    type: 'waste_rate',
    severity: 'warning',
    titleTemplate: '無駄率が{threshold}%を超えています',
    messageTemplate: '現在の無駄率は{wasteRate}%です。年間¥{yearlyWaste}の節約可能性があります。',
    suggestedActions: [
      { type: 'navigate', label: '詳細を確認', url: '/diagnosis/results' },
      { type: 'dismiss', label: '後で確認' }
    ]
  },
  unused_service: {
    type: 'unused_service',
    severity: 'critical',
    titleTemplate: '未使用サービスが{count}個あります',
    messageTemplate: '{services}が未使用状態です。解約を検討しませんか？',
    suggestedActions: [
      { type: 'navigate', label: '解約を検討', url: '/diagnosis/results' },
      { type: 'dismiss', label: 'そのまま継続' }
    ]
  },
  budget_exceeded: {
    type: 'budget_exceeded',
    severity: 'warning',
    titleTemplate: '予算を{percentage}%超過しています',
    messageTemplate: '月額予算¥{budget}に対し、現在¥{actual}の支出です。',
    suggestedActions: [
      { type: 'navigate', label: 'サービス見直し', url: '/diagnosis/select' },
      { type: 'configure', label: '予算を調整' }
    ]
  },
  duplicate_category: {
    type: 'duplicate_category',
    severity: 'info',
    titleTemplate: '{category}カテゴリで重複があります',
    messageTemplate: '同じカテゴリで{count}個のサービスを利用中です。統合できる可能性があります。',
    suggestedActions: [
      { type: 'navigate', label: '重複を確認', url: '/diagnosis/results' },
      { type: 'dismiss', label: '問題なし' }
    ]
  },
  high_value_service: {
    type: 'high_value_service',
    severity: 'info',
    titleTemplate: '高額サービスが追加されました',
    messageTemplate: '{service}（月額¥{amount}）が追加されました。本当に必要でしょうか？',
    suggestedActions: [
      { type: 'navigate', label: '使用頻度を設定', url: '/diagnosis/usage' },
      { type: 'dismiss', label: '継続利用' }
    ]
  },
  usage_decline: {
    type: 'usage_decline',
    severity: 'warning',
    titleTemplate: '使用頻度が低下しています',
    messageTemplate: '{service}の使用頻度が前回から低下しました。見直しが必要かもしれません。',
    suggestedActions: [
      { type: 'navigate', label: '使用状況を更新', url: '/diagnosis/usage' },
      { type: 'dismiss', label: '現状維持' }
    ]
  }
};