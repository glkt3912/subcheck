// SubCheck Diagnosis Calculator
// Calculates waste rate and annual waste amount based on usage frequency

import { UserSubscription, DiagnosisResult, FrequencyBreakdown, ComparisonItem, RecommendationItem, Subscription } from '@/types';
import { SUBSCRIPTION_DATA } from '@/lib/data/subscriptions';

// Frequency multipliers based on actual usage vs paid amount  
const FREQUENCY_MULTIPLIERS: Record<string, number> = {
  daily: 0.0,      // No waste - getting full value
  weekly: 0.25,    // 25% waste
  monthly: 0.6,    // 60% waste
  unused: 1.0      // 100% waste
};

// Comparison examples for waste visualization
const COMPARISON_EXAMPLES: ComparisonItem[] = [
  {
    amount: 10000,
    description: 'コンビニ弁当約20回分',
    icon: '🍱',
    category: 'food'
  },
  {
    amount: 20000,
    description: 'Amazon Echo Dot',
    icon: '🔊',
    category: 'gadget'
  },
  {
    amount: 30000,
    description: '国内温泉旅行（1泊2日）',
    icon: '♨️',
    category: 'travel'
  },
  {
    amount: 50000,
    description: '新しいスマートフォン',
    icon: '📱',
    category: 'gadget'
  },
  {
    amount: 70000,
    description: '韓国旅行（2泊3日）',
    icon: '✈️',
    category: 'travel'
  },
  {
    amount: 100000,
    description: 'Nintendo Switch + ゲーム10本',
    icon: '🎮',
    category: 'hobby'
  },
  {
    amount: 150000,
    description: 'ヨーロッパ旅行（5日間）',
    icon: '🏰',
    category: 'travel'
  }
];

function getSubscriptionById(id: string, allSubscriptions: Subscription[]) {
  return allSubscriptions.find(sub => sub.id === id);
}

export function calculateDiagnosis(
  userSubscriptions: UserSubscription[], 
  allSubscriptions?: Subscription[]
): DiagnosisResult {
  // Use provided subscriptions or fall back to static data
  const subscriptionData = allSubscriptions || SUBSCRIPTION_DATA;
  
  let totalMonthly = 0;
  let totalWasteMonthly = 0;
  const frequencyBreakdown: FrequencyBreakdown = {
    daily: 0,
    weekly: 0,
    monthly: 0,
    unused: 0
  };

  // Calculate totals and breakdown
  userSubscriptions.forEach(userSub => {
    const subscription = getSubscriptionById(userSub.subscriptionId, subscriptionData);
    
    if (!subscription) {
      console.warn(`❌ Subscription not found: ${userSub.subscriptionId}`);
      return;
    }

    const price = subscription.monthlyPrice;
    const wasteMultiplier = FREQUENCY_MULTIPLIERS[userSub.usageFrequency];
    const wasteAmount = price * wasteMultiplier;

    totalMonthly += price;
    totalWasteMonthly += wasteAmount;
    frequencyBreakdown[userSub.usageFrequency as keyof FrequencyBreakdown] += price;
  });

  const wasteRate = totalMonthly > 0 ? Math.round((totalWasteMonthly / totalMonthly) * 100) : 0;
  const annualWaste = totalWasteMonthly * 12;

  // Generate comparison items based on waste amount
  const comparisonItems = generateComparisonItems(annualWaste);

  // Generate recommendations
  const recommendations = generateRecommendations(userSubscriptions, subscriptionData);

  return {
    subscriptions: userSubscriptions,
    totals: {
      monthly: Math.round(totalMonthly),
      yearly: Math.round(totalMonthly * 12),
      unusedYearly: Math.round(annualWaste)
    },
    wasteRate,
    frequencyBreakdown,
    comparisonItems,
    recommendations,
    createdAt: new Date(),
    shareId: generateShareId()
  };
}

