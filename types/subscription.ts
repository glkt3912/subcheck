// Subscription-related type definitions

export enum SubscriptionCategory {
  VIDEO = "video",               // Netflix, Amazon Prime Video, etc.
  MUSIC = "music",               // Spotify, Apple Music, etc.
  GAMING = "gaming",             // PlayStation Plus, Xbox Game Pass
  READING = "reading",           // Kindle Unlimited, magazine subscriptions
  UTILITY = "utility",           // Cloud storage, productivity apps
  OTHER = "other"                // Custom user-added services
}

export interface Subscription {
  id: string;                    // Unique identifier (e.g., "netflix", "spotify")
  name: string;                  // Display name (e.g., "Netflix", "Spotify Premium")
  category: SubscriptionCategory; // Service category
  monthlyPrice: number;          // Monthly price in JPY
  logoUrl?: string;              // Logo image URL or path
  isPopular: boolean;            // Featured in popular services
}

export enum UsageFrequency {
  DAILY = "daily",               // 毎日 - Used daily
  WEEKLY = "weekly",             // 週1-2回 - Used 1-2 times per week
  MONTHLY = "monthly",           // 月1-2回 - Used 1-2 times per month
  UNUSED = "unused"              // 未使用 - Not used at all
}

export interface UserSubscription {
  subscriptionId: string;        // Reference to Subscription.id
  usageFrequency: UsageFrequency; // How often user uses the service
  customPrice?: number;          // Override price for custom subscriptions
  customName?: string;           // Custom name for user-added services
  isCustom: boolean;             // True if user-added, false if from master list
  dateAdded: string;             // ISO date string when added to selection
}