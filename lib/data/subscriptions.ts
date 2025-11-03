// SubCheck Subscription Master Data
// Simplified for performance testing

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
    monthlyPrice: 1080,
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
    monthlyPrice: 1280,
    logoUrl: '/logos/youtube.svg',
    isPopular: false
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
    monthlyPrice: 1320,
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