# Research: SubCheck Technical Decisions

**Created**: 2025-10-29  
**Purpose**: Resolve technical clarifications for SubCheck implementation

## Testing Framework Selection

### Decision: Vitest + React Testing Library

### Rationale: 
Vitest + React Testing Library is the optimal choice for the Next.js 14+ TypeScript client-side application:

- **Performance**: 4x faster test execution compared to Jest with near-instant startup times
- **Modern Integration**: Official Next.js 14+ support with native TypeScript 5.x support
- **Developer Experience**: Jest-compatible API with superior debugging capabilities
- **LocalStorage Testing**: Built-in mocking capabilities with `vitest-localstorage-mock`
- **Setup Simplicity**: Zero-config setup for JSX, TSX, and PostCSS

### Alternatives Considered:
- **Jest + React Testing Library**: Mature but slower performance, more complex Next.js 14 setup
- **Bun Test**: Extremely fast but still experimental with limited React ecosystem support
- **Playwright**: Excellent for E2E but not suitable for unit/component testing

## Chart Library Selection

### Decision: Recharts

### Rationale:
For circular chart visualization (FR-006 requirement):

- **React Native**: Built specifically for React applications
- **TypeScript Support**: Full TypeScript definitions included
- **Lightweight**: Smaller bundle size compared to Chart.js
- **Customization**: Easy styling and responsive design
- **Next.js Compatibility**: Works seamlessly with Next.js SSR/CSR

### Alternatives Considered:
- **Chart.js**: More features but larger bundle size and requires React wrapper
- **Victory**: Good alternative but heavier and more complex for simple pie charts
- **D3.js**: Most powerful but overkill for simple circular charts

## State Management

### Decision: React useState + LocalStorage utilities

### Rationale:
For the simple multi-step form flow:

- **Simplicity**: No external state management library needed
- **Performance**: Minimal overhead for small application scope
- **Persistence**: LocalStorage integration for data persistence
- **Type Safety**: Full TypeScript support with custom hooks

### Alternatives Considered:
- **Zustand**: Lightweight but unnecessary for simple form state
- **Redux Toolkit**: Overkill for client-side only application
- **Context API**: Could cause unnecessary re-renders for this use case

## Japanese Localization

### Decision: Static Japanese text with number formatting utilities

### Rationale:
- **Scope**: Application is Japan-specific, no internationalization needed
- **Performance**: No i18n library overhead
- **Maintenance**: Simpler codebase with direct Japanese text
- **Number Formatting**: Use Intl.NumberFormat for currency display

### Alternatives Considered:
- **react-i18next**: Unnecessary overhead for single-language app
- **next-intl**: Good choice but not needed for Japan-only application

## Mobile Optimization

### Decision: Tailwind CSS responsive design with mobile-first approach

### Rationale:
- **Performance**: Matches existing project setup
- **Mobile-first**: Responsive design starting from mobile breakpoints
- **Touch Optimization**: Larger touch targets for better UX
- **PWA Ready**: Foundation for potential PWA conversion

### Implementation Notes:
- Use `sm:`, `md:`, `lg:` breakpoints for responsive design
- Minimum 44px touch targets for mobile buttons
- Optimize chart responsiveness for small screens
- Consider iOS Safari viewport height issues

## Browser Storage Strategy

### Decision: LocalStorage with JSON serialization and error handling

### Rationale:
- **Persistence**: Data survives browser sessions
- **Privacy**: No server transmission required (FR-008)
- **Compatibility**: Supported in all target browsers
- **Capacity**: Sufficient for subscription selection data (~5KB typical)

### Implementation Strategy:
```typescript
// Graceful fallback for storage failures
// Validation for data integrity
// Cleanup for old/invalid data
// TypeScript interfaces for stored data
```

### Alternatives Considered:
- **SessionStorage**: Lost on tab close, not suitable for multi-session workflows
- **IndexedDB**: Overkill for simple key-value storage needs
- **Cookies**: Size limitations and automatic server transmission conflicts with privacy requirement