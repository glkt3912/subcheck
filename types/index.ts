// SubCheck Type Definitions

export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'unused';

export type SubscriptionCategory = 'video' | 'music' | 'digital';

export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  price: number;                    // Representative price
  priceRange: {
    min: number;
    max: number;
  };
  logo: string;
  description: string;
  marketShare?: string;
  popularityRank: number;
  lastPriceUpdate?: string;
}

export interface UserSubscription {
  subscriptionId: string;
  frequency: FrequencyType;
  selectedAt: Date;
  customPrice?: number;            // For custom subscriptions
  customName?: string;             // For custom subscriptions
}

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

export interface DiagnosisResult {
  subscriptions: UserSubscription[];
  totals: {
    monthly: number;
    yearly: number;
    unusedYearly: number;
  };
  wasteRate: number;              // 0-100%
  frequencyBreakdown: FrequencyBreakdown;
  comparisonItems: ComparisonItem[];
  recommendations: RecommendationItem[];
  createdAt: Date;
  shareId?: string;
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