function generateComparisonItems(wasteAmount: number): ComparisonItem[] {
  // Find comparison items that are close to the waste amount
  const suitable = COMPARISON_EXAMPLES.filter(item => 
    item.amount <= wasteAmount && item.amount >= wasteAmount * 0.3
  );

  // If no suitable items found, find the closest one
  if (suitable.length === 0) {
    const closest = COMPARISON_EXAMPLES.reduce((prev, curr) => 
      Math.abs(curr.amount - wasteAmount) < Math.abs(prev.amount - wasteAmount) ? curr : prev
    );
    return [closest];
  }

  // Return up to 3 most suitable items
  return suitable
    .sort((a, b) => Math.abs(b.amount - wasteAmount) - Math.abs(a.amount - wasteAmount))
    .slice(0, 3);
}

function generateRecommendations(userSubscriptions: UserSubscription[], subscriptionData: Subscription[]): RecommendationItem[] {
  const recommendations: RecommendationItem[] = [];

  userSubscriptions.forEach(userSub => {
    const subscription = getSubscriptionById(userSub.subscriptionId, subscriptionData);
    if (!subscription) return;

    const price = subscription.monthlyPrice;

    switch (userSub.usageFrequency) {
      case 'unused':
        recommendations.push({
          subscriptionId: userSub.subscriptionId,
          action: 'cancel',
          reason: '全く使用していません。解約をおすすめします。',
          potentialSaving: {
            monthly: price,
            yearly: price * 12
          },
          priority: 'high'
        });
        break;

      case 'monthly':
        if (price > 1000) {
          recommendations.push({
            subscriptionId: userSub.subscriptionId,
            action: 'review',
            reason: '使用頻度が少ないため、本当に必要か検討してみてください。',
            potentialSaving: {
              monthly: Math.round(price * 0.6),
              yearly: Math.round(price * 0.6 * 12)
            },
            priority: 'medium'
          });
        }
        break;

      case 'weekly':
        if (price > 1500) {
          recommendations.push({
            subscriptionId: userSub.subscriptionId,
            action: 'downgrade',
            reason: '使用頻度に対して料金が高めです。より安いプランがないか確認してみてください。',
            potentialSaving: {
              monthly: Math.round(price * 0.3),
              yearly: Math.round(price * 0.3 * 12)
            },
            priority: 'low'
          });
        }
        break;
    }
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

function generateShareId(): string {
  return Math.random().toString(36).substring(2, 8);
}

// Utility functions for analysis
export function getWasteRateLevel(wasteRate: number): 'low' | 'medium' | 'high' {
  if (wasteRate < 20) return 'low';
  if (wasteRate < 50) return 'medium';
  return 'high';
}

export function getWasteRateMessage(wasteRate: number): string {
  const level = getWasteRateLevel(wasteRate);
  
  switch (level) {
    case 'low':
      return 'とても効率的にサブスクを活用できています！👏';
    case 'medium':
      return 'まずまずですが、まだ改善の余地がありそうです。📊';
    case 'high':
      return 'かなりの無駄が発生しています。見直しをおすすめします！⚠️';
    default:
      return '';
  }
}

export function calculatePotentialSavings(recommendations: RecommendationItem[]): number {
  return recommendations.reduce((total, rec) => total + rec.potentialSaving.yearly, 0);
}

// Color schemes for charts based on waste rate
export function getWasteRateColors(wasteRate: number) {
  const level = getWasteRateLevel(wasteRate);
  
  switch (level) {
    case 'low':
      return {
        primary: '#10B981',   // Green
        secondary: '#34D399',
        background: '#ECFDF5'
      };
    case 'medium':
      return {
        primary: '#F59E0B',   // Yellow
        secondary: '#FBBF24',
        background: '#FFFBEB'
      };
    case 'high':
      return {
        primary: '#EF4444',   // Red
        secondary: '#F87171',
        background: '#FEF2F2'
      };
    default:
      return {
        primary: '#6B7280',
        secondary: '#9CA3AF',
        background: '#F9FAFB'
      };
  }
}