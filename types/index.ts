// SubCheck Type Definitions - Central export point

// Export all subscription-related types first (dependencies)
export * from './subscription';

// Export all diagnosis-related types (depends on subscription types)
export * from './diagnosis';

// Export all alert-related types
export * from './alert';

// Explicit imports for internal use
import type { UserSubscription } from './subscription';
import type { DiagnosisResult } from './diagnosis';

// Legacy compatibility types (maintain existing interface)
export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'unused';

export interface FrequencyBreakdown {
  daily: number;
  weekly: number;
  monthly: number;
  unused: number;
}

// Moved to diagnosis.ts to avoid circular dependency
// Re-export here for convenience
export type { ComparisonItem, RecommendationItem } from './diagnosis';

export interface DiagnosisState {
  currentStep: number;
  selectedSubscriptions: string[];
  userSubscriptions: UserSubscription[];
  result?: DiagnosisResult;
}