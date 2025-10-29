# Data Model: SubCheck Subscription Diagnostic Service

**Created**: 2025-10-29  
**Feature**: SubCheck MVP  
**Storage**: Browser LocalStorage (client-side only)

## Core Entities

### Subscription
Represents a subscription service available for selection.

```typescript
interface Subscription {
  id: string;                    // Unique identifier (e.g., "netflix", "spotify")
  name: string;                  // Display name (e.g., "Netflix", "Spotify Premium")
  category: SubscriptionCategory; // Service category
  monthlyPrice: number;          // Monthly price in JPY
  logoUrl?: string;              // Logo image URL or path
  isPopular: boolean;            // Featured in popular services
}

enum SubscriptionCategory {
  VIDEO = "video",               // Netflix, Amazon Prime Video, etc.
  MUSIC = "music",               // Spotify, Apple Music, etc.
  GAMING = "gaming",             // PlayStation Plus, Xbox Game Pass
  READING = "reading",           // Kindle Unlimited, magazine subscriptions
  UTILITY = "utility",           // Cloud storage, productivity apps
  OTHER = "other"                // Custom user-added services
}
```

### UserSubscription
Represents a user's selected subscription with usage frequency.

```typescript
interface UserSubscription {
  subscriptionId: string;        // Reference to Subscription.id
  usageFrequency: UsageFrequency; // How often user uses the service
  customPrice?: number;          // Override price for custom subscriptions
  customName?: string;           // Custom name for user-added services
  isCustom: boolean;             // True if user-added, false if from master list
  dateAdded: string;             // ISO date string when added to selection
}

enum UsageFrequency {
  DAILY = "daily",               // 毎日 - Used daily
  WEEKLY = "weekly",             // 週1-2回 - Used 1-2 times per week
  MONTHLY = "monthly",           // 月1-2回 - Used 1-2 times per month
  UNUSED = "unused"              // 未使用 - Not used at all
}
```

### DiagnosisResult
Represents the calculated results of the subscription analysis.

```typescript
interface DiagnosisResult {
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

interface WasteBreakdown {
  subscriptionId: string;        // Reference to subscription
  monthlyPrice: number;          // Monthly cost
  usageFrequency: UsageFrequency; // Usage level
  wastePercentage: number;       // Waste % for this service (0-100)
  wasteAmount: number;           // Yearly waste for this service
}
```

### DiagnosisSession
Represents the current user session state during diagnosis flow.

```typescript
interface DiagnosisSession {
  currentStep: DiagnosisStep;    // Current step in the flow
  selectedSubscriptions: UserSubscription[]; // Currently selected services
  startTime: string;             // ISO date string when diagnosis started
  lastUpdated: string;           // ISO date string of last interaction
  isComplete: boolean;           // Whether diagnosis is finished
}

enum DiagnosisStep {
  LANDING = "landing",           // Initial landing page
  SELECTION = "selection",       // Subscription selection
  USAGE = "usage",               // Usage frequency input
  RESULTS = "results"            // Results display
}
```

## Data Relationships

```
Subscription (1) ← references ← (N) UserSubscription
UserSubscription (N) → includes → (1) DiagnosisResult
DiagnosisSession (1) → contains → (N) UserSubscription
```

## Validation Rules

### Subscription
- `id`: Required, unique, lowercase with hyphens only
- `name`: Required, 1-50 characters
- `monthlyPrice`: Required, positive number, max 50000 JPY
- `category`: Required, must be valid enum value

### UserSubscription  
- `subscriptionId`: Required, must reference valid Subscription
- `usageFrequency`: Required, must be valid enum value
- `customPrice`: If provided, must be positive, max 50000 JPY
- `customName`: Required if `isCustom` is true, 1-50 characters

### DiagnosisResult
- `totalMonthlySpend`: Must equal sum of selected subscription prices
- `wasteRate`: Must be 0-100
- `yearlyWaste`: Must be >= 0
- `breakdown`: Must include entry for each UserSubscription

## State Transitions

### DiagnosisSession Flow
```
LANDING → SELECTION → USAGE → RESULTS
    ↑                           ↓
    ← ← ← ← (Back/Reset) ← ← ← ←
```

### Usage Frequency Mapping to Waste Percentage
```typescript
const WASTE_MULTIPLIERS = {
  DAILY: 0,      // 0% waste - getting full value
  WEEKLY: 25,    // 25% waste - moderate usage
  MONTHLY: 60,   // 60% waste - low usage  
  UNUSED: 100    // 100% waste - no usage
} as const;
```

## LocalStorage Schema

### Storage Keys
- `subcheck_session`: Current DiagnosisSession
- `subcheck_results_history`: Array of past DiagnosisResult[]
- `subcheck_custom_subscriptions`: Array of user-added Subscription[]

### Storage Format
```typescript
// All data stored as JSON strings
localStorage.setItem('subcheck_session', JSON.stringify(diagnosisSession));
localStorage.setItem('subcheck_results_history', JSON.stringify(results));
localStorage.setItem('subcheck_custom_subscriptions', JSON.stringify(customSubs));
```

### Data Persistence Strategy
- **Session Data**: Cleared after successful completion or 24 hours
- **Results History**: Keep last 10 results for user reference
- **Custom Subscriptions**: Persist indefinitely until user removes
- **Error Handling**: Graceful fallback if localStorage unavailable or quota exceeded