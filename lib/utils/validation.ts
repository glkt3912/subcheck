import { JapaneseTextUtils, JapaneseNumberUtils, JAPANESE_VALIDATION_MESSAGES } from '@/lib/utils/japaneseUtils';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface CustomSubscriptionInput {
  name: string;
  monthlyPrice: number;
  category?: string;
}

export class ValidationUtils {
  // Price validation constants
  static readonly MIN_PRICE = 1;
  static readonly MAX_PRICE = 100000;
  
  // Name validation constants
  static readonly MIN_NAME_LENGTH = 1;
  static readonly MAX_NAME_LENGTH = 50;
  
  // Category validation
  static readonly VALID_CATEGORIES = ['video', 'music', 'gaming', 'reading', 'utility', 'other'];

  /**
   * Validate subscription service name using Japanese text utilities
   */
  static validateServiceName(name: string): ValidationResult {
    if (!name || typeof name !== 'string') {
      return {
        isValid: false,
        error: JAPANESE_VALIDATION_MESSAGES.REQUIRED
      };
    }

    // Use Japanese text validation
    const japaneseValidation = JapaneseTextUtils.validateServiceName(name);
    if (!japaneseValidation.isValid) {
      return {
        isValid: false,
        error: japaneseValidation.error
      };
    }

    return { isValid: true };
  }

  /**
   * Validate monthly price using Japanese number utilities
   */
  static validateMonthlyPrice(price: number | string): ValidationResult {
    // Handle Japanese number input
    if (typeof price === 'string') {
      const japaneseValidation = JapaneseNumberUtils.validatePriceInput(price);
      return {
        isValid: japaneseValidation.isValid,
        error: japaneseValidation.error
      };
    } else {
      const numPrice = price;
      
      if (isNaN(numPrice)) {
        return {
          isValid: false,
          error: JAPANESE_VALIDATION_MESSAGES.PRICE_INVALID
        };
      }

      if (numPrice < this.MIN_PRICE) {
        return {
          isValid: false,
          error: JAPANESE_VALIDATION_MESSAGES.PRICE_TOO_LOW
        };
      }

      if (numPrice > this.MAX_PRICE) {
        return {
          isValid: false,
          error: JAPANESE_VALIDATION_MESSAGES.PRICE_TOO_HIGH
        };
      }

      return { isValid: true };
    }
  }

  /**
   * Validate subscription category
   */
  static validateCategory(category: string): ValidationResult {
    if (!category || typeof category !== 'string') {
      return {
        isValid: false,
        error: 'カテゴリを選択してください'
      };
    }

    if (!this.VALID_CATEGORIES.includes(category)) {
      return {
        isValid: false,
        error: '有効なカテゴリを選択してください'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate complete custom subscription input
   */
  static validateCustomSubscription(input: CustomSubscriptionInput): ValidationResult {
    // Validate name
    const nameValidation = this.validateServiceName(input.name);
    if (!nameValidation.isValid) {
      return nameValidation;
    }

    // Validate price
    const priceValidation = this.validateMonthlyPrice(input.monthlyPrice);
    if (!priceValidation.isValid) {
      return priceValidation;
    }

    // Validate category if provided
    if (input.category) {
      const categoryValidation = this.validateCategory(input.category);
      if (!categoryValidation.isValid) {
        return categoryValidation;
      }
    }

    return { isValid: true };
  }

  /**
   * Sanitize service name using Japanese text utilities
   */
  static sanitizeServiceName(name: string): string {
    if (!name || typeof name !== 'string') {
      return '';
    }

    // Use Japanese text normalization
    const normalized = JapaneseTextUtils.normalize(name);
    return normalized.substring(0, this.MAX_NAME_LENGTH);
  }

  /**
   * Format and validate price input using Japanese number utilities
   */
  static formatPrice(price: number | string): number {
    if (typeof price === 'string') {
      // Parse Japanese number input
      const parsed = JapaneseNumberUtils.parseJapaneseNumber(price);
      return Math.max(this.MIN_PRICE, Math.min(this.MAX_PRICE, parsed));
    }
    
    const numPrice = price;
    if (isNaN(numPrice)) {
      return 0;
    }

    // Round to 2 decimal places and ensure within bounds
    const rounded = Math.round(numPrice * 100) / 100;
    return Math.max(this.MIN_PRICE, Math.min(this.MAX_PRICE, rounded));
  }

  /**
   * Check if service name already exists in given list
   */
  static checkDuplicateName(name: string, existingServices: { name: string }[]): ValidationResult {
    const trimmedName = name.trim().toLowerCase();
    
    const duplicate = existingServices.find(service => 
      service.name.trim().toLowerCase() === trimmedName
    );

    if (duplicate) {
      return {
        isValid: false,
        error: 'このサービス名は既に存在します'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate multiple custom subscriptions for batch operations
   */
  static validateCustomSubscriptions(inputs: CustomSubscriptionInput[]): { 
    isValid: boolean; 
    errors: string[]; 
    validItems: CustomSubscriptionInput[] 
  } {
    const errors: string[] = [];
    const validItems: CustomSubscriptionInput[] = [];
    const seenNames = new Set<string>();

    inputs.forEach((input, index) => {
      // Validate individual item
      const validation = this.validateCustomSubscription(input);
      if (!validation.isValid) {
        errors.push(`項目${index + 1}: ${validation.error}`);
        return;
      }

      // Check for duplicates within the batch
      const normalizedName = input.name.trim().toLowerCase();
      if (seenNames.has(normalizedName)) {
        errors.push(`項目${index + 1}: 重複するサービス名です`);
        return;
      }

      seenNames.add(normalizedName);
      validItems.push(input);
    });

    return {
      isValid: errors.length === 0,
      errors,
      validItems
    };
  }

  /**
   * Generate suggested category using Japanese text utilities
   */
  static suggestCategory(serviceName: string): string {
    return JapaneseTextUtils.suggestCategory(serviceName);
  }

  /**
   * Format price for display using Japanese formatting
   */
  static formatPriceDisplay(price: number): string {
    return JapaneseNumberUtils.formatPrice(price);
  }

  /**
   * Format large numbers with Japanese units
   */
  static formatLargeNumber(num: number): string {
    return JapaneseNumberUtils.formatLargeNumber(num);
  }
}