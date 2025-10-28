# SubCheck Implementation Tasks

**Feature Branch**: `001-subcheck-mvp`  
**Generated**: 2025-10-28  
**Status**: Ready for Implementation  

## Task Breakdown

### Phase 1: Project Foundation (30 minutes)

#### Task 1.1: Initialize Next.js Project

**ID**: `SUB-001`  
**Priority**: P1  
**Estimated Time**: 10 minutes  
**Dependencies**: None  

**Description**: Set up Next.js 14 project with TypeScript and Tailwind CSS

**Acceptance Criteria**:

- [ ] Next.js 14 project created with App Router
- [ ] TypeScript configured in strict mode
- [ ] Tailwind CSS installed and configured
- [ ] Basic folder structure created
- [ ] Development server runs without errors

**Implementation Steps**:

1. Run `npx create-next-app@latest . --typescript --tailwind --eslint --app`
2. Configure TypeScript strict mode
3. Set up basic folder structure (components/, lib/, types/)
4. Test development server

---

#### Task 1.2: Install and Configure shadcn/ui

**ID**: `SUB-002`  
**Priority**: P1  
**Estimated Time**: 10 minutes  
**Dependencies**: SUB-001  

**Description**: Install shadcn/ui component library for consistent UI

**Acceptance Criteria**:

- [ ] shadcn/ui initialized and configured
- [ ] Basic components installed (Button, Card, Progress)
- [ ] Tailwind config updated for shadcn/ui
- [ ] First component renders correctly

**Implementation Steps**:

1. Run `npx shadcn-ui@latest init`
2. Install required components: `npx shadcn-ui@latest add button card progress`
3. Verify components work in a test page
4. Update globals.css if needed

---

#### Task 1.3: Create TypeScript Type Definitions

**ID**: `SUB-003`  
**Priority**: P1  
**Estimated Time**: 10 minutes  
**Dependencies**: SUB-001  

**Description**: Define all TypeScript interfaces for data structures

**Acceptance Criteria**:

- [ ] Subscription interface defined
- [ ] UserSubscription interface defined  
- [ ] DiagnosisResult interface defined
- [ ] FrequencyType union type defined
- [ ] All types exported from types/index.ts

**Implementation File**: `src/types/index.ts`

---

### Phase 2: Master Data and Core Logic (20 minutes)

#### Task 2.1: Create Subscription Master Data

**ID**: `SUB-004`  
**Priority**: P1  
**Estimated Time**: 15 minutes  
**Dependencies**: SUB-003  

**Description**: Implement the 10 main subscription services with 2024-2025 pricing

**Acceptance Criteria**:

- [ ] 10 subscription services defined with accurate pricing
- [ ] Services categorized (video/music/digital)
- [ ] Market share and popularity data included
- [ ] Data access functions implemented
- [ ] Data validation added

**Implementation File**: `src/lib/subscriptions.ts`

**Services to Include**:

1. Amazon Prime Video (600円)
2. Netflix (1,590円)
3. U-NEXT (2,189円)
4. Disney+ (990円)
5. Spotify (1,080円)
6. Apple Music (1,080円)
7. YouTube Music (1,080円)
8. YouTube Premium (1,280円)
9. PlayStation Plus (1,300円)
10. Kindle Unlimited (980円)

---

#### Task 2.2: Implement Diagnosis Calculator

**ID**: `SUB-005`  
**Priority**: P1  
**Estimated Time**: 5 minutes  
**Dependencies**: SUB-003, SUB-004  

**Description**: Create logic to calculate waste rate and annual waste amount

**Acceptance Criteria**:

- [ ] Waste rate calculation (0-100%)
- [ ] Annual waste amount calculation
- [ ] Frequency multiplier logic (daily: 1.0, weekly: 0.7, monthly: 0.4, unused: 0.0)
- [ ] Comparison examples generation
- [ ] Unit tests for calculation accuracy

**Implementation File**: `src/lib/calculator.ts`

---

### Phase 3: Page Components (45 minutes)

#### Task 3.1: Create Landing Page

**ID**: `SUB-006`  
**Priority**: P1  
**Estimated Time**: 15 minutes  
**Dependencies**: SUB-002  

**Description**: Build the landing page with hero section and diagnosis start

**Acceptance Criteria**:

- [ ] Hero section with catchphrase "そのサブスク、本当に使ってる？"
- [ ] Service description section
- [ ] "診断開始" CTA button
- [ ] Responsive design (mobile-first)
- [ ] Smooth navigation to selection page

**Implementation File**: `src/app/page.tsx`

---

#### Task 3.2: Create Subscription Selection Page

**ID**: `SUB-007`  
**Priority**: P1  
**Estimated Time**: 20 minutes  
**Dependencies**: SUB-002, SUB-004  

**Description**: Build subscription selection interface with categories

**Acceptance Criteria**:

- [ ] Service cards grouped by category (video/music/digital)
- [ ] Multiple selection functionality
- [ ] Progress indicator (Step 1/3)
- [ ] Service cards show name, price, and logo placeholder
- [ ] "Next" button enabled only when services selected
- [ ] Responsive grid layout

**Implementation Files**:

