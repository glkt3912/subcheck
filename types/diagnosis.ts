// Diagnosis-related type definitions

import { UserSubscription } from './subscription';

export interface WasteBreakdown {
  subscriptionId: string;        // Reference to subscription
  monthlyPrice: number;          // Monthly cost
  usageFrequency: UsageFrequency; // Usage level
  wastePercentage: number;       // Waste % for this service (0-100)
  wasteAmount: number;           // Yearly waste for this service
}

export interface DiagnosisResult {
  id: string;                    // Unique result ID
  userSubscriptions: UserSubscription[]; // Subscriptions analyzed
  totalMonthlySpend: number;     // Total monthly spending in JPY
  totalYearlySpend: number;      // Total yearly spending in JPY
  wasteRate: number;             // Waste percentage (0-100)
  yearlyWaste: number;           // Yearly waste amount in JPY
  breakdown: WasteBreakdown[];   // Per-service breakdown
  equivalentItems: string[];     // What waste amount could buy instead
  createdAt: string;             // ISO date string of calculation
  completionTime: number;        // Time taken to complete diagnosis (seconds)
}

export enum DiagnosisStep {
  LANDING = "landing",           // Initial landing page
  SELECTION = "selection",       // Subscription selection
  USAGE = "usage",               // Usage frequency input
  RESULTS = "results"            // Results display
}

export interface DiagnosisSession {
  currentStep: DiagnosisStep;    // Current step in the flow
  selectedSubscriptions: UserSubscription[]; // Currently selected services
  startTime: string;             // ISO date string when diagnosis started
  lastUpdated: string;           // ISO date string of last interaction
  isComplete: boolean;           // Whether diagnosis is finished
}

// Re-export UsageFrequency from subscription types for convenience
export { UsageFrequency } from './subscription';