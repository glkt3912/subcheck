// SubCheck Calculation Constants
// Usage frequency waste rate multipliers and comparison data

export const WASTE_MULTIPLIERS = {
  DAILY: 0,      // 0% waste - getting full value
  WEEKLY: 25,    // 25% waste - moderate usage
  MONTHLY: 60,   // 60% waste - low usage  
  UNUSED: 100    // 100% waste - no usage
} as const;

export const EQUIVALENT_ITEMS = [
  { threshold: 10000, item: 'コンビニ弁当約20回分', icon: '🍱' },
  { threshold: 20000, item: 'Amazon Echo Dot', icon: '🔊' },
  { threshold: 30000, item: '国内温泉旅行（1泊2日）', icon: '♨️' },
  { threshold: 50000, item: '新しいスマートフォン', icon: '📱' },
  { threshold: 70000, item: '韓国旅行（2泊3日）', icon: '✈️' },
  { threshold: 100000, item: 'Nintendo Switch + ゲーム10本', icon: '🎮' },
  { threshold: 150000, item: 'ヨーロッパ旅行（5日間）', icon: '🏰' }
] as const;

export const FREQUENCY_MULTIPLIERS = {
  daily: 1.0,    // Getting full value
  weekly: 0.7,   // Getting good value  
  monthly: 0.4,  // Getting some value
  unused: 0.0    // Getting no value (100% waste)
} as const;

export const WASTE_RATE_THRESHOLDS = {
  LOW: 20,      // Below 20% waste is considered low
  MEDIUM: 50    // 20-50% is medium, above 50% is high
} as const;

export const COLORS = {
  LOW_WASTE: {
    primary: '#10B981',     // Green
    secondary: '#34D399',
    background: '#ECFDF5'
  },
  MEDIUM_WASTE: {
    primary: '#F59E0B',     // Yellow
    secondary: '#FBBF24',
    background: '#FFFBEB'
  },
  HIGH_WASTE: {
    primary: '#EF4444',     // Red
    secondary: '#F87171',
    background: '#FEF2F2'
  },
  DEFAULT: {
    primary: '#6B7280',
    secondary: '#9CA3AF',
    background: '#F9FAFB'
  }
} as const;