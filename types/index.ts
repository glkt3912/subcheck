// SubCheck Type Definitions - Central export point

// Export all subscription-related types
export * from './subscription';

// Export all diagnosis-related types  
export * from './diagnosis';

// Legacy compatibility types (maintain existing interface)
export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'unused';

export interface FrequencyBreakdown {
  daily: number;
  weekly: number;
  monthly: number;
  unused: number;
}

export interface ComparisonItem {
  amount: number;
  description: string;
  icon: string;
  category: 'travel' | 'gadget' | 'food' | 'hobby';
}

export interface RecommendationItem {
  subscriptionId: string;
  action: 'cancel' | 'downgrade' | 'review';
  reason: string;
  potentialSaving: {
    monthly: number;
    yearly: number;
  };
  priority: 'high' | 'medium' | 'low';
}

export interface DiagnosisState {
  currentStep: number;
  selectedSubscriptions: string[];
  userSubscriptions: UserSubscription[];
  result?: DiagnosisResult;
}