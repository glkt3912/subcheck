# Client-Side API Contracts: SubCheck

**Created**: 2025-10-29  
**Type**: Client-side function interfaces (no HTTP APIs)  
**Storage**: Browser LocalStorage only

## Overview

SubCheck is a client-side only application with no backend APIs. This document defines the internal function contracts for data operations, calculations, and storage management.

## Core Service Contracts

### SubscriptionService

Manages subscription data retrieval and custom subscription handling.

```typescript
interface SubscriptionService {
  /**
   * Get all available subscriptions (predefined + custom)
   * @returns Promise<Subscription[]> All available subscriptions
   */
  getAllSubscriptions(): Promise<Subscription[]>;
  
  /**
   * Get predefined popular subscriptions for quick selection
   * @returns Promise<Subscription[]> Popular subscription services
   */
  getPopularSubscriptions(): Promise<Subscription[]>;
  
  /**
   * Get subscriptions by category
   * @param category - Subscription category to filter by
   * @returns Promise<Subscription[]> Subscriptions in specified category
   */
  getSubscriptionsByCategory(category: SubscriptionCategory): Promise<Subscription[]>;
  
  /**
   * Add custom subscription service
   * @param subscription - Custom subscription to add
   * @returns Promise<Subscription> Added subscription with generated ID
   */
  addCustomSubscription(subscription: Omit<Subscription, 'id'>): Promise<Subscription>;
  
  /**
   * Remove custom subscription
   * @param subscriptionId - ID of custom subscription to remove
   * @returns Promise<boolean> Success status
   */
  removeCustomSubscription(subscriptionId: string): Promise<boolean>;
}
```

### DiagnosisService

Handles diagnosis session management and calculation logic.

```typescript
interface DiagnosisService {
  /**
   * Start new diagnosis session
   * @returns Promise<DiagnosisSession> New session object
   */
  startDiagnosis(): Promise<DiagnosisSession>;
  
  /**
   * Update current session with selected subscriptions
   * @param subscriptions - User selected subscriptions
   * @returns Promise<DiagnosisSession> Updated session
   */
  updateSelectedSubscriptions(subscriptions: UserSubscription[]): Promise<DiagnosisSession>;
  
  /**
   * Update usage frequencies for selected subscriptions
   * @param updates - Array of subscription ID and usage frequency pairs
   * @returns Promise<DiagnosisSession> Updated session
   */
  updateUsageFrequencies(updates: {subscriptionId: string, frequency: UsageFrequency}[]): Promise<DiagnosisSession>;
  
  /**
   * Calculate diagnosis results
   * @param session - Current diagnosis session
   * @returns Promise<DiagnosisResult> Calculated results
   */
  calculateResults(session: DiagnosisSession): Promise<DiagnosisResult>;
  
  /**
   * Complete diagnosis and save results
   * @param result - Final diagnosis result
   * @returns Promise<void>
   */
  completeDiagnosis(result: DiagnosisResult): Promise<void>;
  
  /**
   * Get current session state
   * @returns Promise<DiagnosisSession | null> Current session or null
   */
  getCurrentSession(): Promise<DiagnosisSession | null>;
  
  /**
   * Clear current session
   * @returns Promise<void>
   */
  clearSession(): Promise<void>;
}
```

### CalculationService

Performs waste calculations and equivalency computations.

```typescript
interface CalculationService {
  /**
   * Calculate waste rate for individual subscription
   * @param usageFrequency - How often service is used
   * @returns number Waste percentage (0-100)
   */
  calculateWasteRate(usageFrequency: UsageFrequency): number;
  
  /**
   * Calculate total waste breakdown
   * @param userSubscriptions - User's selected subscriptions with usage
   * @returns WasteBreakdown[] Per-service waste analysis
   */
  calculateWasteBreakdown(userSubscriptions: UserSubscription[]): WasteBreakdown[];
  
  /**
   * Calculate equivalent items for waste amount
   * @param wasteAmount - Yearly waste amount in JPY
   * @returns string[] Array of equivalent purchases
   */
  calculateEquivalentItems(wasteAmount: number): string[];
  
  /**
   * Calculate total monthly and yearly costs
   * @param userSubscriptions - User's selected subscriptions
   * @returns {monthly: number, yearly: number} Total costs
   */
  calculateTotalCosts(userSubscriptions: UserSubscription[]): {
    monthly: number;
    yearly: number;
  };
}
```

### StorageService

Manages localStorage operations with error handling.

