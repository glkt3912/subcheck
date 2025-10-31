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
   * Validate subscription service name
   */
  static validateServiceName(name: string): ValidationResult {
    if (!name || typeof name !== 'string') {
      return {
        isValid: false,
        error: 'サービス名を入力してください'
      };
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length < this.MIN_NAME_LENGTH) {
      return {
        isValid: false,
        error: 'サービス名を入力してください'
      };
    }

    if (trimmedName.length > this.MAX_NAME_LENGTH) {
      return {
        isValid: false,
        error: `サービス名は${this.MAX_NAME_LENGTH}文字以内で入力してください`
      };
    }

    // Check for invalid characters (basic validation)
    const invalidCharsRegex = /[<>"/\\&]/;
    if (invalidCharsRegex.test(trimmedName)) {
      return {
        isValid: false,
        error: '無効な文字が含まれています'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate monthly price
   */
  static validateMonthlyPrice(price: number | string): ValidationResult {
    // Convert string to number if needed
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numPrice)) {
      return {
        isValid: false,
        error: '有効な金額を入力してください'
      };
    }

    if (numPrice < this.MIN_PRICE) {
      return {
        isValid: false,
        error: `金額は${this.MIN_PRICE}円以上を入力してください`
      };
    }

    if (numPrice > this.MAX_PRICE) {
      return {
        isValid: false,
        error: `金額は${this.MAX_PRICE.toLocaleString()}円以下を入力してください`
      };
    }

    // Check for reasonable decimal places (max 2)
    const decimalPlaces = (numPrice.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return {
        isValid: false,
        error: '小数点以下は2桁まで入力可能です'
      };
    }

    return { isValid: true };
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
   * Sanitize service name (remove dangerous characters, trim whitespace)
   */
  static sanitizeServiceName(name: string): string {
    if (!name || typeof name !== 'string') {
      return '';
    }

    return name
      .trim()
      .replace(/[<>"/\\&]/g, '') // Remove potentially dangerous characters
      .substring(0, this.MAX_NAME_LENGTH); // Truncate if too long
  }

  /**
   * Format and validate price input
   */
  static formatPrice(price: number | string): number {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
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
   * Generate suggested category based on service name
   */
  static suggestCategory(serviceName: string): string {
    const name = serviceName.toLowerCase();
    
    // Video streaming keywords
    if (name.includes('netflix') || name.includes('youtube') || name.includes('amazon prime') || 
        name.includes('hulu') || name.includes('disney') || name.includes('動画') || 
        name.includes('映画') || name.includes('video')) {
      return 'video';
    }
    
    // Music streaming keywords
    if (name.includes('spotify') || name.includes('apple music') || name.includes('youtube music') ||
        name.includes('音楽') || name.includes('music')) {
      return 'music';
    }
    
    // Gaming keywords
    if (name.includes('game') || name.includes('gaming') || name.includes('playstation') ||
        name.includes('xbox') || name.includes('nintendo') || name.includes('steam') ||
        name.includes('ゲーム')) {
      return 'gaming';
    }
    
    // Reading keywords
    if (name.includes('kindle') || name.includes('book') || name.includes('magazine') ||
        name.includes('本') || name.includes('雑誌') || name.includes('読書')) {
      return 'reading';
    }
    
    // Utility keywords
    if (name.includes('cloud') || name.includes('storage') || name.includes('backup') ||
        name.includes('vpn') || name.includes('クラウド') || name.includes('ストレージ')) {
      return 'utility';
    }
    
    return 'other';
  }
}