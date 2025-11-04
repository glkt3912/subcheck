// Error Handling Utilities for Storage and User Feedback

export enum ErrorType {
  STORAGE_UNAVAILABLE = 'storage_unavailable',
  STORAGE_QUOTA_EXCEEDED = 'storage_quota_exceeded', 
  STORAGE_CORRUPTION = 'storage_corruption',
  NETWORK_ERROR = 'network_error',
  VALIDATION_ERROR = 'validation_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  timestamp: Date;
  stack?: string;
}

export class ErrorHandler {
  
  /**
   * Handle localStorage errors with user-friendly messages
   */
  static handleStorageError(error: unknown, operation: string): AppError {
    const timestamp = new Date();
    
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'QuotaExceededError':
          return {
            type: ErrorType.STORAGE_QUOTA_EXCEEDED,
            message: `Storage quota exceeded during ${operation}`,
            userMessage: 'ストレージの容量が不足しています。ブラウザのデータを整理してください。',
            timestamp
          };
          
        case 'SecurityError':
          return {
            type: ErrorType.STORAGE_UNAVAILABLE,
            message: `Storage access denied during ${operation}`,
            userMessage: 'ストレージにアクセスできません。プライベートブラウジングモードでないか確認してください。',
            timestamp
          };
          
        default:
          return {
            type: ErrorType.STORAGE_CORRUPTION,
            message: `Storage error during ${operation}: ${error.message}`,
            userMessage: 'データの保存に問題が発生しました。ページを更新してお試しください。',
            timestamp
          };
      }
    }
    
    if (error instanceof SyntaxError) {
      return {
        type: ErrorType.STORAGE_CORRUPTION,
        message: `Storage data corruption during ${operation}`,
        userMessage: '保存されたデータが破損しています。データをリセットしてください。',
        timestamp
      };
    }
    
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: `Unknown storage error during ${operation}: ${String(error)}`,
      userMessage: '予期しないエラーが発生しました。ページを更新してお試しください。',
      timestamp,
      stack: error instanceof Error ? error.stack : undefined
    };
  }
  
  /**
   * Handle validation errors
   */
  static handleValidationError(error: unknown, field: string): AppError {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message: `Validation error for ${field}: ${String(error)}`,
      userMessage: typeof error === 'string' ? error : `${field}の入力に問題があります。`,
      timestamp: new Date()
    };
  }
  
  /**
   * Log error for debugging while showing user-friendly message
   */
  static logAndNotify(error: AppError): void {
    // Log full error details for debugging
    console.error('[SubCheck Error]', {
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      stack: error.stack
    });
    
    // You could integrate with toast notifications here
    // For now, we'll just ensure the error is properly structured
  }
  
  /**
   * Create fallback data when storage fails
   */
  static getStorageFallback<T>(key: string, fallbackValue: T): T {
    console.warn(`Using fallback value for ${key} due to storage error`);
    return fallbackValue;
  }
  
  /**
   * Safe storage operation with retry
   */
  static async safeStorageOperation<T>(
    operation: () => T,
    operationName: string,
    retries: number = 1
  ): Promise<{ success: boolean; data?: T; error?: AppError }> {
    let lastError: AppError | undefined;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const data = operation();
        return { success: true, data };
      } catch (error) {
        lastError = this.handleStorageError(error, operationName);
        
        if (attempt < retries) {
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
        }
      }
    }
    
    if (lastError) {
      this.logAndNotify(lastError);
    }
    
    return { success: false, error: lastError };
  }
}

/**
 * Storage availability checker with error context
 */
export function checkStorageAvailability(): { 
  available: boolean; 
  error?: AppError 
} {
  try {
    if (typeof window === 'undefined') {
      return { 
        available: false, 
        error: {
          type: ErrorType.STORAGE_UNAVAILABLE,
          message: 'Window object undefined (SSR)',
          userMessage: 'サーバーサイドレンダリング中です。',
          timestamp: new Date()
        }
      };
    }
    
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return { available: true };
  } catch (error) {
    return { 
      available: false, 
      error: ErrorHandler.handleStorageError(error, 'availability check')
    };
  }
}

/**
 * Safe localStorage wrapper
 */
export class SafeStorage {
  static getItem<T>(key: string, fallback: T): T {
    const { available, error } = checkStorageAvailability();
    
    if (!available) {
      if (error) {
        ErrorHandler.logAndNotify(error);
      }
      return fallback;
    }
    
    // Note: Async operation not used in this sync implementation
    // const result = ErrorHandler.safeStorageOperation(...);
    
    // Since this is sync operation for compatibility, we use a simpler approach
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
      const appError = ErrorHandler.handleStorageError(error, `getItem(${key})`);
      ErrorHandler.logAndNotify(appError);
      return fallback;
    }
  }
  
  static setItem<T>(key: string, value: T): boolean {
    const { available, error } = checkStorageAvailability();
    
    if (!available) {
      if (error) {
        ErrorHandler.logAndNotify(error);
      }
      return false;
    }
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      const appError = ErrorHandler.handleStorageError(error, `setItem(${key})`);
      ErrorHandler.logAndNotify(appError);
      return false;
    }
  }
  
  static removeItem(key: string): boolean {
    const { available, error } = checkStorageAvailability();
    
    if (!available) {
      if (error) {
        ErrorHandler.logAndNotify(error);
      }
      return false;
    }
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      const appError = ErrorHandler.handleStorageError(error, `removeItem(${key})`);
      ErrorHandler.logAndNotify(appError);
      return false;
    }
  }
}

export default ErrorHandler;