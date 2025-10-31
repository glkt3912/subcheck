// Subscription Service - Manages subscription data and custom subscriptions

import { Subscription, SubscriptionCategory } from '@/types';
import { SUBSCRIPTION_DATA } from '@/lib/data/subscriptions';
import { CustomSubscriptionInput, ValidationUtils } from '@/lib/utils/validation';

export class SubscriptionService {
  private storage: Storage | null;

  constructor(storage?: Storage) {
    // Handle SSR case where localStorage is not available
    this.storage = storage || (typeof window !== 'undefined' ? localStorage : null);
  }

  /**
   * Get all available subscriptions (predefined + custom)
   */
  async getAllSubscriptions(): Promise<Subscription[]> {
    const predefined = SUBSCRIPTION_DATA;
    const custom = await this.loadCustomSubscriptions();
    return [...predefined, ...custom];
  }

  /**
   * Get predefined popular subscriptions for quick selection
   */
  async getPopularSubscriptions(): Promise<Subscription[]> {
    return SUBSCRIPTION_DATA
      .filter(sub => sub.isPopular)
      .sort((a, b) => a.name.localeCompare(b.name, 'ja'))
      .slice(0, 5);
  }

  /**
   * Get subscriptions by category
   */
  async getSubscriptionsByCategory(category: SubscriptionCategory): Promise<Subscription[]> {
    const all = await this.getAllSubscriptions();
    return all.filter(sub => sub.category === category);
  }

  /**
   * Add custom subscription service
   */
  async addCustomSubscription(customSubscription: CustomSubscriptionInput): Promise<Subscription> {
    // Validate input
    const validation = ValidationUtils.validateCustomSubscription(customSubscription);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Check for duplicates
    const allSubscriptions = await this.getAllSubscriptions();
    const duplicateCheck = ValidationUtils.checkDuplicateName(customSubscription.name, allSubscriptions);
    if (!duplicateCheck.isValid) {
      throw new Error(duplicateCheck.error);
    }

    // Create subscription object
    const customSub: Subscription = {
      id: this.generateCustomId(customSubscription.name),
      name: ValidationUtils.sanitizeServiceName(customSubscription.name),
      category: customSubscription.category as SubscriptionCategory,
      monthlyPrice: ValidationUtils.formatPrice(customSubscription.monthlyPrice),
      isPopular: false
    };

    const existing = await this.loadCustomSubscriptions();
    const updated = [...existing, customSub];
    await this.saveCustomSubscriptions(updated);

    return customSub;
  }

  /**
   * Remove custom subscription
   */
  async removeCustomSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const existing = await this.loadCustomSubscriptions();
      const updated = existing.filter(sub => sub.id !== subscriptionId);
      await this.saveCustomSubscriptions(updated);
      return true;
    } catch (error) {
      console.error('Failed to remove custom subscription:', error);
      return false;
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string): Promise<Subscription | undefined> {
    const all = await this.getAllSubscriptions();
    return all.find(sub => sub.id === id);
  }

  /**
   * Edit custom subscription
   */
  async editCustomSubscription(subscriptionId: string, updatedData: CustomSubscriptionInput): Promise<Subscription> {
    // Validate input
    const validation = ValidationUtils.validateCustomSubscription(updatedData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const existing = await this.loadCustomSubscriptions();
    const subscriptionIndex = existing.findIndex(sub => sub.id === subscriptionId);
    
    if (subscriptionIndex === -1) {
      throw new Error('カスタムサブスクリプションが見つかりません');
    }

    // Check for duplicates (excluding current subscription)
    const otherSubscriptions = existing.filter(sub => sub.id !== subscriptionId);
    const allOthers = [...SUBSCRIPTION_DATA, ...otherSubscriptions];
    const duplicateCheck = ValidationUtils.checkDuplicateName(updatedData.name, allOthers);
    if (!duplicateCheck.isValid) {
      throw new Error(duplicateCheck.error);
    }

    // Update subscription
    const updatedSubscription: Subscription = {
      ...existing[subscriptionIndex],
      name: ValidationUtils.sanitizeServiceName(updatedData.name),
      category: updatedData.category as SubscriptionCategory,
      monthlyPrice: ValidationUtils.formatPrice(updatedData.monthlyPrice)
    };

    existing[subscriptionIndex] = updatedSubscription;
    await this.saveCustomSubscriptions(existing);

    return updatedSubscription;
  }

  /**
   * Get only custom subscriptions
   */
  async getCustomSubscriptions(): Promise<Subscription[]> {
    return await this.loadCustomSubscriptions();
  }

  /**
   * Get only predefined subscriptions
   */
  getPredefinedSubscriptions(): Subscription[] {
    return SUBSCRIPTION_DATA;
  }

  /**
   * Check if subscription is custom
   */
  isCustomSubscription(subscriptionId: string): boolean {
    return subscriptionId.startsWith('custom_');
  }

  /**
   * Clear all custom subscriptions
   */
  async clearCustomSubscriptions(): Promise<void> {
    await this.saveCustomSubscriptions([]);
  }

  /**
   * Get custom subscriptions count
   */
  async getCustomSubscriptionsCount(): Promise<number> {
    const custom = await this.loadCustomSubscriptions();
    return custom.length;
  }

  /**
   * Validate subscription data
   */
  validateSubscription(subscription: Partial<Subscription>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!subscription.name || subscription.name.trim().length === 0) {
      errors.push('サービス名は必須です');
    }

    if (!subscription.monthlyPrice || subscription.monthlyPrice <= 0) {
      errors.push('月額料金は0円より大きい値を入力してください');
    }

    if (subscription.monthlyPrice && subscription.monthlyPrice > 50000) {
      errors.push('月額料金は50,000円以下で入力してください');
    }

    if (!subscription.category) {
      errors.push('カテゴリは必須です');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Search subscriptions by name
   */
  async searchSubscriptions(query: string): Promise<Subscription[]> {
    const all = await this.getAllSubscriptions();
    const lowerQuery = query.toLowerCase();
    
    return all.filter(sub => 
      sub.name.toLowerCase().includes(lowerQuery) ||
      sub.id.toLowerCase().includes(lowerQuery)
    );
  }

  // Private methods

  private async loadCustomSubscriptions(): Promise<Subscription[]> {
    try {
      if (!this.storage) return [];
      const stored = this.storage.getItem('subcheck_custom_subscriptions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load custom subscriptions:', error);
      return [];
    }
  }

  private async saveCustomSubscriptions(subscriptions: Subscription[]): Promise<void> {
    try {
      if (!this.storage) {
        console.warn('Storage not available, cannot save custom subscriptions');
        return;
      }
      this.storage.setItem('subcheck_custom_subscriptions', JSON.stringify(subscriptions));
    } catch (error) {
      console.error('Failed to save custom subscriptions:', error);
      throw error;
    }
  }

  private generateCustomId(name: string): string {
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const timestamp = Date.now().toString(36);
    return `custom-${base}-${timestamp}`;
  }
}