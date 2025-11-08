// SubCheck Subscription Master Data
// Updated with 2025 pricing data

import { Subscription, SubscriptionCategory } from '@/types';

export const SUBSCRIPTION_DATA: Subscription[] = [
  // Video Streaming Services
  {
    id: 'amazon-prime-video',
    name: 'Amazon Prime Video',
    category: SubscriptionCategory.VIDEO,
    monthlyPrice: 600,
    logoUrl: '/logos/amazon-prime.svg',
    isPopular: true
  },
  {
    id: 'netflix',
    name: 'Netflix',
    category: SubscriptionCategory.VIDEO,
    monthlyPrice: 1590,
    logoUrl: '/logos/netflix.svg',
    isPopular: true
  },
  {
    id: 'spotify',
    name: 'Spotify Premium',
    category: SubscriptionCategory.MUSIC,
    monthlyPrice: 1080, // 2025年値上げ後: 980円 → 1080円
    logoUrl: '/logos/spotify.svg',
    isPopular: true
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    category: SubscriptionCategory.MUSIC,
    monthlyPrice: 1080,
    logoUrl: '/logos/apple-music.svg',
    isPopular: true
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    category: SubscriptionCategory.VIDEO,
    monthlyPrice: 1280, // 2023年値上げ後: 1180円 → 1280円（現在価格）
    logoUrl: '/logos/youtube.svg',
    isPopular: true // 人気度上昇のため変更
  },
  {
    id: 'u-next',
    name: 'U-NEXT',
    category: SubscriptionCategory.VIDEO,
    monthlyPrice: 2189,
    logoUrl: '/logos/u-next.svg',
    isPopular: true
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    category: SubscriptionCategory.VIDEO,
    monthlyPrice: 1140, // 2025年4月改定: スタンダードプラン
    logoUrl: '/logos/disney-plus.svg',
    isPopular: true
  },
  {
    id: 'adobe-creative-cloud',
    name: 'Adobe Creative Cloud',
    category: SubscriptionCategory.UTILITY,
    monthlyPrice: 7780,
    logoUrl: '/logos/adobe.svg',
    isPopular: false
  },
  
  // Music Streaming - Expanded
  {
    id: 'youtube-music',
    name: 'YouTube Music Premium',
    category: SubscriptionCategory.MUSIC,
    monthlyPrice: 1080,
    logoUrl: '/logos/youtube-music.svg',
    isPopular: true
  },
  
  // Gaming Services
  {
    id: 'playstation-plus-extra',
    name: 'PlayStation Plus Extra',
    category: SubscriptionCategory.GAMING,
    monthlyPrice: 1300,
    logoUrl: '/logos/playstation-plus.svg',
    isPopular: true
  },
  {
    id: 'nintendo-switch-online',
    name: 'Nintendo Switch Online',
    category: SubscriptionCategory.GAMING,
    monthlyPrice: 490, // 年額2,400円÷12ヶ月
    logoUrl: '/logos/nintendo-switch.svg',
    isPopular: true
  },
  
  // Reading & Content
  {
    id: 'kindle-unlimited',
    name: 'Kindle Unlimited',
    category: SubscriptionCategory.READING,
    monthlyPrice: 980,
    logoUrl: '/logos/kindle.svg',
    isPopular: true
  },
  
  // Cloud & Productivity
  {
    id: 'microsoft-365',
    name: 'Microsoft 365 Personal',
    category: SubscriptionCategory.UTILITY,
    monthlyPrice: 1490, // 年額14,900円÷12ヶ月
    logoUrl: '/logos/microsoft-365.svg',
    isPopular: true
  },
  {
    id: 'icloud-plus',
    name: 'iCloud+ (200GB)',
    category: SubscriptionCategory.UTILITY,
    monthlyPrice: 400,
    logoUrl: '/logos/icloud.svg',
    isPopular: true
  },
  
  // AI Services - 2024-2025年の急成長分野
  {
    id: 'chatgpt-plus',
    name: 'ChatGPT Plus',
    category: SubscriptionCategory.UTILITY,
    monthlyPrice: 3000, // iOS版基準（Web版は為替変動あり）
    logoUrl: '/logos/chatgpt.svg',
    isPopular: true
  },
  {
    id: 'claude-pro',
    name: 'Claude Pro',
    category: SubscriptionCategory.UTILITY,
    monthlyPrice: 3100, // 20USD（1ドル≈155円）
    logoUrl: '/logos/claude.svg',
    isPopular: true
  },
  {
    id: 'gemini-advanced',
    name: 'Gemini Advanced',
    category: SubscriptionCategory.UTILITY,
    monthlyPrice: 2860, // iOS版（税込）
    logoUrl: '/logos/gemini.svg',
    isPopular: true
  }
];

// Export aliases for compatibility
export const MASTER_SUBSCRIPTIONS = SUBSCRIPTION_DATA;

export function getAllSubscriptions(): Subscription[] {
  return SUBSCRIPTION_DATA;
}

export function getSubscriptionById(id: string): Subscription | undefined {
  return SUBSCRIPTION_DATA.find(sub => sub.id === id);
}

export const SUBSCRIPTION_CATEGORIES = SubscriptionCategory;