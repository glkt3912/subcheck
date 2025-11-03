// Japanese Text Validation and Number Formatting Utilities

/**
 * Japanese character validation patterns
 */
export const JAPANESE_PATTERNS = {
  // Hiragana: あ-ん
  HIRAGANA: /[\u3040-\u309F]/,
  
  // Katakana: ア-ン (full-width)
  KATAKANA: /[\u30A0-\u30FF]/,
  
  // Half-width Katakana: ｱ-ﾝ 
  HALFWIDTH_KATAKANA: /[\uFF65-\uFF9F]/,
  
  // Kanji: Common CJK ideographs
  KANJI: /[\u4E00-\u9FAF]/,
  
  // Full-width numbers: ０-９
  FULLWIDTH_NUMBERS: /[\uFF10-\uFF19]/,
  
  // Full-width ASCII: Ａ-Ｚ、ａ-ｚ
  FULLWIDTH_ASCII: /[\uFF21-\uFF3A\uFF41-\uFF5A]/,
  
  // Japanese punctuation
  JAPANESE_PUNCTUATION: /[\u3000-\u303F]/,
  
  // Any Japanese character
  ANY_JAPANESE: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF65-\uFF9F]/,
  
  // Service name patterns (allow Japanese + ASCII + common symbols)
  SERVICE_NAME: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF65-\uFF9Fa-zA-Z0-9\s\-_+&().\/]*$/,
  
  // Commonly used Japanese service suffixes
  SERVICE_SUFFIXES: /(プラス|Plus|＋|プレミアム|Premium|プロ|Pro|スタンダード|Standard|ベーシック|Basic|ライト|Light)$/i
};

/**
 * Japanese text utilities
 */
export class JapaneseTextUtils {
  
  /**
   * Convert full-width characters to half-width
   */
  static toHalfWidth(text: string): string {
    return text
      // Full-width numbers to half-width
      .replace(/[\uFF10-\uFF19]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) - 0xFEE0)
      )
      // Full-width ASCII to half-width
      .replace(/[\uFF21-\uFF3A\uFF41-\uFF5A]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) - 0xFEE0)
      )
      // Full-width space to half-width
      .replace(/\u3000/g, ' ');
  }
  
  /**
   * Normalize Japanese text for comparison
   */
  static normalize(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/[　\s]+/g, ' ') // Full-width spaces to half-width
      .toLowerCase();
  }
  
  /**
   * Validate Japanese service name
   */
  static validateServiceName(name: string): {
    isValid: boolean;
    error?: string;
    suggestions?: string[];
  } {
    if (!name || name.trim().length === 0) {
      return {
        isValid: false,
        error: 'サービス名を入力してください'
      };
    }
    
    const trimmed = name.trim();
    
    // Length check
    if (trimmed.length > 50) {
      return {
        isValid: false,
        error: 'サービス名は50文字以内で入力してください'
      };
    }
    
    // Character validation
    if (!JAPANESE_PATTERNS.SERVICE_NAME.test(trimmed)) {
      return {
        isValid: false,
        error: 'サービス名に使用できない文字が含まれています'
      };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /^[0-9\s\-_+().\/]*$/, // Only numbers and symbols
      /^\s*$/, // Only whitespace
      /[<>\"'&]/  // HTML/script injection
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(trimmed)) {
        return {
          isValid: false,
          error: '有効なサービス名を入力してください'
        };
      }
    }
    
    return { isValid: true };
  }
  
  /**
   * Suggest service category based on Japanese name
   */
  static suggestCategory(serviceName: string): string {
    const normalized = this.normalize(serviceName);
    
    // Video streaming services
    const videoKeywords = [
      'ビデオ', 'video', '動画', '映画', 'ムービー', 'movie', '配信', 
      'ストリーミング', 'streaming', 'テレビ', 'tv', 'アニメ', 'ドラマ',
      'netflix', 'amazon', 'prime', 'hulu', 'disney', 'youtube', 'abema'
    ];
    
    // Music streaming services  
    const musicKeywords = [
      '音楽', 'music', 'ミュージック', 'spotify', 'apple music', 
      'amazon music', 'youtube music', 'line music', 'awa'
    ];
    
    // Gaming services
    const gamingKeywords = [
      'ゲーム', 'game', 'gaming', 'playstation', 'xbox', 'nintendo', 
      'steam', 'switch', 'プレイステーション'
    ];
    
    // Reading services
    const readingKeywords = [
      '読書', '本', 'book', 'kindle', '電子書籍', 'ebook', '雑誌', 
      'magazine', '漫画', 'manga', 'コミック'
    ];
    
    // Utility services
    const utilityKeywords = [
      'クラウド', 'cloud', 'ストレージ', 'storage', 'office', 
      'google', 'microsoft', 'adobe', 'dropbox', 'onedrive'
    ];
    
    if (videoKeywords.some(keyword => normalized.includes(keyword))) {
      return 'video';
    }
    if (musicKeywords.some(keyword => normalized.includes(keyword))) {
      return 'music';
    }
    if (gamingKeywords.some(keyword => normalized.includes(keyword))) {
      return 'gaming';
    }
    if (readingKeywords.some(keyword => normalized.includes(keyword))) {
      return 'reading';
    }
    if (utilityKeywords.some(keyword => normalized.includes(keyword))) {
      return 'utility';
    }
    
    return 'other';
  }
}

