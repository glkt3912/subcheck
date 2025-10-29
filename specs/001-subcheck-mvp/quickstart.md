# QuickStart Guide: SubCheck Development

**Created**: 2025-10-29  
**Feature**: SubCheck Subscription Diagnostic Service  
**Target**: Developers setting up the project

## Prerequisites

- Node.js 18.0+ and npm 9.0+
- Modern web browser for testing
- Code editor with TypeScript support

## Project Setup

### 1. Dependencies Installation

```bash
# Core dependencies (if not already installed)
npm install next@14+ react@18+ react-dom@18+ typescript@5+

# UI and Styling
npm install @tailwindcss/forms @tailwindcss/typography
npm install lucide-react  # For icons
npm install recharts       # For chart visualization

# Development and Testing
npm install -D vitest @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/dom @testing-library/user-event
npm install -D vitest-localstorage-mock
npm install -D @types/node
```

### 2. Configuration Files

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
```

Create `vitest.setup.ts`:
```typescript
import 'vitest-localstorage-mock'
import '@testing-library/jest-dom'

// Mock window.location for social sharing tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000'
  },
  writable: true
})
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:watch": "vitest --watch"
  }
}
```

## Development Workflow

### 1. Project Structure Setup

```bash
# Create core directories
mkdir -p app/diagnosis/{select,usage,results}
mkdir -p components/{ui,forms,charts,shared}
mkdir -p lib/{data,calculations,storage,utils}
mkdir -p types
mkdir -p __tests__/{components,lib,integration}
```

### 2. Start Development Server

```bash
npm run dev
```

Access the application at `http://localhost:3000`

### 3. Run Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

## Key Development Patterns

### 1. Component Development

Follow this pattern for React components:

```typescript
// components/forms/SubscriptionSelector.tsx
import { useState } from 'react'
import { Subscription, UserSubscription } from '@/types'

interface SubscriptionSelectorProps {
  subscriptions: Subscription[]
  onSelectionChange: (selected: UserSubscription[]) => void
  initialSelection?: UserSubscription[]
}

export default function SubscriptionSelector({
  subscriptions,
  onSelectionChange,
  initialSelection = []
}: SubscriptionSelectorProps) {
  // Component implementation
}
```

### 2. Service Implementation

Use dependency injection for testability:

```typescript
// lib/services/SubscriptionService.ts
import { Subscription, SubscriptionCategory } from '@/types'
import { StorageService } from './StorageService'

export class SubscriptionService {
  constructor(private storage: StorageService) {}
  
  async getAllSubscriptions(): Promise<Subscription[]> {
    // Implementation
  }
}
```

### 3. Custom Hooks

Create reusable hooks for state management:

```typescript
// lib/hooks/useDiagnosisSession.ts
import { useState, useEffect } from 'react'
import { DiagnosisSession } from '@/types'
import { StorageService } from '@/lib/services'

export function useDiagnosisSession() {
  const [session, setSession] = useState<DiagnosisSession | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Hook implementation
  
  return { session, loading, updateSession, clearSession }
}
```

### 4. Testing Strategy

Write tests for each component and service:

```typescript
// __tests__/components/SubscriptionSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import SubscriptionSelector from '@/components/forms/SubscriptionSelector'
import { createMockSubscription } from '../helpers/testData'

describe('SubscriptionSelector', () => {
  it('should render subscription options', () => {
    const mockSubscriptions = [createMockSubscription()]
    render(
      <SubscriptionSelector
        subscriptions={mockSubscriptions}
        onSelectionChange={vi.fn()}
      />
    )
    
    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })
})
```

## Static Data Setup

### 1. Master Subscription Data

Create `lib/data/subscriptions.ts`:

```typescript
import { Subscription, SubscriptionCategory } from '@/types'

export const MASTER_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    category: SubscriptionCategory.VIDEO,
    monthlyPrice: 1590,
    logoUrl: '/logos/netflix.png',
    isPopular: true
  },
  {
    id: 'spotify',
    name: 'Spotify Premium',
    category: SubscriptionCategory.MUSIC,
    monthlyPrice: 1080,
    logoUrl: '/logos/spotify.png',
    isPopular: true
  },
  // ... other services from spec FR-001
]
```

### 2. Calculation Constants

Create `lib/calculations/constants.ts`:

```typescript
export const WASTE_MULTIPLIERS = {
  DAILY: 0,      // 0% waste
  WEEKLY: 25,    // 25% waste
  MONTHLY: 60,   // 60% waste
  UNUSED: 100    // 100% waste
} as const

export const EQUIVALENT_ITEMS = [
  { threshold: 30000, item: '国内旅行1回' },
  { threshold: 50000, item: '新しいスマートフォン' },
  { threshold: 70000, item: '海外旅行' },
  { threshold: 100000, item: 'ノートパソコン' }
] as const
```

## Performance Optimization

### 1. Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

### 2. Image Optimization

Store logos in `public/logos/` and use Next.js Image component:

```typescript
import Image from 'next/image'

<Image
  src="/logos/netflix.png"
  alt="Netflix logo"
  width={40}
  height={40}
  className="rounded"
/>
```

### 3. Code Splitting

Use dynamic imports for chart components:

```typescript
import dynamic from 'next/dynamic'

const ResultsChart = dynamic(
  () => import('@/components/charts/ResultsChart'),
  { ssr: false }
)
```

## Debugging and Development Tools

### 1. LocalStorage Inspector

Add to browser DevTools Console:

```javascript
// View stored data
console.log('Session:', localStorage.getItem('subcheck_session'))
console.log('Results:', localStorage.getItem('subcheck_results_history'))

// Clear all data
Object.keys(localStorage)
  .filter(key => key.startsWith('subcheck_'))
  .forEach(key => localStorage.removeItem(key))
```

### 2. Test Data Generation

Create development utilities:

```typescript
// lib/dev/testDataGenerator.ts
export function generateTestSession() {
  // Generate realistic test data for development
}

// Use in development
if (process.env.NODE_ENV === 'development') {
  // Auto-populate test data
}
```

## Deployment Checklist

- [ ] All tests passing: `npm test`
- [ ] Build successful: `npm run build`
- [ ] Performance check: Bundle size < 500KB
- [ ] Mobile responsive testing
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] LocalStorage fallback working
- [ ] Social sharing URLs functional
- [ ] Accessibility testing with screen reader

## Troubleshooting

### Common Issues

1. **LocalStorage quota exceeded**: Clear browser data or implement data cleanup
2. **Chart not rendering**: Check Recharts dependency and browser support
3. **Test failures with localStorage**: Ensure vitest-localstorage-mock is properly configured
4. **TypeScript errors**: Verify all types are properly imported and defined

### Development Server Issues

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Reset development environment
npm run dev
```