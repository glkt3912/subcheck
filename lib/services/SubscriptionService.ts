// Subscription Service - Manages subscription data and custom subscriptions

import { Subscription, SubscriptionCategory, UserSubscription } from '@/types';
import { SUBSCRIPTION_DATA } from '@/lib/data/subscriptions';

export class SubscriptionService {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
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
      .sort((a, b) => a.popularityRank - b.popularityRank)
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
  async addCustomSubscription(subscription: Omit<Subscription, 'id'>): Promise<Subscription> {
    const customSub: Subscription = {
      ...subscription,
      id: this.generateCustomId(subscription.name),
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
      const stored = this.storage.getItem('subcheck_custom_subscriptions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load custom subscriptions:', error);
      return [];
    }
  }

  private async saveCustomSubscriptions(subscriptions: Subscription[]): Promise<void> {
    try {
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