/**
 * Japanese number formatting utilities
 */
export class JapaneseNumberUtils {
  
  /**
   * Format price with Japanese yen symbol and proper grouping
   */
  static formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numPrice)) {
      return '¥0';
    }
    
    return `¥${numPrice.toLocaleString('ja-JP')}`;
  }
  
  /**
   * Format large numbers with Japanese units (万, 億)
   */
  static formatLargeNumber(num: number): string {
    if (num >= 100000000) { // 1億以上
      const oku = Math.floor(num / 100000000);
      const remainder = num % 100000000;
      const man = Math.floor(remainder / 10000);
      
      if (man === 0) {
        return `${oku}億円`;
      }
      return `${oku}億${man}万円`;
    }
    
    if (num >= 10000) { // 1万以上
      const man = Math.floor(num / 10000);
      const remainder = num % 10000;
      
      if (remainder === 0) {
        return `${man}万円`;
      }
      if (remainder < 1000) {
        return `${man}万${remainder}円`;
      }
      return `${man}万${Math.round(remainder / 1000)}千円`;
    }
    
    return `${num.toLocaleString('ja-JP')}円`;
  }
  
  /**
   * Parse Japanese number input (handle full-width numbers)
   */
  static parseJapaneseNumber(input: string): number {
    if (!input) return 0;
    
    // Convert full-width to half-width
    const normalized = JapaneseTextUtils.toHalfWidth(input)
      .replace(/[,，、]/g, '') // Remove separators
      .replace(/[円¥]/g, '') // Remove currency symbols
      .trim();
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  /**
   * Validate Japanese number input
   */
  static validatePriceInput(input: string): {
    isValid: boolean;
    error?: string;
    normalizedValue?: number;
  } {
    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        error: '金額を入力してください'
      };
    }
    
    const normalizedValue = this.parseJapaneseNumber(input);
    
    if (normalizedValue < 1) {
      return {
        isValid: false,
        error: '金額は1円以上を入力してください'
      };
    }
    
    if (normalizedValue > 100000) {
      return {
        isValid: false,
        error: '金額は10万円以下を入力してください'
      };
    }
    
    return {
      isValid: true,
      normalizedValue
    };
  }
}

/**
 * Japanese-specific validation messages
 */
export const JAPANESE_VALIDATION_MESSAGES = {
  REQUIRED: '必須項目です',
  INVALID_FORMAT: '正しい形式で入力してください',
  TOO_LONG: '文字数が上限を超えています',
  TOO_SHORT: '文字数が不足しています',
  INVALID_CHARACTERS: '使用できない文字が含まれています',
  DUPLICATE_NAME: 'この名前は既に使用されています',
  PRICE_TOO_LOW: '金額が低すぎます',
  PRICE_TOO_HIGH: '金額が高すぎます',
  PRICE_INVALID: '有効な金額を入力してください'
};

const JapaneseUtilities = {
  JapaneseTextUtils,
  JapaneseNumberUtils,
  JAPANESE_PATTERNS,
  JAPANESE_VALIDATION_MESSAGES
};

export default JapaneseUtilities;