// Performance optimization utilities

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Custom hook for debouncing values to improve performance
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 */
export function useThrottle<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      return func(...args);
    }
  }, [func, delay]) as T;
}

/**
 * Memoized subscription sorting for better performance
 */
interface Subscription {
  name: string;
  monthlyPrice?: number;
  category: string;
  [key: string]: unknown;
}

export const useMemoizedSubscriptionSort = (
  subscriptions: Subscription[],
  sortKey: string
) => {
  return useMemo(() => {
    if (!subscriptions?.length) return [];
    
    return [...subscriptions].sort((a, b) => {
      if (sortKey === 'name') {
        return a.name.localeCompare(b.name, 'ja');
      }
      if (sortKey === 'price') {
        return (a.monthlyPrice || 0) - (b.monthlyPrice || 0);
      }
      if (sortKey === 'category') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });
  }, [subscriptions, sortKey]);
};

/**
 * Optimized calculation memoization
 */
interface UserSubscription {
  subscriptionId: string;
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'unused';
  [key: string]: unknown;
}

interface SubscriptionDetail {
  monthlyPrice?: number;
  [key: string]: unknown;
}

export const useMemoizedCalculation = (
  userSubscriptions: UserSubscription[],
  subscriptionDetails: Record<string, SubscriptionDetail>
) => {
  return useMemo(() => {
    if (!userSubscriptions?.length) {
      return {
        totalMonthly: 0,
        totalYearly: 0,
        wasteAmount: 0,
        wasteRate: 0
      };
    }

    let totalMonthly = 0;
    let totalWaste = 0;

    userSubscriptions.forEach(userSub => {
      const service = subscriptionDetails[userSub.subscriptionId];
      if (!service) return;

      const price = service.monthlyPrice || 0;
      const multipliers = {
        daily: 0,
        weekly: 0.25,
        monthly: 0.6,
        unused: 1.0
      };
      const wasteMultiplier = multipliers[userSub.usageFrequency as keyof typeof multipliers] || 0;

      totalMonthly += price;
      totalWaste += price * wasteMultiplier;
    });

    const wasteRate = totalMonthly > 0 ? Math.round((totalWaste / totalMonthly) * 100) : 0;

    return {
      totalMonthly: Math.round(totalMonthly),
      totalYearly: Math.round(totalMonthly * 12),
      wasteAmount: Math.round(totalWaste * 12),
      wasteRate
    };
  }, [userSubscriptions, subscriptionDetails]);
};

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();
  
  static startMark(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const markName = `${name}-start`;
      performance.mark(markName);
      this.marks.set(name, performance.now());
    }
  }
  
  static endMark(name: string): number | null {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const startTime = this.marks.get(name);
      if (startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const endMarkName = `${name}-end`;
        performance.mark(endMarkName);
        performance.measure(name, `${name}-start`, endMarkName);
        
        this.marks.delete(name);
        return duration;
      }
    }
    return null;
  }
  
  static logPerformance(name: string, threshold: number = 100): void {
    const duration = this.endMark(name);
    if (duration !== null && duration > threshold) {
      console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`);
    }
  }
}

/**
 * Lazy loading utility for components
 */
export const createLazyComponent = <T extends React.ComponentType<Record<string, unknown>>>(
  importFunc: () => Promise<{ default: T }>
  // fallback parameter not currently used in this implementation
) => {
  return React.lazy(importFunc);
};

/**
 * Memory usage monitoring (development only)
 */
export const logMemoryUsage = (): void => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as PerformanceWithMemory).memory;
    console.log('Memory usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
    });
  }
};

// Web Vitals monitoring
interface PerformanceWithMemory extends Performance {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
}

export const setupWebVitals = (): void => {
  if (typeof window !== 'undefined') {
    // Monitor Cumulative Layout Shift
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ((entry as LayoutShiftEntry).value > 0.1) {
          console.warn('High CLS detected:', (entry as LayoutShiftEntry).value);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });

    // Monitor First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FCP:', entry.startTime);
      }
    }).observe({ entryTypes: ['paint'] });
  }
};