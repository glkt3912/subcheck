# SubCheck Implementation Plan

**Feature Branch**: `001-subcheck-mvp`  
**Created**: 2025-10-28  
**Status**: Ready for Implementation  
**Based on**: SPECIFICATION.md + research data

## Technical Architecture

### Technology Stack

#### Frontend Framework

- **Next.js 14**: App Router for modern React development
- **TypeScript**: Strict mode for type safety
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components

#### Data Visualization

- **Recharts**: React charts library for pie charts and visualizations
- **Lucide React**: Icon library for UI elements

#### State Management

- **React useState/useReducer**: Built-in state management
- **Local Storage**: Browser-native persistence (no server required)

#### Build & Development

- **ESLint + Prettier**: Code quality and formatting
- **TypeScript**: Type checking and IntelliSense

### Project Structure

```
subcheck/
├── research/                     # Market analysis (completed)
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Landing page
│   │   ├── select/
│   │   │   └── page.tsx         # Subscription selection
│   │   ├── frequency/
│   │   │   └── page.tsx         # Usage frequency input
│   │   ├── result/
│   │   │   └── page.tsx         # Diagnosis results
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── SubscriptionCard.tsx # Service selection card
│   │   ├── FrequencySelector.tsx# Usage frequency selector
│   │   ├── ResultChart.tsx      # Pie chart visualization
│   │   ├── ShareButtons.tsx     # SNS share components
│   │   └── ProgressBar.tsx      # Step progress indicator
│   ├── lib/
│   │   ├── subscriptions.ts     # Master data (10 services)
│   │   ├── calculator.ts        # Diagnosis logic
│   │   ├── storage.ts           # localStorage management
│   │   └── utils.ts             # Utility functions
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── data/
│       └── subscriptions.json   # Service master data
└── package.json
```

## Data Architecture

### Master Data (10 Services)

Based on Japanese market research (2024-2025 pricing):

```typescript
interface Subscription {
  id: string;
  name: string;
  category: 'video' | 'music' | 'digital';
  price: number;                    // Representative price
  priceRange: { min: number; max: number; };
  logo: string;
  description: string;
  marketShare: string;
  popularityRank: number;
}

const MASTER_DATA: Subscription[] = [
  {
    id: "amazon-prime-video",
    name: "Amazon Prime Video", 
    category: "video",
    price: 600,
    priceRange: { min: 492, max: 990 },
    marketShare: "国内シェア44.7%",
    popularityRank: 1
  },
  {
    id: "netflix",
    name: "Netflix",
    category: "video", 
    price: 1590,
    priceRange: { min: 890, max: 2290 },
    marketShare: "2位シェア",
    popularityRank: 2
  },
  // ... 8 more services
];
```

### User Data Structure

```typescript
type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'unused';

interface UserSubscription {
  subscriptionId: string;
  frequency: FrequencyType;
  selectedAt: Date;
}

interface DiagnosisResult {
  subscriptions: UserSubscription[];
  totals: {
    monthly: number;
    yearly: number;
    unusedYearly: number;
  };
  wasteRate: number;              // 0-100%
  frequencyBreakdown: {
    daily: number;
    weekly: number; 
    monthly: number;
    unused: number;
  };
  comparisonItems: ComparisonItem[];
  createdAt: Date;
}
```

## Implementation Strategy

### Phase-1 Gate (Constitution Compliance)

#### Simplicity Gate (Section VII)

- ✅ Using minimal dependencies (Next.js, Tailwind, Recharts only)
- ✅ Direct framework usage (no unnecessary wrappers)
- ✅ Single project structure

#### Reality Gate  

- ✅ Real user data (localStorage, no mocks)
- ✅ Actual service pricing (market research based)
- ✅ Real browser APIs for sharing

### Development Phases

#### Phase 1: Core Structure (30 min)

1. **Next.js Project Setup**
   - Initialize with TypeScript + Tailwind
   - Configure shadcn/ui
   - Set up basic routing structure

2. **Master Data Implementation**
   - Create subscription master data
   - Implement TypeScript types
   - Set up data access layer

#### Phase 2: UI Components (45 min)

3. **Landing Page**
   - Hero section with catchphrase
   - Start diagnosis CTA
   - Service introduction

4. **Subscription Selection**
   - Category-based service cards
   - Multiple selection UI
   - Progress indicator

5. **Frequency Input**
   - 4-level frequency selector
   - Visual frequency cards
   - Form validation

#### Phase 3: Core Logic (30 min)

6. **Diagnosis Calculator**
   - Waste rate calculation logic
   - Annual waste amount computation
   - Comparison examples generation

7. **Results Visualization**
   - Pie chart with Recharts
   - Breakdown display
   - Action recommendations

#### Phase 4: Additional Features (15 min)

8. **Local Storage**
   - Save/load user selections
   - Diagnosis history
   - Data persistence

9. **SNS Sharing**
   - Twitter/X share integration
   - LINE share functionality
   - OG image generation

## Performance Requirements

### Loading Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s  
- **Time to Interactive**: < 3s

### Runtime Performance

- **Diagnosis calculation**: < 100ms
- **Chart rendering**: < 500ms
- **Page transitions**: < 200ms

### Mobile Optimization

- **Touch targets**: ≥ 44px
- **Viewport adaptation**: 375px - 1920px
- **Responsive breakpoints**: sm(640px), md(768px), lg(1024px)

## Risk Mitigation

### Technical Risks

1. **Chart rendering performance**: Use React.memo for optimization
2. **Mobile touch interactions**: Test on actual devices
3. **localStorage limitations**: Implement error handling

### UX Risks  

1. **Complex service selection**: Group by categories
2. **Unclear frequency options**: Use descriptive labels
3. **Overwhelming results**: Progressive disclosure

## Quality Assurance

### Testing Strategy

1. **Unit Tests**: Calculator logic verification
2. **Integration Tests**: Component interaction
3. **E2E Tests**: Complete user journey
4. **Manual Testing**: Cross-browser and device testing

### Success Metrics Validation

- **SC-001**: 3-minute completion time tracking
- **SC-002**: 2-second result display measurement  
- **SC-003**: Mobile completion rate analytics
- **SC-004**: Share button click tracking
- **SC-005**: Calculator accuracy unit tests

## Deployment Strategy

### Development Environment

- **Local Development**: Next.js dev server
- **Preview Builds**: Vercel preview deployments
- **Production**: Vercel production deployment

### Configuration

- **Environment Variables**: None required (client-side only)
- **Build Optimization**: Static generation where possible
- **Asset Optimization**: Next.js automatic optimization

This plan provides a comprehensive roadmap for implementing the SubCheck MVP while maintaining high quality and performance standards.