```typescript
interface StorageService {
  /**
   * Save diagnosis session to localStorage
   * @param session - Session to save
   * @returns Promise<void>
   */
  saveSession(session: DiagnosisSession): Promise<void>;
  
  /**
   * Load diagnosis session from localStorage
   * @returns Promise<DiagnosisSession | null> Saved session or null
   */
  loadSession(): Promise<DiagnosisSession | null>;
  
  /**
   * Save diagnosis result to history
   * @param result - Result to save
   * @returns Promise<void>
   */
  saveResult(result: DiagnosisResult): Promise<void>;
  
  /**
   * Load diagnosis results history
   * @returns Promise<DiagnosisResult[]> Array of past results
   */
  loadResultsHistory(): Promise<DiagnosisResult[]>;
  
  /**
   * Save custom subscriptions
   * @param subscriptions - Custom subscriptions to save
   * @returns Promise<void>
   */
  saveCustomSubscriptions(subscriptions: Subscription[]): Promise<void>;
  
  /**
   * Load custom subscriptions
   * @returns Promise<Subscription[]> User's custom subscriptions
   */
  loadCustomSubscriptions(): Promise<Subscription[]>;
  
  /**
   * Clear all stored data
   * @returns Promise<void>
   */
  clearAll(): Promise<void>;
  
  /**
   * Check localStorage availability and quota
   * @returns Promise<{available: boolean, quota: number}> Storage status
   */
  checkStorageStatus(): Promise<{available: boolean, quota: number}>;
}
```

### SharingService

Handles social media sharing functionality.

```typescript
interface SharingService {
  /**
   * Generate Twitter share URL
   * @param result - Diagnosis result to share
   * @returns string Twitter share URL
   */
  generateTwitterShareUrl(result: DiagnosisResult): string;
  
  /**
   * Generate LINE share URL
   * @param result - Diagnosis result to share
   * @returns string LINE share URL
   */
  generateLineShareUrl(result: DiagnosisResult): string;
  
  /**
   * Generate shareable text summary
   * @param result - Diagnosis result to summarize
   * @returns string Formatted text for sharing
   */
  generateShareText(result: DiagnosisResult): string;
  
  /**
   * Open native share dialog (if supported)
   * @param result - Diagnosis result to share
   * @returns Promise<boolean> Success status
   */
  openNativeShare(result: DiagnosisResult): Promise<boolean>;
}
```

## Error Handling Contracts

### ServiceError

Standard error type for all service operations.

```typescript
class ServiceError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: any
  ) {
    super(message);
  }
}

enum ErrorCode {
  STORAGE_UNAVAILABLE = 'STORAGE_UNAVAILABLE',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  INVALID_DATA = 'INVALID_DATA',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND'
}
```

## Validation Contracts

### DataValidator

Input validation for all service operations.

```typescript
interface DataValidator {
  /**
   * Validate subscription data
   * @param subscription - Subscription to validate
   * @returns ValidationResult Validation status and errors
   */
  validateSubscription(subscription: Subscription): ValidationResult;
  
  /**
   * Validate user subscription selection
   * @param userSubscription - User subscription to validate
   * @returns ValidationResult Validation status and errors
   */
  validateUserSubscription(userSubscription: UserSubscription): ValidationResult;
  
  /**
   * Validate diagnosis session state
   * @param session - Session to validate
   * @returns ValidationResult Validation status and errors
   */
  validateSession(session: DiagnosisSession): ValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}
```

## Testing Contracts

### Service Testing Requirements

Each service must include:

```typescript
describe('ServiceName', () => {
  // Unit tests for each method
  // Error handling tests
  // Edge case tests
  // Integration tests with localStorage
  // Performance tests for calculation logic
});
```

### Test Data Contracts

```typescript
interface TestDataFactory {
  createMockSubscription(overrides?: Partial<Subscription>): Subscription;
  createMockUserSubscription(overrides?: Partial<UserSubscription>): UserSubscription;
  createMockDiagnosisSession(overrides?: Partial<DiagnosisSession>): DiagnosisSession;
  createMockDiagnosisResult(overrides?: Partial<DiagnosisResult>): DiagnosisResult;
}
```

## Implementation Notes

### Service Initialization
All services should be initialized with dependency injection for testing:

```typescript
// Example service factory
export const createServices = (storage: Storage = localStorage) => ({
  subscription: new SubscriptionService(storage),
  diagnosis: new DiagnosisService(storage),
  calculation: new CalculationService(),
  storage: new StorageService(storage),
  sharing: new SharingService()
});
```

### Async Operations
All service methods return Promises to maintain consistency and allow for future enhancements (e.g., adding analytics tracking).

### Type Safety
All contracts use strict TypeScript types with no `any` types allowed in production code.