- `src/app/select/page.tsx`
- `src/components/SubscriptionCard.tsx`
- `src/components/ProgressBar.tsx`

---

#### Task 3.3: Create Frequency Input Page

**ID**: `SUB-008`  
**Priority**: P1  
**Estimated Time**: 10 minutes  
**Dependencies**: SUB-007  

**Description**: Build usage frequency selection interface

**Acceptance Criteria**:

- [ ] 4 frequency options with descriptive labels and icons
- [ ] One selection per service required
- [ ] Progress indicator (Step 2/3)
- [ ] Visual feedback for selected options
- [ ] "Next" button enabled when all frequencies selected

**Implementation Files**:

- `src/app/frequency/page.tsx`
- `src/components/FrequencySelector.tsx`

**Frequency Options**:

- 📅 毎日使う (daily)
- 📆 週に1-2回 (weekly)  
- 📌 月に1-2回 (monthly)
- ❌ ほとんど使ってない (unused)

---

### Phase 4: Results and Visualization (25 minutes)

#### Task 4.1: Create Results Page with Chart

**ID**: `SUB-009`  
**Priority**: P1  
**Estimated Time**: 20 minutes  
**Dependencies**: SUB-005, SUB-008  

**Description**: Build diagnosis results page with pie chart visualization

**Acceptance Criteria**:

- [ ] Waste rate prominently displayed (e.g., "無駄率: 45%")
- [ ] Pie chart showing frequency breakdown
- [ ] Annual waste amount with comparison examples
- [ ] Monthly/yearly totals displayed
- [ ] Recommendations for unused services
- [ ] Responsive layout

**Implementation Files**:

- `src/app/result/page.tsx`
- `src/components/ResultChart.tsx`

**Required Libraries**: Install Recharts (`npm install recharts`)

---

#### Task 4.2: Implement Local Storage

**ID**: `SUB-010`  
**Priority**: P2  
**Estimated Time**: 5 minutes  
**Dependencies**: SUB-009  

**Description**: Save and load user selections using localStorage

**Acceptance Criteria**:

- [ ] User selections automatically saved
- [ ] Data persists across browser sessions
- [ ] Graceful handling of localStorage unavailability
- [ ] Clear data functionality

**Implementation File**: `src/lib/storage.ts`

---

### Phase 5: Social Features (10 minutes)

#### Task 5.1: Add SNS Share Functionality

**ID**: `SUB-011`  
**Priority**: P2  
**Estimated Time**: 10 minutes  
**Dependencies**: SUB-009  

**Description**: Add Twitter/X and LINE sharing capabilities

**Acceptance Criteria**:

- [ ] Twitter/X share button with pre-filled text
- [ ] LINE share button with pre-filled text
- [ ] Share text includes waste rate and compelling message
- [ ] Share buttons styled consistently
- [ ] Analytics tracking for share events

**Implementation File**: `src/components/ShareButtons.tsx`

**Share Text Template**:

```
私のサブスク無駄率は{wasteRate}%でした😱 年間{wasteAmount}円も無駄にしてた...！ #サブチェック #サブスク診断 https://subcheck.app
```

---

### Phase 6: Polish and Optimization (10 minutes)

#### Task 6.1: Performance Optimization

**ID**: `SUB-012`  
**Priority**: P3  
**Estimated Time**: 5 minutes  
**Dependencies**: All previous tasks  

**Description**: Optimize performance to meet success criteria

**Acceptance Criteria**:

- [ ] Lazy loading for non-critical components
- [ ] Image optimization for service logos
- [ ] Bundle size analysis and optimization
- [ ] Loading states for async operations

---

#### Task 6.2: Final Testing and Bug Fixes

**ID**: `SUB-013`  
**Priority**: P1  
**Estimated Time**: 5 minutes  
**Dependencies**: All previous tasks  

**Description**: Comprehensive testing and bug fixes

**Acceptance Criteria**:

- [ ] Complete user journey tested (start to share)
- [ ] Mobile responsive testing on various devices
- [ ] Cross-browser compatibility (Chrome, Safari, Firefox)
- [ ] Error handling for edge cases
- [ ] Performance metrics validation

---

## Implementation Order

### Recommended Sequence

1. **Foundation**: SUB-001 → SUB-002 → SUB-003
2. **Data Layer**: SUB-004 → SUB-005  
3. **User Interface**: SUB-006 → SUB-007 → SUB-008 → SUB-009
4. **Features**: SUB-010 → SUB-011
5. **Polish**: SUB-012 → SUB-013

### Parallel Opportunities

- SUB-004 and SUB-005 can be developed in parallel
- SUB-010 and SUB-011 can be developed in parallel
- SUB-012 can be done incrementally throughout development

## Success Criteria Validation

Each task includes specific acceptance criteria that map to the overall success criteria:

- **SC-001** (3-minute completion): Validated through Tasks SUB-006 to SUB-009
- **SC-002** (2-second result display): Validated through Task SUB-009 and SUB-012
- **SC-003** (90% mobile completion): Validated through responsive design in all UI tasks
- **SC-004** (15% share rate): Enabled through Task SUB-011
- **SC-005** (accurate calculation): Validated through Task SUB-005 with unit tests
