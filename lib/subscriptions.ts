// SubCheck Subscription Master Data
// Updated with 2024-2025 Japanese market pricing

import { Subscription } from '@/types';

export const SUBSCRIPTION_DATA: Subscription[] = [
  // Video Streaming Services
  {
    id: 'amazon-prime-video',
    name: 'Amazon Prime Video',
    category: 'video',
    price: 600,
    priceRange: { min: 600, max: 600 },
    logo: '/logos/amazon-prime.svg',
    description: 'Amazonプライム会員特典の動画配信サービス',
    marketShare: '44.7%',
    popularityRank: 1,
    lastPriceUpdate: '2024-12-01'
  },
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'video',
    price: 1590,
    priceRange: { min: 790, max: 1980 },
    logo: '/logos/netflix.svg',
    description: '世界最大の動画配信サービス',
    marketShare: '20.8%',
    popularityRank: 2,
    lastPriceUpdate: '2025-01-15'
  },
  {
    id: 'u-next',
    name: 'U-NEXT',
    category: 'video',
    price: 2189,
    priceRange: { min: 2189, max: 2189 },
    logo: '/logos/u-next.svg',
    description: '日本最大級の動画・電子書籍配信サービス',
    marketShare: '15.3%',
    popularityRank: 3,
    lastPriceUpdate: '2024-10-01'
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    category: 'video',
    price: 990,
    priceRange: { min: 990, max: 1320 },
    logo: '/logos/disney-plus.svg',
    description: 'ディズニー、ピクサー、マーベル等の動画配信',
    marketShare: '8.5%',
    popularityRank: 4,
    lastPriceUpdate: '2024-11-01'
  },

  // Music Streaming Services
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'music',
    price: 1080,
    priceRange: { min: 480, max: 1680 },
    logo: '/logos/spotify.svg',
    description: '世界最大の音楽ストリーミングサービス',
    marketShare: '28.4%',
    popularityRank: 5,
    lastPriceUpdate: '2025-01-01'
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    category: 'music',
    price: 1080,
    priceRange: { min: 580, max: 1680 },
    logo: '/logos/apple-music.svg',
    description: 'Apple提供の音楽ストリーミングサービス',
    marketShare: '25.1%',
    popularityRank: 6,
    lastPriceUpdate: '2024-10-01'
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    category: 'music',
    price: 1080,
    priceRange: { min: 1080, max: 1080 },
    logo: '/logos/youtube-music.svg',
    description: 'YouTube提供の音楽ストリーミングサービス',
    marketShare: '18.7%',
    popularityRank: 7,
    lastPriceUpdate: '2024-09-01'
  },

  // Digital Services
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    category: 'digital',
    price: 1280,
    priceRange: { min: 1280, max: 1280 },
    logo: '/logos/youtube-premium.svg',
    description: '広告なしYouTube視聴とYouTube Music',
    marketShare: '12.3%',
    popularityRank: 8,
    lastPriceUpdate: '2024-08-01'
  },
  {
    id: 'playstation-plus',
    name: 'PlayStation Plus',
    category: 'digital',
    price: 1300,
    priceRange: { min: 850, max: 1300 },
    logo: '/logos/playstation-plus.svg',
    description: 'PlayStation向けゲームサブスクリプション',
    marketShare: '9.6%',
    popularityRank: 9,
    lastPriceUpdate: '2024-09-01'
  },
  {
    id: 'kindle-unlimited',
    name: 'Kindle Unlimited',
    category: 'digital',
    price: 980,
    priceRange: { min: 980, max: 980 },
    logo: '/logos/kindle-unlimited.svg',
    description: 'Amazonの電子書籍読み放題サービス',
    marketShare: '7.2%',
    popularityRank: 10,
    lastPriceUpdate: '2024-07-01'
  }
];

// Helper functions for data access
export function getAllSubscriptions(): Subscription[] {
  return SUBSCRIPTION_DATA;
}

export function getSubscriptionsByCategory(category: string): Subscription[] {
  return SUBSCRIPTION_DATA.filter(sub => sub.category === category);
}

export function getSubscriptionById(id: string): Subscription | undefined {
  return SUBSCRIPTION_DATA.find(sub => sub.id === id);
}

export function getPopularSubscriptions(limit: number = 5): Subscription[] {
  return SUBSCRIPTION_DATA
    .sort((a, b) => a.popularityRank - b.popularityRank)
    .slice(0, limit);
}

export function getTotalSubscriptions(): number {
  return SUBSCRIPTION_DATA.length;
}

export function getCategoryTotals(): Record<string, number> {
  return SUBSCRIPTION_DATA.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// Validation function
export function validateSubscriptionData(): boolean {
  const requiredFields = ['id', 'name', 'category', 'price', 'priceRange', 'logo', 'description', 'popularityRank'];
  
  return SUBSCRIPTION_DATA.every(sub => {
    return requiredFields.every(field => sub.hasOwnProperty(field)) &&
           sub.price >= sub.priceRange.min &&
           sub.price <= sub.priceRange.max &&
           sub.popularityRank > 0;
  });
}

// Constants for categories
export const SUBSCRIPTION_CATEGORIES = {
  video: '動画配信',
  music: '音楽配信',
  digital: 'デジタルサービス'
} as const;

export type SubscriptionCategoryKey = keyof typeof SUBSCRIPTION_CATEGORIES;